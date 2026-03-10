import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { character: true }
  })
  if (!user?.character) {
    return NextResponse.json({ error: 'CHARACTER_NOT_FOUND' }, { status: 404 })
  }

  const body = await req.json()
  const { habitTitle, xpEarned } = body

  // プロンプトを作成する
  const prompt = `
あなたはRPGゲーム「HabitQuest」のナビゲーターキャラクターです。
プレイヤーが習慣を達成したので、日本語で短い励ましメッセージを送ってください。

プレイヤー情報：
- キャラクター名：${user.character.name}
- レベル：${user.character.level}
- 達成した習慣：${habitTitle}
- 獲得XP：${xpEarned}XP

条件：
- 2〜3文で短くまとめる
- RPG風の言葉遣いで元気よく
- キャラクター名を呼びかけに使う
- 絵文字を1〜2個使う
`

  try {
    // ストリーミングでメッセージを生成する
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const result = await model.generateContentStream(prompt)

    // ストリーミングレスポンスを返す
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })

  } catch (e) {
    console.error('Gemini APIエラー:', e)
    return NextResponse.json({ error: 'AI_ERROR' }, { status: 500 })
  }
}