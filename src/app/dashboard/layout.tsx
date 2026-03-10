import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツ（サイドバーの幅分だけ右にずらす） */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
