import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api";
const sortChronologically = (items) => [...items].sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
const getErrorMessage = (error) => {
    if (error instanceof AxiosError) {
        return (error.response?.data?.detail ??
            error.message ??
            "Request failed");
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Something went wrong";
};
export function useEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const { data } = await apiClient.get("/api/events");
            setEvents(sortChronologically(data));
        }
        catch (error) {
            setLoadError(getErrorMessage(error));
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const createEvent = useCallback(async (payload) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const { data } = await apiClient.post("/api/events", payload);
            setEvents((prev) => sortChronologically([...prev, data]));
            return data;
        }
        catch (error) {
            const message = getErrorMessage(error);
            setSaveError(message);
            throw new Error(message);
        }
        finally {
            setIsSaving(false);
        }
    }, []);
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    return useMemo(() => ({
        events,
        isLoading,
        loadError,
        isSaving,
        saveError,
        refresh: fetchEvents,
        createEvent,
    }), [createEvent, events, fetchEvents, isLoading, isSaving, loadError, saveError]);
}
