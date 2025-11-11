import { FormEvent, useEffect, useState } from "react";

import { useEvents } from "@/hooks/useEvents";
import { apiClient } from "@/lib/api";
import type { EventPayload } from "@/types/event";
import { connectWS } from "@/ws";

type HealthResponse = {
  ok: boolean;
};

type EventFormState = {
  title: string;
  when: string;
  notes: string;
};

const eventDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "short"
});

const createdFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

const pad = (value: number) => `${value}`.padStart(2, "0");

const localDateTimeInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const createDefaultFormState = (): EventFormState => ({
  title: "",
  when: localDateTimeInputValue(new Date()),
  notes: ""
});

const getReadableDate = (value: string, formatter: Intl.DateTimeFormat) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatter.format(date);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
};

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(() => createDefaultFormState());
  const [formError, setFormError] = useState<string | null>(null);

  const { events, isLoading, loadError, isSaving, saveError, createEvent, refresh } = useEvents();

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

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family Command Center</p>
          <h1 className="text-3xl font-bold">Bruton Family Hub</h1>
          <p className="text-base text-slate-600">Health, events, and coordination tools for the household.</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Backend status</h2>
          <p className="text-sm text-slate-500">Live snapshot of the FastAPI service.</p>
          <div className="mt-4 rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100">
            {health && (
              <pre className="overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
            )}
            {!health && !healthError && <p>Checking API…</p>}
            {healthError && <p className="text-rose-300">Health check failed: {healthError}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Household events</h2>
              <p className="text-sm text-slate-500">Add shared plans and keep everyone in sync.</p>
            </div>
            <button
              type="button"
              onClick={() => refresh()}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Refresh
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
              <h3 className="text-base font-semibold text-slate-900">Add something new</h3>

              <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Title
                  <input
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Mom's birthday dinner"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  When
                  <input
                    type="datetime-local"
                    name="when"
                    value={formState.when}
                    onChange={(event) => setFormState((prev) => ({ ...prev, when: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Notes
                  <textarea
                    name="notes"
                    value={formState.notes}
                    onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                    className="mt-1 h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Directions, potluck assignments, etc."
                  />
                </label>
              </div>

              {(formError || saveError) && (
                <p className="mt-3 text-sm text-rose-600">{formError ?? saveError}</p>
              )}

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save event"}
              </button>
            </form>

            <div className="space-y-3">
              {isLoading && <p className="text-sm text-slate-500">Loading events…</p>}
              {loadError && <p className="text-sm text-rose-600">Unable to load events: {loadError}</p>}
              {!isLoading && !loadError && events.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  Nothing on the calendar yet. Add the first plan!
                </p>
              )}
              {events.map((eventItem) => (
                <article
                  key={eventItem.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{eventItem.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Created {getReadableDate(eventItem.created_at, createdFormatter)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {getReadableDate(eventItem.when, eventDateFormatter)}
                  </p>
                  {eventItem.notes && (
                    <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{eventItem.notes}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
