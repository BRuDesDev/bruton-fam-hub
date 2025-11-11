import type { FormEvent } from "react";

import type { EventFormState } from "@/types/event";

type EventFormProps = {
  formState: EventFormState;
  onFieldChange: (field: keyof EventFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  formError: string | null;
  saveError: string | null;
};

export function EventForm({ formState, onFieldChange, onSubmit, isSaving, formError, saveError }: EventFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-black/20">
      <h3 className="text-lg font-semibold text-white">Add something new</h3>
      <p className="text-sm text-slate-200/70">Drop the plans, add a note, keep everyone aligned.</p>

      <div className="mt-6 space-y-5">
        <label className="block text-sm font-medium text-slate-100">
          Title
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            placeholder="Mom's birthday dinner"
          />
        </label>

        <label className="block text-sm font-medium text-slate-100">
          When
          <input
            type="datetime-local"
            name="when"
            value={formState.when}
            onChange={(event) => onFieldChange("when", event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </label>

        <label className="block text-sm font-medium text-slate-100">
          Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            placeholder="Directions, potluck assignments, etc."
          />
        </label>
      </div>

      {(formError || saveError) && (
        <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">{formError ?? saveError}</p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 px-4 py-3 text-base font-semibold text-white transition hover:from-indigo-400 hover:to-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : "Save event"}
      </button>
    </form>
  );
}
