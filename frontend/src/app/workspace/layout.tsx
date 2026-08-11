import { Sidebar } from "@/components/layout/Sidebar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg bg-radial-fade">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-x-hidden pt-12 lg:pt-0">{children}</main>
    </div>
  );
}
