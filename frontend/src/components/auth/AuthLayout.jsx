import { Link } from "react-router-dom";
import { Logo } from "@/components/landing/LandingElements.jsx";
import "@/components/landing/landing.css";

export default function AuthLayout({ title, subtitle, footer, children }) {
    return (
        <div className="study-landing grid min-h-dvh bg-[#f6f8f7] lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)]">
            <aside className="hidden flex-col bg-[#28483d] bg-[url('/auth-study-desk.png')] bg-cover bg-bottom px-10 py-10 text-white lg:flex xl:px-[9%]">
                <Link to="/" className="self-start"><Logo light /></Link>
                <div className="mb-44 mt-[clamp(2.5rem,7vh,6rem)] max-w-xl">
                    <h2 className="max-w-[16ch] text-[clamp(2.25rem,3.8vw,3.5rem)] font-bold leading-[1.08] tracking-tight">
                        Plan it. Review it. Focus on it.
                    </h2>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-white/95 xl:text-lg">
                        Your assessments, reviewers, and flashcards in one connected workspace.
                    </p>
                    <div className="mt-7 max-w-md rounded-2xl border border-white/30 bg-[#254337]/90 p-5 shadow-lg backdrop-blur-sm">
                        <p className="text-xs text-white/90">Sample assessment</p>
                        <p className="mt-1 font-semibold">Biology Quiz — Cell Structure</p>
                        <div aria-hidden="true" className="mt-3 h-1.5 rounded-full bg-white/25">
                            <div className="h-full w-2/5 rounded-full bg-white" />
                        </div>
                        <p className="mt-2 text-xs text-white/90">2 of 5 topics completed</p>
                    </div>
                </div>
            </aside>
            <main className="grid place-items-center px-6 py-10 sm:px-12 lg:px-16">
                <div className="landing-fade-in w-full max-w-[480px]">
                    <Link to="/" className="mb-8 inline-flex lg:hidden"><Logo /></Link>
                    <header className="mb-8 lg:mb-10 lg:text-center">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#294c41] sm:text-4xl xl:text-5xl">{title}</h1>
                        <p className="mt-2 text-sm text-[var(--landing-muted)] sm:text-base">{subtitle}</p>
                    </header>
                    {children}
                    {footer && <div className="mt-7 text-center text-sm text-[var(--landing-muted)]">{footer}</div>}
                </div>
            </main>
        </div>
    );
}
