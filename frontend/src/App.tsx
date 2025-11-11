import { FormEvent, useEffect, useMemo, useState } from "react";
import { HeartPulse, RefreshCw, Sparkles } from "lucide-react";

import { EventForm } from "@/components/dashboard/EventForm";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEvents } from "@/hooks/useEvents";
import { apiClient } from "@/lib/api";
import type { EventFormState, EventPayload } from "@/types/event";
import { connectWS } from "@/ws";

type HealthResponse = {
  ok: boolean;
};

const pad = (value: number) => `${value}`.padStart(2, "0");

const localDateTimeInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const createDefaultFormState = (): EventFormState => ({
  title: "",
  when: localDateTimeInputValue(new Date()),
  notes: ""
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
};

const getCountdownLabel = (date: Date) => {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "Happening now";
  const minutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(minutes / (60 * 24));
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} away`;
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} away`;
  return `${Math.max(minutes, 1)} min away`;
};

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(() => createDefaultFormState());
  const [formError, setFormError] = useState<string | null>(null);

  const { events, isLoading, loadError, isSaving, saveError, createEvent, refresh } = useEvents();

  const nextEvent = events[0] ?? null;
  const nextEventDate = nextEvent ? new Date(nextEvent.when) : null;
  const upcomingCount = useMemo(
    () => events.filter((eventItem) => new Date(eventItem.when).getTime() > Date.now()).length,
    [events]
  );

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<HealthResponse>("/api/health")
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const payload: EventPayload = {
      title: formState.title.trim(),
      when: scheduledFor.toISOString(),
      ...(formState.notes.trim() ? { notes: formState.notes.trim() } : {})
    };

    try {
      await createEvent(payload);
      setFormState(createDefaultFormState());
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleFieldChange = (field: keyof EventFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-[-20rem] -z-10 hidden h-[80rem] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.35),_transparent_55%)] sm:block" />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-300/80">Family Command Center</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">Bruton Family Hub</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-200/80">
                Health, events, and coordination tools for every Bruton. Plan meals, track moments, and keep the household in sync.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => refresh()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh events
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("event-form")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                <Sparkles className="h-4 w-4" />
                New entry
              </button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="API health"
              value={health?.ok ? "Online" : healthError ? "Offline" : "Checking…"}
              description={health?.ok ? "FastAPI is responding normally." : healthError ?? "Waiting for response…"}
              icon={HeartPulse}
              tone="emerald"
              footer={
                health?.ok ? <span className="text-emerald-100/80">Live connection established</span> : <span className="text-rose-100/80">Health check failed</span>
              }
            />
            <StatCard
              title="Next gathering"
              value={nextEventDate ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(nextEventDate) : "No plans yet"}
              description={nextEventDate ? getCountdownLabel(nextEventDate) : "Add something to kick things off."}
              icon={Sparkles}
              tone="violet"
              footer={nextEvent?.notes ? <span className="text-slate-100/80">{nextEvent.notes}</span> : null}
            />
            <StatCard
              title="Upcoming events"
              value={upcomingCount}
              description="On the calendar"
              icon={RefreshCw}
              tone="sky"
              footer={<span className="text-slate-100/80">Total scheduled: {events.length}</span>}
            />
          </section>

          <section className="grid gap-8 lg:grid-cols-[380px,1fr]">
            <div id="event-form">
              <EventForm
                formState={formState}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                isSaving={isSaving}
                formError={formError}
                saveError={saveError}
              />
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300/80">Family timeline</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Household events</h2>
                  <p className="text-sm text-slate-300/80">Live updates from FastAPI, streamed over WebSockets.</p>
                </div>
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              <EventTimeline events={events} isLoading={isLoading} loadError={loadError} onRefresh={refresh} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
