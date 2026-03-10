type CharacterCardProps = {
  name: string;
  type: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  status: "HEALTHY" | "TIRED" | "CRITICAL";
};

const characterEmoji: Record<string, string> = {
  WARRIOR: "⚔️",
  MAGE: "🔮",
  ARCHER: "🏹",
  HEALER: "💚",
};

const statusConfig = {
  HEALTHY: { label: "絶好調", color: "text-green-400", bg: "bg-green-400/10" },
  TIRED: {
    label: "お疲れ気味",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  CRITICAL: { label: "要注意", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function CharacterCard({
  name,
  type,
  level,
  hp,
  maxHp,
  xp,
  xpToNext,
  status,
}: CharacterCardProps) {
  const hpPercent = Math.round((hp / maxHp) * 100);

  const xpPercent = Math.round((xp / xpToNext) * 100);

  const statusInfo = statusConfig[status];

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">キャラクター</h2>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color} ${statusInfo.bg}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-4xl">
          {characterEmoji[type] ?? "⚔️"}
        </div>
        <div>
          <p className="text-white font-bold text-xl">{name}</p>
          <p className="text-slate-400 text-sm">Level {level}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">HP</span>
          <span className="text-slate-300">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">EXP</span>
          <span className="text-slate-300">
            {xp} / {xpToNext}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
