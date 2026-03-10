type Habit = {
  id: string;
  title: string;
  icon: string;
  xpReward: number;
  isCompleted: boolean;
};

type TodayHabitsProps = {
  habits: Habit[];
};

export default function TodayHabits({ habits }: TodayHabitsProps) {
  // 完了済みの習慣数を計算する
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">今日のクエスト</h2>
        <span className="text-slate-400 text-sm">
          {completedCount} / {totalCount} 完了
        </span>
      </div>

      {/* 進捗バー */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500"
          style={{
            width:
              totalCount > 0
                ? `${Math.round((completedCount / totalCount) * 100)}%`
                : "0%",
          }}
        />
      </div>

      {/* 習慣リスト */}
      {habits.length === 0 ? (
        // 習慣が1つもない場合
        <div className="text-center py-8">
          <p className="text-4xl mb-3">⚔️</p>
          <p className="text-slate-400 text-sm">まだクエストがありません</p>
          <p className="text-slate-500 text-xs mt-1">
            習慣を追加してゲームを始めよう！
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                ${
                  habit.isCompleted
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
                }
              `}
            >
              {/* チェックマーク */}
              <div
                className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${
                  habit.isCompleted
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-slate-500"
                }
              `}
              >
                {habit.isCompleted && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* アイコンとタイトル */}
              <span className="text-xl">{habit.icon}</span>
              <span
                className={`flex-1 font-medium ${
                  habit.isCompleted
                    ? "text-slate-400 line-through"
                    : "text-white"
                }`}
              >
                {habit.title}
              </span>

              {/* XP */}
              <span
                className={`text-sm font-medium ${
                  habit.isCompleted ? "text-indigo-400" : "text-slate-400"
                }`}
              >
                +{habit.xpReward}XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
