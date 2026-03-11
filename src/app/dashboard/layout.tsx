import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* サイドバー（デスクトップ）/ ボトムナビ（モバイル） */}
      <Sidebar />

      {/* メインコンテンツ：デスクトップはサイドバー幅分オフセット、モバイルはボトムナビ分パディング */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
