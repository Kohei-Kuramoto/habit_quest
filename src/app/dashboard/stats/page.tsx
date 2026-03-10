import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) redirect("/login");

  // 過去365日分のログを取得する
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const logs = await prisma.habitLog.findMany({
    where: {
      userId: user.id,
      completedAt: { gte: oneYearAgo },
    },
    include: { habit: true },
    orderBy: { completedAt: "asc" },
  });

  // 統計データを計算する
  const totalCheckins = logs.length;
  const { currentStreak, longestStreak } = calcStreaks(logs);
  const weeklyRate = calcWeeklyRate(logs);
  const totalXp = logs.reduce((sum, log) => sum + log.xpEarned, 0);

  // 習慣ごとのチェックイン数を集計する
  const habitStats = logs.reduce(
    (acc, log) => {
      const title = log.habit.title;
      const icon = log.habit.icon ?? "⚔️";
      if (!acc[title]) acc[title] = { title, icon, count: 0, xp: 0 };
      acc[title].count++;
      acc[title].xp += log.xpEarned;
      return acc;
    },
    {} as Record<
      string,
      { title: string; icon: string; count: number; xp: number }
    >,
  );

  const habitStatsArray = Object.values(habitStats).sort(
    (a, b) => b.count - a.count,
  );

  // 過去7日間のデータを作成する
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split("T")[0];
    const count = logs.filter(
      (l) => l.completedAt.toISOString().split("T")[0] === dateStr,
    ).length;
    return {
      date: dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count,
    };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">統計</h1>
        <p className="text-slate-400 mt-1">あなたの習慣の記録</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "総チェックイン数",
            value: totalCheckins,
            unit: "回",
            emoji: "✅",
          },
          {
            label: "現在の連続日数",
            value: currentStreak,
            unit: "日",
            emoji: "🔥",
          },
          {
            label: "最長連続日数",
            value: longestStreak,
            unit: "日",
            emoji: "🏆",
          },
          { label: "獲得XP合計", value: totalXp, unit: "XP", emoji: "⭐" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4"
          >
            <p className="text-2xl mb-2">{stat.emoji}</p>
            <p className="text-white font-bold text-2xl">
              {stat.value}
              <span className="text-sm font-normal text-slate-400 ml-1">
                {stat.unit}
              </span>
            </p>
            <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 過去7日間のグラフ */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-6">
          過去7日間のチェックイン
        </h2>
        <div className="flex items-end gap-3 h-32">
          {last7Days.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div
                className="w-full flex items-end justify-center"
                style={{ height: "80px" }}
              >
                <div
                  className="w-full bg-indigo-500/80 rounded-t-lg transition-all duration-500"
                  style={{
                    height:
                      day.count > 0
                        ? `${Math.round((day.count / maxCount) * 80)}px`
                        : "4px",
                    opacity: day.count > 0 ? 1 : 0.3,
                  }}
                />
              </div>
              <p className="text-slate-400 text-xs">{day.label}</p>
              <p className="text-white text-xs font-medium">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 習慣ごとの統計 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-6">
          習慣別チェックイン数
        </h2>
        {habitStatsArray.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-400 text-sm">まだデータがありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habitStatsArray.map((habit) => (
              <div key={habit.title}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className="text-white font-medium">
                      {habit.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-indigo-400 text-sm">
                      +{habit.xp}XP
                    </span>
                    <span className="text-slate-400 text-sm">
                      {habit.count}回
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((habit.count / (habitStatsArray[0]?.count ?? 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 連続日数を計算する関数
function calcStreaks(logs: { completedAt: Date }[]) {
  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dates = [
    ...new Set(logs.map((l) => l.completedAt.toISOString().split("T")[0])),
  ].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, streak);

  const lastDate = new Date(dates[dates.length - 1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isActive =
    lastDate.getTime() === today.getTime() ||
    lastDate.getTime() === yesterday.getTime();

  currentStreak = isActive ? streak : 0;

  return { currentStreak, longestStreak };
}

// 今週の達成率を計算する関数
function calcWeeklyRate(logs: { completedAt: Date }[]) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyLogs = logs.filter((l) => l.completedAt >= weekAgo);
  if (weeklyLogs.length === 0) return 0;
  const checkedDays = new Set(
    weeklyLogs.map((l) => l.completedAt.toISOString().split("T")[0]),
  ).size;
  return Math.round((checkedDays / 7) * 100);
}
