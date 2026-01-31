"use client";

import { useState } from "react";

interface ActionListProps {
  actions: { id: string; label: string }[];
}

export default function ActionList({ actions }: ActionListProps) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.id}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          onClick={() => setActive(action.id)}
        >
          {action.label}
          <span className="text-xs text-slate-400">→</span>
        </button>
      ))}
      {active ? (
        <p className="rounded-xl border border-mint-200 bg-mint-50 px-3 py-2 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
          {actions.find((action) => action.id === active)?.label} started.
        </p>
      ) : null}
    </div>
  );
}
