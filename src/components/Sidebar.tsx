"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "ホーム" },
  { href: "/dashboard/habits", icon: "⚔️", label: "クエスト" },
  { href: "/dashboard/stats", icon: "📊", label: "統計" },
  { href: "/dashboard/profile", icon: "👤", label: "プロフィール" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* デスクトップ用サイドバー（md以上で表示） */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700/50 flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                HabitQuest
              </h1>
              <p className="text-slate-400 text-xs mt-1">習慣をRPGで楽しもう</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* モバイル用ボトムナビゲーション（md未満で表示） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700/50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-all duration-200
                  ${isActive ? "text-indigo-400" : "text-slate-500"}
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-center gap-1 py-3 px-4 flex-1 text-slate-500 transition-all duration-200"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-xs font-medium">ログアウト</span>
          </button>
        </div>
      </nav>
    </>
  );
}
