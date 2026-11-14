import { useId } from "react";

export const topics = [
    ["Cell Membrane", "Completed"],
    ["Cytoplasm", "Completed"],
    ["Nucleus", "In Progress"],
    ["Mitochondria", "Not Started"],
    ["Cell Division", "Not Started"],
];

export const tDot = (status) => ({
    Completed: "bg-[var(--landing-ok)]",
    "In Progress": "bg-[var(--landing-warn)]",
}[status] || "bg-[#a4b6ae]");

export function Logo() {
    return <span className="inline-flex items-center gap-2.5 whitespace-nowrap text-lg font-bold text-[var(--landing-ink)]">
        <span className="size-10 shrink-0 overflow-hidden rounded-lg">
            <img src="/logo.jpg" alt="" width={40} height={40}
                className="size-full -translate-y-px scale-125 object-cover" />
        </span>
        Study Buddy
    </span>;
}

export function Btn({ children, v = "primary", className = "h-10 px-4", onClick }) {
    const style = {
        primary: "bg-[var(--landing-deep)] text-white hover:bg-[var(--landing-brand-hover)]",
        secondary: "border border-[var(--landing-line)] bg-white text-[var(--landing-deep)] hover:bg-[var(--landing-mint)]",
        ghost: "text-[var(--landing-deep)] hover:bg-[var(--landing-mint)]",
    };
    return <button type="button" onClick={onClick}
        className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${style[v]} ${className}`}>
        {children}
    </button>;
}

export function PreviewTabs({ previews, value, onChange }) {
    const id = useId();
    const tabs = Object.keys(previews);
    const active = tabs.indexOf(value);

    const move = (event, index) => {
        const next = {
            ArrowLeft: (index + tabs.length - 1) % tabs.length,
            ArrowRight: (index + 1) % tabs.length,
            Home: 0,
            End: tabs.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        onChange(tabs[next]);
        event.currentTarget.parentElement.children[next]?.focus();
    };

    return <>
        <div role="tablist" aria-label="Study workspace preview" className="mb-5 flex flex-wrap gap-1 rounded-xl border border-[var(--landing-line)] bg-white p-1">
            {tabs.map((tab, index) => <button type="button" role="tab" key={tab}
                id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`}
                aria-selected={index === active} tabIndex={index === active ? 0 : -1}
                onClick={() => onChange(tab)} onKeyDown={(event) => move(event, index)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${index === active ? "bg-[var(--landing-mint)] text-[var(--landing-deep)]" : "text-[var(--landing-muted)] hover:bg-[var(--landing-canvas)]"}`}>
                {tab}
            </button>)}
        </div>
        {tabs.map((tab, index) => <div role="tabpanel" key={tab} id={`${id}-panel-${index}`}
            aria-labelledby={`${id}-tab-${index}`} hidden={index !== active} tabIndex={0}
            className={index === active ? "landing-fade-in" : ""}>
            {index === active && previews[tab]}
        </div>)}
    </>;
}
