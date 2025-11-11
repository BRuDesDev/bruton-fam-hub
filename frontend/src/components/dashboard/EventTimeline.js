import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarDays, Clock8, MapPin } from "lucide-react";
const formatDate = (isoDate, options) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime()))
        return isoDate;
    return new Intl.DateTimeFormat(undefined, options).format(date);
};
export function EventTimeline({ events, isLoading, loadError, onRefresh }) {
    if (isLoading) {
        return (_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80", children: "Loading events\u2026" }));
    }
    if (loadError) {
        return (_jsxs("div", { className: "rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6", children: [_jsxs("p", { className: "text-sm text-rose-100", children: ["Unable to load events: ", loadError] }), _jsx("button", { type: "button", onClick: onRefresh, className: "mt-4 text-sm font-semibold text-rose-100 underline underline-offset-4", children: "Try again" })] }));
    }
    if (events.length === 0) {
        return (_jsx("div", { className: "rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80", children: "Nothing on the calendar yet. Add the first plan!" }));
    }
    return (_jsx("div", { className: "space-y-6", children: events.map((event, index) => {
            const isLast = index === events.length - 1;
            return (_jsxs("article", { className: "relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl shadow-black/20", children: [!isLast && _jsx("span", { className: "absolute left-5 top-[calc(100%+0.25rem)] h-6 w-px bg-white/20" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white", children: _jsx(CalendarDays, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: event.title }), _jsxs("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-200/60", children: ["Created ", formatDate(event.created_at, { dateStyle: "medium", timeStyle: "short" })] })] }), _jsxs("p", { className: "flex items-center gap-2 text-sm text-slate-100/90", children: [_jsx(Clock8, { className: "h-4 w-4 text-indigo-200" }), formatDate(event.when, { dateStyle: "full", timeStyle: "short" })] }), event.notes && (_jsxs("p", { className: "flex items-start gap-2 whitespace-pre-line text-sm text-slate-200", children: [_jsx(MapPin, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-200" }), event.notes] }))] })] })] }, event.id));
        }) }));
}
