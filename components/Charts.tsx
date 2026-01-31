import clsx from "clsx";

interface LinePoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  points: LinePoint[];
}

export function LineChart({ title, points }: LineChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - (point.value / max) * 100;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <svg className="mt-3 h-28 w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#7c3aed" strokeWidth="3" />
        {points.map((point, index) => {
          const x = (index / (points.length - 1)) * 100;
          const y = 100 - (point.value / max) * 100;
          return <circle key={point.label} cx={x} cy={y} r="2.5" fill="#7c3aed" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  title: string;
  bars: LinePoint[];
}

export function BarChart({ title, bars }: BarChartProps) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="mt-3 flex h-28 items-end gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg bg-primary-500/70"
              style={{ height: `${(bar.value / max) * 100}%` }}
            />
            <span className="text-[10px] text-slate-400">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  tone: "primary" | "mint" | "coral" | "ink";
}

const donutColors = {
  primary: "#7c3aed",
  mint: "#10b981",
  coral: "#f97316",
  ink: "#1f2937"
};

interface DonutChartProps {
  title: string;
  slices: DonutSlice[];
}

export function DonutChart({ title, slices }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let startAngle = 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="h-24 w-24">
          {slices.map((slice) => {
            const angle = (slice.value / total) * 360;
            const endAngle = startAngle + angle;
            const largeArc = angle > 180 ? 1 : 0;
            const startX = 60 + 50 * Math.cos((Math.PI / 180) * startAngle);
            const startY = 60 + 50 * Math.sin((Math.PI / 180) * startAngle);
            const endX = 60 + 50 * Math.cos((Math.PI / 180) * endAngle);
            const endY = 60 + 50 * Math.sin((Math.PI / 180) * endAngle);
            const path = `M60,60 L${startX},${startY} A50,50 0 ${largeArc} 1 ${endX},${endY} Z`;
            startAngle = endAngle;
            return <path key={slice.label} d={path} fill={donutColors[slice.tone]} />;
          })}
          <circle cx="60" cy="60" r="28" fill="white" className="dark:fill-slate-950" />
        </svg>
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: donutColors[slice.tone] }}
              />
              <span>{slice.label}</span>
              <span className="ml-auto font-semibold text-slate-700 dark:text-slate-100">
                {Math.round((slice.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface GaugeProps {
  title: string;
  value: number;
  max: number;
  tone?: "primary" | "mint" | "coral";
}

export function Gauge({ title, value, max, tone = "primary" }: GaugeProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-8 border-slate-200 dark:border-white/10" />
          <div
            className={clsx(
              "absolute inset-0 rounded-full border-8",
              tone === "mint" && "border-mint-500",
              tone === "coral" && "border-coral-500",
              tone === "primary" && "border-primary-500"
            )}
            style={{
              clipPath: `inset(${100 - percentage}% 0 0 0)`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-100">
            {percentage}%
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-300">
          {value} of {max} target reached
        </div>
      </div>
    </div>
  );
}
