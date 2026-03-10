import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCharacterSchema = z.object({
  name: z.string().min(1).max(20),
  type: z.enum(['WARRIOR', 'MAGE', 'ARCHER', 'HEALER']),
})

// GET /api/character：キャラクター情報取得
export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  const character = await prisma.character.findUnique({
    where: { userId: user.id }
  })

  // キャラクターが存在しない場合（オンボーディング未完了）
  if (!character) {
    return NextResponse.json({ error: 'CHARACTER_NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ character })
}

// POST /api/character：キャラクター初期作成
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  // すでにキャラクターが存在する場合は作成できない
  const existing = await prisma.character.findUnique({
    where: { userId: user.id }
  })
  if (existing) {
    return NextResponse.json(
      { error: 'CHARACTER_ALREADY_EXISTS' },
      { status: 409 }
    )
  }

  const body = await req.json()
  const result = createCharacterSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    )
  }

  // キャラクターを作成する（初期ステータスはすべてデフォルト値）
  const character = await prisma.character.create({
    data: {
      userId: user.id,
      name:   result.data.name,
      type:   result.data.type,
    }
  })

  return NextResponse.json({ character }, { status: 201 })
}