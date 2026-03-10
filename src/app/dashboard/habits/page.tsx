"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Habit = {
  id: string;
  title: string;
  icon: string | null;
  frequency: string;
  xpReward: number;
  isActive: boolean;
  daysOfWeek: number[];
};

// 曜日の表示名
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// よく使うアイコンの候補
const ICON_OPTIONS = [
  "🏃",
  "📚",
  "🧘",
  "💪",
  "🥗",
  "💧",
  "😴",
  "✍️",
  "🎵",
  "🧹",
  "💊",
  "🚴",
  "🏊",
  "🧠",
  "🌅",
  "🍎",
];

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // フォームの状態
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🏃");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [xpReward, setXpReward] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 習慣一覧を取得する
  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setHabits(data.habits ?? []);
    } catch {
      console.error("習慣の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  // 曜日の選択をトグルする
  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  }

  // フォームをリセットする
  function resetForm() {
    setTitle("");
    setIcon("🏃");
    setFrequency("DAILY");
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setXpReward(10);
    setError(null);
  }

  // 習慣を作成する
  async function handleSubmit() {
    if (!title.trim()) {
      setError("習慣名を入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          icon,
          frequency,
          daysOfWeek,
          xpReward,
        }),
      });

      if (!res.ok) throw new Error("作成に失敗しました");

      const data = await res.json();
      setHabits((prev) => [...prev, data.habit]);
      setShowForm(false);
      resetForm();
    } catch {
      setError("エラーが発生しました。もう一度試してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 習慣を削除（アーカイブ）する
  async function handleDelete(id: string) {
    if (!confirm("この習慣を削除しますか？")) return;

    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch {
      console.error("削除に失敗しました");
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">クエスト管理</h1>
          <p className="text-slate-400 mt-1">習慣を追加・管理しよう</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <span>＋</span>
          <span>新しいクエスト</span>
        </button>
      </div>

      {/* 習慣作成フォーム */}
      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-6">
            新しいクエストを作成
          </h2>

          {/* 習慣名 */}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              クエスト名
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：朝のランニング"
              maxLength={50}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* アイコン選択 */}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              アイコン
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    icon === emoji
                      ? "bg-indigo-600 scale-110"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 頻度選択 */}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              頻度
            </label>
            <div className="flex gap-3">
              {(["DAILY", "WEEKLY"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    frequency === f
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {f === "DAILY" ? "毎日" : "週次"}
                </button>
              ))}
            </div>
          </div>

          {/* 曜日選択（週次の場合） */}
          {frequency === "WEEKLY" && (
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                実施曜日
              </label>
              <div className="flex gap-2">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      daysOfWeek.includes(i)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* XP報酬 */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              XP報酬：{xpReward}XP
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-slate-500 text-xs mt-1">
              <span>5XP（簡単）</span>
              <span>50XP（難しい）</span>
            </div>
          </div>

          {/* エラー */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
            >
              {isSubmitting ? "作成中..." : "クエストを追加"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 習慣一覧 */}
      {isLoading ? (
        <div className="text-center text-slate-400 py-12">読み込み中...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">⚔️</p>
          <p className="text-slate-400">まだクエストがありません</p>
          <p className="text-slate-500 text-sm mt-1">
            「新しいクエスト」から習慣を追加しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">
                {habit.icon ?? "⚔️"}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{habit.title}</p>
                <p className="text-slate-400 text-sm">
                  {habit.frequency === "DAILY" ? "毎日" : "週次"}
                  　+{habit.xpReward}XP
                </p>
              </div>
              <button
                onClick={() => handleDelete(habit.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-2"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
