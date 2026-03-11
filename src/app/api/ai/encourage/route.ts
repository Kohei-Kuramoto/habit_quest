import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  const prompt = `あなたはRPGゲーム「HabitQuest」のナビゲーターキャラクターです。
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
- 絵文字を1〜2個使う`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it:free',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenRouter APIエラー:', error)
      return NextResponse.json({ error: 'AI_ERROR' }, { status: 500 })
    }

    // ストリーミングレスポンスをそのまま返す
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

          for (const line of lines) {
            const data = line.replace('data: ', '')
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const text = parsed.choices?.[0]?.delta?.content ?? ''
              if (text) {
                controller.enqueue(new TextEncoder().encode(text))
              }
            } catch {}
          }
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
    console.error('OpenRouter APIエラー:', e)
    return NextResponse.json({ error: 'AI_ERROR' }, { status: 500 })
  }
}