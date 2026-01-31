import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface AppShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default async function AppShell({ title, description, children }: AppShellProps) {
  const locale = await getServerLocale();
  const translatedTitle = translate(locale, title);
  const translatedDescription = description ? translate(locale, description) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar title={translatedTitle} description={translatedDescription} />
          <main className="px-4 pb-12 pt-4 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
