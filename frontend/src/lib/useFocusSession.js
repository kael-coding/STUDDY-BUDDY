import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { manilaDateKey } from "@/lib/utils/todayTasks.js";

const endpoint = "/api/schedule/focus";

const sessionSnapshot = (session, days) => {
    const date = manilaDateKey(new Date(session.endsAt));
    return { session, date, sessions: days.find((day) => day.date === date)?.sessions ?? 0 };
};

export function useFocusSession(task) {
    const [progress, setProgress] = useState(null);
    const [duration, setDuration] = useState(25);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [completedSession, setCompletedSession] = useState(null);
    const lastActive = useRef(null);
    const [revision, setRevision] = useState(0);
    const [now, setNow] = useState(Date.now);
    const endsAt = progress?.active?.endsAt;
    const deadline = endsAt ? Date.parse(endsAt) : null;
    const seconds = endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - now - progress.offset) / 1000)) : 0;

    useEffect(() => {
        if (busy) return;
        const controller = new AbortController();
        let request;
        const refresh = async () => {
            if (request) return;
            request = axios.get(endpoint, { signal: controller.signal, withCredentials: true });
            try {
                const { data } = await request;
                if (controller.signal.aborted) return;
                const receivedAt = Date.now();
                const previous = lastActive.current;
                if (previous && !data.active && Date.parse(previous.session.endsAt) <= Date.parse(data.serverTime)) {
                    const day = data.days.find((item) => item.date === previous.date);
                    if (day && day.sessions > previous.sessions) setCompletedSession(previous.session);
                }
                lastActive.current = data.active ? sessionSnapshot(data.active, data.days) : null;
                setNow(receivedAt);
                setProgress({ ...data, offset: Date.parse(data.serverTime) - receivedAt });
                setError("");
            } catch {
                if (!controller.signal.aborted) setError("Could not load focus progress.");
            } finally {
                request = null;
            }
        };
        refresh();
        const interval = setInterval(refresh, 30_000);
        window.addEventListener("focus", refresh);
        return () => {
            controller.abort();
            clearInterval(interval);
            window.removeEventListener("focus", refresh);
        };
    }, [revision, busy]);

    useEffect(() => {
        if (!deadline) return;
        const interval = setInterval(() => setNow(Date.now()), 250);
        const expiry = setTimeout(() => setRevision((value) => value + 1),
            Math.max(0, deadline - Date.now() - progress.offset) + 200);
        return () => {
            clearInterval(interval);
            clearTimeout(expiry);
        };
    }, [deadline, progress?.offset]);

    const changeSession = async (cancel) => {
        setBusy(true);
        setActionError("");
        try {
            if (cancel) {
                await axios.delete(`${endpoint}/${progress.active._id}`, { withCredentials: true });
                lastActive.current = null;
                setProgress((current) => ({ ...current, active: null }));
            } else {
                const { data } = await axios.post(endpoint, {
                    minutes: duration,
                    ...(task && { taskId: task._id }),
                }, { withCredentials: true });
                const receivedAt = Date.now();
                lastActive.current = sessionSnapshot(data.active, progress.days);
                setCompletedSession(null);
                setNow(receivedAt);
                setProgress((current) => ({ ...current, active: data.active, offset: Date.parse(data.serverTime) - receivedAt }));
            }
        } catch (requestError) {
            if (requestError.response?.status === 409) setRevision((value) => value + 1);
            setActionError(requestError.response?.data?.message || "Could not update your focus session.");
        } finally {
            setBusy(false);
        }
    };

    const refresh = () => {
        setActionError("");
        setRevision((value) => value + 1);
    };

    return { progress, duration, setDuration, busy, error: actionError || error, seconds, changeSession, refresh, completedSession };
}
