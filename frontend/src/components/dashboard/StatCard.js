import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
const toneStyles = {
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
export function StatCard({ title, value, description, icon: Icon, tone = "emerald", footer }) {
    const style = toneStyles[tone];
    return (_jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur", children: [_jsx("div", { className: cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 blur-2xl", style.aura) }), _jsxs("div", { className: "relative flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/70", children: title }), _jsx("div", { className: "mt-3 text-3xl font-semibold text-white", children: value }), description && _jsx("p", { className: "mt-2 text-sm text-slate-200/80", children: description })] }), Icon && _jsx(Icon, { className: cn("h-9 w-9", style.icon) })] }), footer && _jsx("div", { className: "relative mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200/70", children: footer })] }));
}
