import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { HeartPulse, RefreshCw, Sparkles } from "lucide-react";
import { EventForm } from "@/components/dashboard/EventForm";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEvents } from "@/hooks/useEvents";
import { apiClient } from "@/lib/api";
import { connectWS } from "@/ws";
const pad = (value) => `${value}`.padStart(2, "0");
const localDateTimeInputValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const createDefaultFormState = () => ({
    title: "",
    when: localDateTimeInputValue(new Date()),
    notes: ""
});
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return "Something went wrong";
};
const getCountdownLabel = (date) => {
    const diffMs = date.getTime() - Date.now();
    if (diffMs <= 0)
        return "Happening now";
    const minutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(minutes / (60 * 24));
    if (days > 0)
        return `${days} day${days === 1 ? "" : "s"} away`;
    const hours = Math.floor(minutes / 60);
    if (hours > 0)
        return `${hours} hour${hours === 1 ? "" : "s"} away`;
    return `${Math.max(minutes, 1)} min away`;
};
export default function App() {
    const [health, setHealth] = useState(null);
    const [healthError, setHealthError] = useState(null);
    const [formState, setFormState] = useState(() => createDefaultFormState());
    const [formError, setFormError] = useState(null);
    const { events, isLoading, loadError, isSaving, saveError, createEvent, refresh } = useEvents();
    const nextEvent = events[0] ?? null;
    const nextEventDate = nextEvent ? new Date(nextEvent.when) : null;
    const upcomingCount = useMemo(() => events.filter((eventItem) => new Date(eventItem.when).getTime() > Date.now()).length, [events]);
    useEffect(() => {
        let isMounted = true;
        apiClient
            .get("/api/health")
            .then((res) => {
            if (isMounted) {
                setHealth(res.data);
            }
        })
            .catch((error) => {
            if (isMounted) {
                setHealthError(getErrorMessage(error));
            }
        });
        const ws = connectWS();
        return () => {
            isMounted = false;
            ws.close();
        };
    }, []);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError(null);
        if (!formState.title.trim()) {
            setFormError("Give the event a title so everyone knows what it is.");
            return;
        }
        if (!formState.when) {
            setFormError("Pick a date and time.");
            return;
        }
        const scheduledFor = new Date(formState.when);
        if (Number.isNaN(scheduledFor.getTime())) {
            setFormError("That date doesn't look quite right.");
            return;
        }
        const payload = {
            title: formState.title.trim(),
            when: scheduledFor.toISOString(),
            ...(formState.notes.trim() ? { notes: formState.notes.trim() } : {})
        };
        try {
            await createEvent(payload);
            setFormState(createDefaultFormState());
        }
        catch (error) {
            setFormError(getErrorMessage(error));
        }
    };
    const handleFieldChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };
    return (_jsx("main", { className: "min-h-screen bg-slate-950 text-white", children: _jsxs("div", { className: "relative isolate overflow-hidden", children: [_jsx("div", { className: "pointer-events-none absolute inset-x-0 top-[-20rem] -z-10 hidden h-[80rem] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.35),_transparent_55%)] sm:block" }), _jsxs("div", { className: "mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8", children: [_jsxs("header", { className: "flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.5em] text-slate-300/80", children: "Family Command Center" }), _jsx("h1", { className: "mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl", children: "Bruton Family Hub" }), _jsx("p", { className: "mt-3 max-w-2xl text-base text-slate-200/80", children: "Health, events, and coordination tools for every Bruton. Plan meals, track moments, and keep the household in sync." })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { type: "button", onClick: () => refresh(), className: "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Refresh events"] }), _jsxs("button", { type: "button", onClick: () => document.getElementById("event-form")?.scrollIntoView({ behavior: "smooth" }), className: "inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400", children: [_jsx(Sparkles, { className: "h-4 w-4" }), "New entry"] })] })] }), _jsxs("section", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [_jsx(StatCard, { title: "API health", value: health?.ok ? "Online" : healthError ? "Offline" : "Checking…", description: health?.ok ? "FastAPI is responding normally." : healthError ?? "Waiting for response…", icon: HeartPulse, tone: "emerald", footer: health?.ok ? _jsx("span", { className: "text-emerald-100/80", children: "Live connection established" }) : _jsx("span", { className: "text-rose-100/80", children: "Health check failed" }) }), _jsx(StatCard, { title: "Next gathering", value: nextEventDate ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(nextEventDate) : "No plans yet", description: nextEventDate ? getCountdownLabel(nextEventDate) : "Add something to kick things off.", icon: Sparkles, tone: "violet", footer: nextEvent?.notes ? _jsx("span", { className: "text-slate-100/80", children: nextEvent.notes }) : null }), _jsx(StatCard, { title: "Upcoming events", value: upcomingCount, description: "On the calendar", icon: RefreshCw, tone: "sky", footer: _jsxs("span", { className: "text-slate-100/80", children: ["Total scheduled: ", events.length] }) })] }), _jsxs("section", { className: "grid gap-8 lg:grid-cols-[380px,1fr]", children: [_jsx("div", { id: "event-form", children: _jsx(EventForm, { formState: formState, onFieldChange: handleFieldChange, onSubmit: handleSubmit, isSaving: isSaving, formError: formError, saveError: saveError }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.4em] text-slate-300/80", children: "Family timeline" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold text-white", children: "Household events" }), _jsx("p", { className: "text-sm text-slate-300/80", children: "Live updates from FastAPI, streamed over WebSockets." })] }), _jsxs("button", { type: "button", onClick: () => refresh(), className: "inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Refresh"] })] }), _jsx(EventTimeline, { events: events, isLoading: isLoading, loadError: loadError, onRefresh: refresh })] })] })] })] }) }));
}
