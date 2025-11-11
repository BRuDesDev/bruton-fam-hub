import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";

import { apiClient } from "@/lib/api";
import type { EventPayload, EventRecord } from "@/types/event";

const sortChronologically = (items: EventRecord[]): EventRecord[] =>
  [...items].sort(
    (a, b) => new Date(a.when).getTime() - new Date(b.when).getTime()
  );

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      "Request failed"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
};

export function useEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await apiClient.get<EventRecord[]>("/api/events");
      setEvents(sortChronologically(data));
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = useCallback(
    async (payload: EventPayload) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const { data } = await apiClient.post<EventRecord>(
          "/api/events",
          payload
        );
        setEvents((prev) => sortChronologically([...prev, data]));
        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        setSaveError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return useMemo(
    () => ({
      events,
      isLoading,
      loadError,
      isSaving,
      saveError,
      refresh: fetchEvents,
      createEvent,
    }),
    [createEvent, events, fetchEvents, isLoading, isSaving, loadError, saveError]
  );
}
