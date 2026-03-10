import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/stats：統計データ取得
export async function GET(req: NextRequest) {
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

  // 過去365日分のログを取得する
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const logs = await prisma.habitLog.findMany({
    where: {
      userId:      user.id,
      completedAt: { gte: oneYearAgo }
    },
    orderBy: { completedAt: 'asc' }
  })

  // 総チェックイン数
  const totalCheckins = logs.length

  // 連続日数を計算する
  const { currentStreak, longestStreak } = calcStreaks(logs)

  // 今週の達成率を計算する
  const weeklyRate = calcWeeklyRate(logs)

  // XP履歴（グラフ用）
  const xpHistory = logs.map(log => ({
    date:     log.completedAt,
    xp:       log.xpEarned,
  }))

  return NextResponse.json({
    totalCheckins,
    currentStreak,
    longestStreak,
    weeklyRate,
    xpHistory,
  })
}

// 連続日数を計算する関数
function calcStreaks(logs: { completedAt: Date }[]) {
  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // 日付の重複を除去して配列にする
  const dates = [...new Set(
    logs.map(l => l.completedAt.toISOString().split('T')[0])
  )].sort()

  let currentStreak = 0
  let longestStreak = 0
  let streak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diff === 1) {
      // 前日と連続している
      streak++
    } else {
      // 連続が途切れた
      longestStreak = Math.max(longestStreak, streak)
      streak = 1
    }
  }

  longestStreak = Math.max(longestStreak, streak)

  // 今日または昨日までチェックインしていれば現在の連続日数とする
  const lastDate = new Date(dates[dates.length - 1])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isActive =
    lastDate.getTime() === today.getTime() ||
    lastDate.getTime() === yesterday.getTime()

  currentStreak = isActive ? streak : 0

  return { currentStreak, longestStreak }
}

// 今週の達成率を計算する関数
function calcWeeklyRate(logs: { completedAt: Date }[]) {
  const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weeklyLogs = logs.filter(l => l.completedAt >= weekAgo)

  if (weeklyLogs.length === 0) return 0

  // 過去7日間のうち何日チェックインしたか
  const checkedDays = new Set(
    weeklyLogs.map(l => l.completedAt.toISOString().split('T')[0])
  ).size

  return Math.round((checkedDays / 7) * 100)
}