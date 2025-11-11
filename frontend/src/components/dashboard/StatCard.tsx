import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "emerald" | "sky" | "violet";

const toneStyles: Record<Tone, { icon: string; aura: string }> = {
  emerald: {
    icon: "text-emerald-300",
    aura: "from-emerald-500/20 to-emerald-500/5"
  },
  sky: {
    icon: "text-sky-300",
    aura: "from-sky-500/20 to-sky-500/5"
  },
  violet: {
    icon: "text-violet-300",
    aura: "from-violet-500/20 to-violet-500/5"
  }
};

type StatCardProps = {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  footer?: ReactNode;
};

export function StatCard({ title, value, description, icon: Icon, tone = "emerald", footer }: StatCardProps) {
  const style = toneStyles[tone];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 blur-2xl", style.aura)} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/70">{title}</p>
          <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          {description && <p className="mt-2 text-sm text-slate-200/80">{description}</p>}
        </div>
        {Icon && <Icon className={cn("h-9 w-9", style.icon)} />}
      </div>
      {footer && <div className="relative mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200/70">{footer}</div>}
    </div>
  );
}
