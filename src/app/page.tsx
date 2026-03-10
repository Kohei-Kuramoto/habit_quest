import Link from "next/link";

const features = [
  {
    emoji: "⚔️",
    title: "RPGキャラクターを育てる",
    description:
      "習慣を達成するたびにキャラクターがXPを獲得してレベルアップ。サボるとHPが減っていく。",
  },
  {
    emoji: "🤖",
    title: "AIが励ましてくれる",
    description:
      "チェックインするたびにAIナビゲーターがあなただけの励ましメッセージを送ってくれる。",
  },
  {
    emoji: "📊",
    title: "習慣を可視化する",
    description:
      "連続日数・達成率・XP履歴をグラフで確認。データで自分の成長を実感できる。",
  },
  {
    emoji: "🎯",
    title: "習慣を自由に設定",
    description:
      "毎日・週次の頻度設定、XP報酬のカスタマイズ。自分だけのクエストを作ろう。",
  },
];

const characterTypes = [
  { emoji: "⚔️", name: "戦士", description: "体力と根性タイプ" },
  { emoji: "🔮", name: "魔法使い", description: "知識と集中タイプ" },
  { emoji: "🏹", name: "弓使い", description: "正確さとリズムタイプ" },
  { emoji: "💚", name: "癒し手", description: "心身バランスタイプ" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ナビゲーション */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <span className="font-bold text-lg">HabitQuest</span>
          </div>
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
          >
            ログイン
          </Link>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-indigo-400 text-sm font-medium mb-8">
            <span>✨</span>
            <span>習慣化をRPGで楽しく続けよう</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            習慣を
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              クエスト
            </span>
            に変えよう
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed mb-10">
            HabitQuestは習慣化をRPGゲームで楽しくする習慣管理アプリです。
            毎日の習慣を達成してキャラクターを育て、あなただけの冒険を始めましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
              無料で冒険を始める →
            </Link>
            <a
              href="#features"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              詳しく見る
            </a>
          </div>
        </div>
      </section>

      {/* キャラクタープレビュー */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-slate-400 text-sm font-medium mb-8">
            4種類のキャラクターから選べる
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {characterTypes.map((char) => (
              <div
                key={char.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center hover:border-indigo-500/50 transition-colors"
              >
                <p className="text-4xl mb-2">{char.emoji}</p>
                <p className="text-white font-bold">{char.name}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">なぜHabitQuestなのか</h2>
            <p className="text-slate-400">
              習慣化を続けられない理由は「楽しくないから」。HabitQuestはそれを解決します。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
              >
                <p className="text-3xl mb-4">{feature.emoji}</p>
                <h3 className="text-white font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">今すぐ冒険を始めよう</h2>
          <p className="text-slate-400 mb-8">
            無料で始められます。Googleアカウントがあればすぐにスタートできます。
          </p>
          <Link
            href="/login"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/20"
          >
            無料で冒険を始める →
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚔️</span>
            <span className="text-slate-400 text-sm">HabitQuest</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 HabitQuest</p>
        </div>
      </footer>
    </div>
  );
}
