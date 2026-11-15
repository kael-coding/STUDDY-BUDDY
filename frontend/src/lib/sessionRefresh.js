import axios from "axios";

let refreshInFlight;
let cookieRequest = Promise.resolve();
let sessionRevision = 0;
let refreshedRevision = 0;

export function withSessionCookies(operation) {
    const pending = cookieRequest.then(() => globalThis.navigator?.locks
        ? navigator.locks.request("studdy-buddy-session", operation)
        : operation());
    cookieRequest = pending.catch(() => {});
    return pending;
}

export function sessionChanged() {
    sessionRevision++;
}

export function refreshSession() {
    if (!refreshInFlight) {
        const revision = sessionRevision;
        refreshInFlight = withSessionCookies(async () => {
            if (revision !== sessionRevision) return false;
            try {
                await axios.post("/api/auth/refresh", null, { withCredentials: true });
                refreshedRevision++;
                return revision === sessionRevision;
            } catch (error) {
                if (error.response?.status === 401) return false;
                throw error;
            }
        }).finally(() => { refreshInFlight = undefined; });
    }
    return refreshInFlight;
}

export function installSessionRefresh(client, onSessionExpired) {
    client.interceptors.request.use((config) => {
        config.sessionRevision ??= sessionRevision;
        config.refreshedRevision = refreshedRevision;
        return config;
    });
    client.interceptors.response.use(undefined, async (error) => {
        const { config, response } = error;
        if (response?.status !== 401 || response.data?.code !== "SESSION_REQUIRED" ||
            !config || config.sessionRevision !== sessionRevision) throw error;

        if (config.sessionRetried) throw error;
        config.sessionRetried = true;
        if (config.refreshedRevision !== refreshedRevision || await refreshSession()) {
            if (config.sessionRevision === sessionRevision) return client.request(config);
            throw error;
        }
        if (config.sessionRevision === sessionRevision) onSessionExpired();
        throw error;
    });
}
