type StatsCardProps = {
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  weeklyRate: number;
};

export default function StatsCard({
  totalCheckins,
  currentStreak,
  longestStreak,
  weeklyRate,
}: StatsCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <h2 className="text-white font-bold text-lg mb-6">統計</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">現在の連続日数</p>
          <p className="text-white font-bold text-2xl">
            {currentStreak}
            <span className="text-sm font-normal text-slate-400 ml-1">日</span>
          </p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">最長連続日数</p>
          <p className="text-white font-bold text-2xl">
            {longestStreak}
            <span className="text-sm font-normal text-slate-400 ml-1">日</span>
          </p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">総チェックイン数</p>
          <p className="text-white font-bold text-2xl">
            {totalCheckins}
            <span className="text-sm font-normal text-slate-400 ml-1">回</span>
          </p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">今週の達成率</p>
          <p className="text-white font-bold text-2xl">
            {weeklyRate}
            <span className="text-sm font-normal text-slate-400 ml-1">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
