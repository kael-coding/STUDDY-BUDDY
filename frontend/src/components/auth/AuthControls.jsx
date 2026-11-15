import { AlertCircle, LoaderCircle } from "lucide-react";

export const authLink = "font-semibold text-[var(--landing-deep)] hover:underline";

export function AuthError({ children }) {
    if (!children) return null;
    return (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {children}
        </p>
    );
}

export function AuthButton({ children, busy, disabled, secondary = false, type = "submit", onClick }) {
    const tone = secondary
        ? "border border-[var(--landing-line)] text-[var(--landing-deep)] hover:bg-[var(--landing-mint)]"
        : "bg-[var(--landing-deep)] text-white hover:bg-[var(--landing-brand-hover)]";
    return (
        <button type={type} onClick={onClick} disabled={busy || disabled} aria-busy={busy || undefined}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors disabled:opacity-50 ${tone}`}>
            {busy && <LoaderCircle size={16} aria-hidden="true" className="motion-safe:animate-spin" />}
            {children}
        </button>
    );
}
