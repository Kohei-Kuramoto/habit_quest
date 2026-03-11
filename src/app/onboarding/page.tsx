"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// キャラクターの種類を定義する
const characterTypes = [
  {
    type: "WARRIOR",
    emoji: "⚔️",
    name: "戦士",
    description: "体力と根性で習慣を続ける",
    color: "from-red-500 to-orange-500",
  },
  {
    type: "MAGE",
    emoji: "🔮",
    name: "魔法使い",
    description: "知識と集中力で習慣を磨く",
    color: "from-purple-500 to-indigo-500",
  },
  {
    type: "ARCHER",
    emoji: "🏹",
    name: "弓使い",
    description: "正確さとリズムで習慣を刻む",
    color: "from-green-500 to-teal-500",
  },
  {
    type: "HEALER",
    emoji: "💚",
    name: "癒し手",
    description: "心身のバランスで習慣を育てる",
    color: "from-emerald-500 to-cyan-500",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    // バリデーション
    if (!selectedType) {
      setError("キャラクターを選択してください");
      return;
    }
    if (!name.trim()) {
      setError("キャラクター名を入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // キャラクター作成APIを呼び出す
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type: selectedType }),
      });

      if (!res.ok) {
        throw new Error("キャラクターの作成に失敗しました");
      }

      // 成功したらダッシュボードへ移動する
      router.push("/dashboard");
    } catch (e) {
      setError("エラーが発生しました。もう一度試してください。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            ようこそ HabitQuest へ！
          </h1>
          <p className="text-purple-200">
            まずはあなたのキャラクターを作成しましょう
          </p>
        </div>

        {/* キャラクター選択 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {characterTypes.map((char) => (
            <button
              key={char.type}
              onClick={() => setSelectedType(char.type)}
              className={`
                relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 text-left
                ${
                  selectedType === char.type
                    ? "border-indigo-400 bg-indigo-500/20 scale-105"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-400"
                }
              `}
            >
              {/* 選択中のチェックマーク */}
              {selectedType === char.type && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              <div className={`text-4xl mb-3`}>{char.emoji}</div>
              <h3 className="text-white font-bold text-lg mb-1">{char.name}</h3>
              <p className="text-slate-400 text-sm">{char.description}</p>
            </button>
          ))}
        </div>

        {/* キャラクター名入力 */}
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            キャラクター名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：勇者タロウ"
            maxLength={20}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <p className="text-slate-500 text-xs mt-1 text-right">
            {name.length} / 20
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 作成ボタン */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedType || !name.trim()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all duration-200"
        >
          {isLoading ? "作成中..." : "冒険を始める！"}
        </button>
      </div>
    </div>
  );
}
