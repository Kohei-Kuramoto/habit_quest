import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      character: true,
      habits: { where: { isActive: true } },
      habitLogs: true,
    },
  });
  if (!user) redirect("/login");

  const totalCheckins = user.habitLogs.length;
  const totalXp = user.habitLogs.reduce(
    (sum: number, log: { xpEarned: number }) => sum + log.xpEarned,
    0,
  );
  const activeHabits = user.habits.length;

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">プロフィール</h1>
        <p className="text-slate-400 mt-1">あなたの冒険者情報</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ユーザー情報 */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-6">アカウント情報</h2>
          <div className="flex items-center gap-4 mb-6">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="プロフィール画像"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            <div>
              <p className="text-white font-bold text-xl">
                {session.user.name}
              </p>
              <p className="text-slate-400 text-sm">{session.user.email}</p>
            </div>
          </div>

          {/* 統計サマリー */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "チェックイン", value: totalCheckins, unit: "回" },
              { label: "アクティブ習慣", value: activeHabits, unit: "個" },
              { label: "獲得XP", value: totalXp, unit: "XP" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-700/50 rounded-xl p-3 text-center"
              >
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* キャラクター情報 */}
        {user.character && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-6">
              キャラクター情報
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-4xl">
                {user.character.type === "WARRIOR" && "⚔️"}
                {user.character.type === "MAGE" && "🔮"}
                {user.character.type === "ARCHER" && "🏹"}
                {user.character.type === "HEALER" && "💚"}
              </div>
              <div>
                <p className="text-white font-bold text-xl">
                  {user.character.name}
                </p>
                <p className="text-slate-400 text-sm">
                  {user.character.type === "WARRIOR" && "戦士"}
                  {user.character.type === "MAGE" && "魔法使い"}
                  {user.character.type === "ARCHER" && "弓使い"}
                  {user.character.type === "HEALER" && "癒し手"}
                  　Level {user.character.level}
                </p>
              </div>
            </div>

            {/* ステータス */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">HP</span>
                  <span className="text-slate-300">
                    {user.character.hp} / {user.character.maxHp}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{
                      width: `${Math.round((user.character.hp / user.character.maxHp) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">EXP</span>
                  <span className="text-slate-300">
                    {user.character.xp} / {user.character.xpToNext}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                    style={{
                      width: `${Math.round((user.character.xp / user.character.xpToNext) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
