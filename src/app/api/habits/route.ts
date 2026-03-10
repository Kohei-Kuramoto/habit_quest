import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createHabitSchema = z.object({
  title:       z.string().min(1).max(50),
  icon:        z.string().optional(),
  frequency:   z.enum(['DAILY', 'WEEKLY']),
  daysOfWeek:  z.array(z.number()).optional(),
  xpReward:    z.number().min(1).max(100).optional(),
  description: z.string().optional(),
})

// GET /api/habits：習慣一覧取得
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

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json({ habits })
}

// POST /api/habits：習慣新規作成
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

  const body = await req.json()
  const result = createHabitSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const habit = await prisma.habit.create({
    data: {
      userId:      user.id,
      title:       result.data.title,
      icon:        result.data.icon,
      frequency:   result.data.frequency,
      daysOfWeek:  result.data.daysOfWeek ?? [],
      xpReward:    result.data.xpReward ?? 10,
      description: result.data.description,
    }
  })

  return NextResponse.json({ habit }, { status: 201 })
}