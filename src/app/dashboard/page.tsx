import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CharacterCard from "@/components/CharacterCard";
import StatsCard from "@/components/StatsCard";
import TodayHabits from "@/components/TodayHabits";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      character: true, // キャラクター情報も一緒に取得する
      habits: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // キャラクターが存在しない場合はオンボーディングへ
  if (!user?.character) {
    redirect("/onboarding");
  }

  // 今日のチェックイン済み習慣を取得する
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLogs = await prisma.habitLog.findMany({
    where: {
      userId: user.id,
      completedAt: today,
    },
  });

  // チェックイン済みの習慣IDのセットを作る
  const completedHabitIds = new Set(
    todayLogs.map((log: { habitId: string }) => log.habitId),
  );

  // 習慣リストにisCompletedを追加する
  const habitsWithStatus = user.habits.map((habit) => ({
    ...habit,
    isCompleted: completedHabitIds.has(habit.id),
  }));

  // 統計データを計算する
  const allLogs = await prisma.habitLog.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "asc" },
  });

  const totalCheckins = allLogs.length;
  const weeklyRate = calcWeeklyRate(allLogs);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          おかえり、{session.user.name}さん！ 👋
        </h1>
        <p className="text-slate-400 mt-1">
          今日も習慣を続けてキャラクターを強くしよう
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CharacterCard
          name={user.character.name}
          type={user.character.type}
          level={user.character.level}
          hp={user.character.hp}
          maxHp={user.character.maxHp}
          xp={user.character.xp}
          xpToNext={user.character.xpToNext}
          status={user.character.status as "HEALTHY" | "TIRED" | "CRITICAL"}
        />
        <StatsCard
          totalCheckins={totalCheckins}
          currentStreak={0}
          longestStreak={0}
          weeklyRate={weeklyRate}
        />
        <div className="lg:col-span-2">
          <TodayHabits habits={habitsWithStatus} />
        </div>
      </div>
    </div>
  );
}

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
