import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { apiClient } from "@/lib/api";
import { connectWS } from "@/ws";
const eventDateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short"
});
const createdFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
});
const pad = (value) => `${value}`.padStart(2, "0");
const localDateTimeInputValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const createDefaultFormState = () => ({
    title: "",
    when: localDateTimeInputValue(new Date()),
    notes: ""
});
const getReadableDate = (value, formatter) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : formatter.format(date);
};
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return "Something went wrong";
};
export default function App() {
    const [health, setHealth] = useState(null);
    const [healthError, setHealthError] = useState(null);
    const [formState, setFormState] = useState(() => createDefaultFormState());
    const [formError, setFormError] = useState(null);
    const { events, isLoading, loadError, isSaving, saveError, createEvent, refresh } = useEvents();
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
    return (_jsx("main", { className: "min-h-screen bg-slate-50 p-6 text-slate-900", children: _jsxs("div", { className: "mx-auto max-w-5xl space-y-8", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-slate-500", children: "Family Command Center" }), _jsx("h1", { className: "text-3xl font-bold", children: "Bruton Family Hub" }), _jsx("p", { className: "text-base text-slate-600", children: "Health, events, and coordination tools for the household." })] }), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Backend status" }), _jsx("p", { className: "text-sm text-slate-500", children: "Live snapshot of the FastAPI service." }), _jsxs("div", { className: "mt-4 rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100", children: [health && (_jsx("pre", { className: "overflow-x-auto", children: JSON.stringify(health, null, 2) })), !health && !healthError && _jsx("p", { children: "Checking API\u2026" }), healthError && _jsxs("p", { className: "text-rose-300", children: ["Health check failed: ", healthError] })] })] }), _jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Household events" }), _jsx("p", { className: "text-sm text-slate-500", children: "Add shared plans and keep everyone in sync." })] }), _jsx("button", { type: "button", onClick: () => refresh(), className: "text-sm font-semibold text-indigo-600 hover:text-indigo-500", children: "Refresh" })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[360px,1fr]", children: [_jsxs("form", { onSubmit: handleSubmit, className: "rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner", children: [_jsx("h3", { className: "text-base font-semibold text-slate-900", children: "Add something new" }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("label", { className: "block text-sm font-medium text-slate-700", children: ["Title", _jsx("input", { type: "text", name: "title", value: formState.title, onChange: (event) => setFormState((prev) => ({ ...prev, title: event.target.value })), className: "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50", placeholder: "Mom's birthday dinner" })] }), _jsxs("label", { className: "block text-sm font-medium text-slate-700", children: ["When", _jsx("input", { type: "datetime-local", name: "when", value: formState.when, onChange: (event) => setFormState((prev) => ({ ...prev, when: event.target.value })), className: "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" })] }), _jsxs("label", { className: "block text-sm font-medium text-slate-700", children: ["Notes", _jsx("textarea", { name: "notes", value: formState.notes, onChange: (event) => setFormState((prev) => ({ ...prev, notes: event.target.value })), className: "mt-1 h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50", placeholder: "Directions, potluck assignments, etc." })] })] }), (formError || saveError) && (_jsx("p", { className: "mt-3 text-sm text-rose-600", children: formError ?? saveError })), _jsx("button", { type: "submit", className: "mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400", disabled: isSaving, children: isSaving ? "Saving…" : "Save event" })] }), _jsxs("div", { className: "space-y-3", children: [isLoading && _jsx("p", { className: "text-sm text-slate-500", children: "Loading events\u2026" }), loadError && _jsxs("p", { className: "text-sm text-rose-600", children: ["Unable to load events: ", loadError] }), !isLoading && !loadError && events.length === 0 && (_jsx("p", { className: "rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500", children: "Nothing on the calendar yet. Add the first plan!" })), events.map((eventItem) => (_jsxs("article", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: eventItem.title }), _jsxs("p", { className: "text-xs uppercase tracking-wide text-slate-400", children: ["Created ", getReadableDate(eventItem.created_at, createdFormatter)] })] }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: getReadableDate(eventItem.when, eventDateFormatter) }), eventItem.notes && (_jsx("p", { className: "mt-3 whitespace-pre-line text-sm text-slate-700", children: eventItem.notes }))] }, eventItem.id)))] })] })] })] }) }));
}
