import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkinSchema = z.object({
  mood: z.enum(['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'TERRIBLE']),
  note: z.string().max(500).optional(),
})

// キャラクターのステータスを計算する関数
function calcCharacterStatus(hp: number, maxHp: number) {
  const ratio = hp / maxHp
  if (ratio >= 0.6) return 'HEALTHY'
  if (ratio >= 0.3) return 'TIRED'
  return 'CRITICAL'
}

// POST /api/habits/[id]/checkin：チェックイン記録
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params

  // 習慣が存在するか・自分のものか確認する
  const habit = await prisma.habit.findUnique({ where: { id } })
  if (!habit) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }
  if (habit.userId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // バリデーション
  const body = await req.json()
  const result = checkinSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    )
  }

  // 今日の日付を取得する（時間を除いた日付のみ）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 今日すでにチェックイン済みか確認する
  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_completedAt: {
        habitId: id,
        completedAt: today,
      }
    }
  })
  if (existingLog) {
    return NextResponse.json(
      { error: 'ALREADY_CHECKED_IN' },
      { status: 400 }
    )
  }

  // キャラクター情報を取得する
  const character = await prisma.character.findUnique({
    where: { userId: user.id }
  })
  if (!character) {
    return NextResponse.json(
      { error: 'CHARACTER_NOT_FOUND' },
      { status: 404 }
    )
  }

  // XPの計算
  const xpEarned = habit.xpReward
  const newXp = character.xp + xpEarned

  // レベルアップの判定
  let newLevel = character.level
  let newXpToNext = character.xpToNext
  let finalXp = newXp

  if (newXp >= character.xpToNext) {
    // レベルアップ！
    newLevel = character.level + 1
    finalXp = newXp - character.xpToNext  // 余ったXP
    newXpToNext = Math.round(character.xpToNext * 1.5)  // 次のレベルに必要なXPを1.5倍にする
  }

  // HPの回復（チェックインするとHPが回復する）
  const hpRecovery = 10
  const newHp = Math.min(character.hp + hpRecovery, character.maxHp)
  const newStatus = calcCharacterStatus(newHp, character.maxHp)

  // トランザクションで複数のDB操作をまとめて実行する
  const [log, updatedCharacter] = await prisma.$transaction([
    // チェックインログを作成する
    prisma.habitLog.create({
      data: {
        habitId:     id,
        userId:      user.id,
        completedAt: today,
        mood:        result.data.mood,
        note:        result.data.note,
        xpEarned,
      }
    }),
    // キャラクターを更新する
    prisma.character.update({
      where: { userId: user.id },
      data: {
        xp:      finalXp,
        level:   newLevel,
        xpToNext: newXpToNext,
        hp:      newHp,
        status:  newStatus,
      }
    })
  ])

  return NextResponse.json({
    log,
    character: updatedCharacter,
    levelUp: newLevel > character.level,  // レベルアップしたかどうか
  }, { status: 201 })
}