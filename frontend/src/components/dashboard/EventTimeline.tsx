import { CalendarDays, Clock8, MapPin } from "lucide-react";

import type { EventRecord } from "@/types/event";

const formatDate = (isoDate: string, options: Intl.DateTimeFormatOptions) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

type EventTimelineProps = {
  events: EventRecord[];
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
};

export function EventTimeline({ events, isLoading, loadError, onRefresh }: EventTimelineProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
        Loading events…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
        <p className="text-sm text-rose-100">Unable to load events: {loadError}</p>
        <button type="button" onClick={onRefresh} className="mt-4 text-sm font-semibold text-rose-100 underline underline-offset-4">
          Try again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80">
        Nothing on the calendar yet. Add the first plan!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <article key={event.id} className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl shadow-black/20">
            {!isLast && <span className="absolute left-5 top-[calc(100%+0.25rem)] h-6 w-px bg-white/20" />}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-200/60">
                    Created {formatDate(event.created_at, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-sm text-slate-100/90">
                  <Clock8 className="h-4 w-4 text-indigo-200" />
                  {formatDate(event.when, { dateStyle: "full", timeStyle: "short" })}
                </p>
                {event.notes && (
                  <p className="flex items-start gap-2 whitespace-pre-line text-sm text-slate-200">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-200" />
                    {event.notes}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
