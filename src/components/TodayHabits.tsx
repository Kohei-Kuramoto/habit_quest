"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function TodayHabits({
  habits: initialHabits,
}: TodayHabitsProps) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;

  async function handleCheckin(habit: Habit) {
    if (habit.isCompleted) return;

    setLoadingId(habit.id);

    try {
      const res = await fetch(`/api/habits/${habit.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: "GOOD" }),
      });

      if (!res.ok) throw new Error("チェックインに失敗しました");

      const data = await res.json();

      setHabits((prev) =>
        prev.map((h) => (h.id === habit.id ? { ...h, isCompleted: true } : h)),
      );

      if (data.levelUp) {
        setLevelUp(true);
        setTimeout(() => setLevelUp(false), 3000);
      }

      router.refresh();

      // AIの励ましメッセージを取得する
      await fetchAiMessage(habit.title, habit.xpReward);
    } catch (e) {
      console.error("チェックインエラー:", e);
    } finally {
      setLoadingId(null);
    }
  }

  async function fetchAiMessage(habitTitle: string, xpEarned: number) {
    setIsAiLoading(true);
    setAiMessage("");

    try {
      const res = await fetch("/api/ai/encourage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitTitle, xpEarned }),
      });

      if (!res.ok) throw new Error("AIメッセージの取得に失敗しました");

      // ストリーミングでテキストを受け取る
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setAiMessage((prev) => (prev ?? "") + text);
      }
    } catch (e) {
      console.error("AIメッセージエラー:", e);
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      {/* レベルアップ通知 */}
      {levelUp && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center animate-pulse">
          <p className="text-yellow-400 font-bold text-lg">🎉 レベルアップ！</p>
          <p className="text-yellow-300 text-sm">キャラクターが強くなった！</p>
        </div>
      )}

      {/* AIメッセージ */}
      {(aiMessage !== null || isAiLoading) && (
        <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-indigo-400 text-sm font-medium">
              ナビゲーターからのメッセージ
            </span>
          </div>
          {isAiLoading && !aiMessage ? (
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          ) : (
            <p className="text-slate-200 text-sm leading-relaxed">
              {aiMessage}
            </p>
          )}
        </div>
      )}

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
            <button
              key={habit.id}
              onClick={() => handleCheckin(habit)}
              disabled={habit.isCompleted || loadingId === habit.id}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                ${
                  habit.isCompleted
                    ? "bg-indigo-500/10 border-indigo-500/30 cursor-default"
                    : "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50"
                }
              `}
            >
              <div
                className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${
                  habit.isCompleted
                    ? "bg-indigo-500 border-indigo-500"
                    : loadingId === habit.id
                      ? "border-indigo-400 animate-spin"
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
              <span
                className={`text-sm font-medium ${
                  habit.isCompleted ? "text-indigo-400" : "text-slate-400"
                }`}
              >
                +{habit.xpReward}XP
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
