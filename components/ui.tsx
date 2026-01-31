import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  accent?: "primary" | "mint" | "coral";
}

export function StatCard({ label, value, change, accent = "primary" }: StatCardProps) {
  const accentClasses = {
    primary: "text-primary-500",
    mint: "text-mint-500",
    coral: "text-coral-500"
  };

  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className={clsx("mt-2 text-xs font-semibold", accentClasses[accent])}>{change}</p>
    </Card>
  );
}

interface BadgeProps {
  label: string;
  tone?: "success" | "warning" | "info";
}

export function Badge({ label, tone = "info" }: BadgeProps) {
  const tones = {
    success: "bg-mint-500/20 text-mint-300",
    warning: "bg-coral-500/20 text-coral-300",
    info: "bg-primary-500/20 text-primary-300"
  };

  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>{label}</span>;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ children, variant = "primary" }: ButtonProps) {
  const base = "rounded-xl px-4 py-2 text-sm font-semibold transition";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "border border-white/10 text-slate-200 hover:bg-white/10"
  };

  return <button className={clsx(base, variants[variant])}>{children}</button>;
}
