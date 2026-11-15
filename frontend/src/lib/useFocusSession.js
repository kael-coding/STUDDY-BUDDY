import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { manilaDateKey } from "@/lib/utils/todayTasks.js";

const endpoint = "/api/schedule/focus";
export const restMinutes = 5;
export const maxBreaks = 2;

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
    const active = progress?.active;
    const paused = active?.pausedRemainingMs != null;
    const deadline = active && !paused ? Date.parse(active.endsAt) : null;
    const serverNow = now + (progress?.offset ?? 0);
    const breakDeadline = active?.breakEndsAt ? Date.parse(active.breakEndsAt) : 0;
    const breakSeconds = Math.max(0, Math.ceil((breakDeadline - serverNow) / 1000));
    const resting = breakSeconds > 0;
    const remainingMs = active?.pausedRemainingMs ?? ((deadline ?? 0) - Math.max(serverNow, breakDeadline));
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

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
                if (previous && previous.session.pausedRemainingMs == null && !data.active && Date.parse(previous.session.endsAt) <= Date.parse(data.serverTime)) {
                    const day = data.days.find((item) => item.date === previous.date);
                    if (day && day.sessions > previous.sessions) {
                        setCompletedSession(previous.session);
                        setDuration(previous.session.minutes);
                    }
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

    const changeSession = async (action) => {
        setBusy(true);
        setActionError("");
        try {
            const options = { withCredentials: true };
            if (action === "reset") {
                await axios.delete(`${endpoint}/${active._id}`, options);
                setDuration(active.minutes);
                lastActive.current = null;
                setProgress((current) => ({ ...current, active: null }));
                return;
            }

            const { data } = await (action === "start"
                ? axios.post(endpoint, {
                    minutes: duration,
                    ...(task && { taskId: task._id }),
                }, options)
                : axios.patch(`${endpoint}/${active._id}`, { action, revision: active.__v ?? 0 }, options));
            const receivedAt = Date.now();
            lastActive.current = sessionSnapshot(data.active, progress.days);
            setCompletedSession(null);
            setNow(receivedAt);
            setProgress((current) => ({ ...current, active: data.active, offset: Date.parse(data.serverTime) - receivedAt }));
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

    const reset = () => {
        setCompletedSession(null);
        setActionError("");
        if (active && seconds > 0) return changeSession("reset");
    };

    return {
        progress, duration, setDuration, busy, error: actionError || error,
        seconds, paused, resting, breakSeconds, changeSession, refresh, reset, completedSession,
    };
}
