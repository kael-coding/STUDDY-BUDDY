const windowMs = 15 * 60 * 1000;
const attempts = new Map();
let nextCleanupAt = 0;

export const passwordResetRateLimit = (req, res, next) => {
    const now = Date.now();
    if (now >= nextCleanupAt) {
        for (const [key, entry] of attempts) {
            if (entry.expiresAt <= now) attempts.delete(key);
        }
        nextCleanupAt = now + windowMs;
    }

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const limits = [[`ip:${req.ip}`, 30]];
    if (email && email.length <= 254) limits.push([`email:${email}`, 5]);

    const counters = limits.map(([key, limit]) => {
        const existing = attempts.get(key);
        const entry = existing?.expiresAt > now ? existing : { count: 0, expiresAt: now + windowMs };
        return { key, limit, entry };
    });
    const blocked = counters.filter(({ limit, entry }) => entry.count >= limit);
    if (blocked.length) {
        const retryAt = Math.max(...blocked.map(({ entry }) => entry.expiresAt));
        res.set("Retry-After", String(Math.ceil((retryAt - now) / 1000)));
        return res.status(429).json({ success: false, message: "Too many reset requests. Please try again later." });
    }

    for (const { key, entry } of counters) {
        entry.count++;
        attempts.set(key, entry);
    }
    next();
};
