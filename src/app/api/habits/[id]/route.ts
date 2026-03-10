import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateHabitSchema = z.object({
  title:       z.string().min(1).max(50).optional(),
  icon:        z.string().optional(),
  frequency:   z.enum(['DAILY', 'WEEKLY']).optional(),
  daysOfWeek:  z.array(z.number()).optional(),
  xpReward:    z.number().min(1).max(100).optional(),
  isActive:    z.boolean().optional(),
  description: z.string().optional(),
})

// 認証とリソースの所有確認をまとめた関数
async function getAuthenticatedUser(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

// PATCH /api/habits/[id]：習慣更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await getAuthenticatedUser(session.user.email)
  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  const { id } = await params

  // 習慣が存在するか確認する
  const habit = await prisma.habit.findUnique({ where: { id } })
  if (!habit) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  // 自分の習慣かどうか確認する
  if (habit.userId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const result = updateHabitSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: result.data,
  })

  return NextResponse.json({ habit: updated })
}

// DELETE /api/habits/[id]：習慣削除（アーカイブ）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await getAuthenticatedUser(session.user.email)
  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  const { id } = await params

  const habit = await prisma.habit.findUnique({ where: { id } })
  if (!habit) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  if (habit.userId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // 物理削除ではなくisActiveをfalseにするアーカイブ処理
  await prisma.habit.update({
    where: { id },
    data: { isActive: false }
  })

  return NextResponse.json({ message: 'archived' })
}