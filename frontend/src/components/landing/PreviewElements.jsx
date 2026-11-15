import {
    BookOpen, CalendarDays, Check, Heart, House, Layers, Link, MessageCircle,
    Menu, Radar, Timer, TrendingUp, Users, X,
} from "lucide-react";

const icons = {
    book: BookOpen, calendar: CalendarDays, cards: Layers, chart: TrendingUp,
    check: Check, heart: Heart, home: House, link: Link, msg: MessageCircle,
    menu: Menu, radar: Radar, timer: Timer, users: Users, x: X,
};

export function Icon({ n, s = 18, className }) {
    const Glyph = icons[n];
    return <Glyph size={s} className={className} aria-hidden="true" />;
}

export function Avatar({ name, size = 32 }) {
    const initials = name.split(" ").map((word) => word[0]).join("");
    return <span aria-hidden="true" style={{ width: size, height: size }}
        className="grid shrink-0 place-items-center rounded-full bg-[#ded7ed] text-xs font-semibold text-[#48365f]">{initials}</span>;
}

export function Card({ children, className = "" }) {
    return <div className={`min-w-0 rounded-xl border border-[var(--landing-line)] bg-white ${className}`}>{children}</div>;
}

export function Badge({ children, t }) {
    const tone = t === "warn" ? "bg-[#faf0dc] text-[#85550e]" : "bg-[var(--landing-mint)] text-[#315f50]";
    return <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{children}</span>;
}

export function PriorityBadge({ p }) {
    return <Badge t={p === "High" ? "warn" : "green"}>{p} priority</Badge>;
}

export function Progress({ value, max, className = "" }) {
    return <div className={`h-1.5 overflow-hidden rounded-full bg-[var(--landing-sel)] ${className}`}>
        <div className="h-full rounded-full bg-[var(--landing-brand)]" style={{ width: `${100 * value / max}%` }} />
    </div>;
}

export function Ring({ pct, size, stroke, children }) {
    return <div className="relative grid shrink-0 place-items-center rounded-full" style={{
        width: size, height: size,
        background: `conic-gradient(var(--landing-brand) ${pct * 100}%, var(--landing-mint) 0)`,
    }}>
        <div className="absolute rounded-full bg-white" style={{ inset: stroke }} />
        <div className="relative">{children}</div>
    </div>;
}

export function Bars({ data, h }) {
    const max = Math.max(...data.map(({ v }) => v), 1);
    return <div className="flex items-end justify-between gap-1.5">
        {data.map(({ l, v }, index) => <div key={index} className="flex flex-1 flex-col items-center gap-1 text-[10px] text-[var(--landing-muted)]">
            <span className="w-full max-w-6 rounded-t bg-[#6c9d8c]" style={{ height: Math.max(2, v * h / max) }} />
            <span>{l}</span>
        </div>)}
    </div>;
}
