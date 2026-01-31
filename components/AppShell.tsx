import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface AppShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar title={title} description={description} />
          <main className="px-4 pb-12 pt-4 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
