import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore.js";
import { homeForRole } from "@/lib/homeForRole.js";
import { Icon } from "@/components/landing/PreviewElements.jsx";
import { DashPrev, CommunityPrev } from "@/components/landing/Previews.jsx";
import { Btn, Logo } from "@/components/landing/LandingElements.jsx";
import { LandingFeatures, StudyExample } from "@/components/landing/FeatureSections.jsx";
import "@/components/landing/landing.css";

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const workspace = isAuthenticated && user ? (user.isVerified ? homeForRole(user.role) : '/verify-email') : null;
  const navigate = useNavigate();
  const go = (path) => navigate(workspace || path);
  const primaryLabel = workspace ? 'Open Workspace' : 'Get Started';
  const [open, setOpen] = useState(false)
  const nav = [['Home', 'top'], ['Features', 'features'], ['How It Works', 'how'], ['Study Groups', 'groups'], ['About', 'about']]
  const jump = (id) => {
    setOpen(false);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    document.getElementById(id)?.scrollIntoView({ behavior });
  };

  const steps = [['calendar', 'Plan', 'Create an assessment with a deadline and topic checklist.'], ['link', 'Organize', 'Link the reviewer you need.'], ['cards', 'Review', 'Practice flashcards and identify difficult questions.'], ['timer', 'Focus', 'Start a timed study session.'], ['chart', 'Track', 'Review your study activity for the week.']]
  return (
    <div id="top" className="study-landing bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--landing-line)]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button type="button" onClick={() => jump('top')}><Logo /></button>
          <nav className="hidden lg:flex gap-1">{nav.map(([l, id]) => <button key={l} onClick={() => jump(id)} className="px-3 h-9 text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)] rounded-lg hover:bg-[var(--landing-mint)]">{l}</button>)}</nav>
          <div className="hidden lg:flex gap-2">{!workspace && <Btn v="ghost" onClick={() => go('/login')}>Log In</Btn>}<Btn onClick={() => go('/signup')}>{primaryLabel}</Btn></div>
          <button type="button" className="lg:hidden size-10 grid place-items-center" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}><Icon n={open ? 'x' : 'menu'} s={22} /></button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-[var(--landing-line)] px-5 py-3 bg-white landing-fade-in">
            {nav.map(([l, id]) => <button key={l} onClick={() => jump(id)} className="block w-full text-left h-11 text-sm">{l}</button>)}
            <div className="flex gap-2 pt-2 pb-1">{!workspace && <Btn v="secondary" className="flex-1" onClick={() => go('/login')}>Log In</Btn>}<Btn className="flex-1" onClick={() => go('/signup')}>{primaryLabel}</Btn></div>
          </div>
        )}
      </header>

      <main>
      <section className="max-w-6xl mx-auto px-5 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        <div>
          <div className="text-xs font-semibold tracking-widest text-[var(--landing-brand)] mb-4">YOUR STUDY WORKSPACE</div>
          <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] font-bold tracking-tight leading-[1.05]">Make studying easier to manage.</h1>
          <p className="text-lg text-[var(--landing-muted)] mt-5 max-w-lg leading-relaxed">Plan your assessments, organize your reviewers, practice flashcards, and connect with classmates—all in one place.</p>
          <div className="flex flex-wrap gap-3 mt-8"><Btn className="h-12 px-6 text-[15px]" onClick={() => go('/signup')}>{workspace ? primaryLabel : 'Get Started for Free'}</Btn><Btn v="secondary" className="h-12 px-6 text-[15px]" onClick={() => jump('features')}>Explore Features</Btn></div>
        </div>
        <DashPrev />
      </section>

      <LandingFeatures />

      <section id="how" className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
        <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-center">From planning to progress in five steps</h2>
        <div className="grid md:grid-cols-5 gap-8 md:gap-4 mt-12 relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-[var(--landing-line)]" />
          {steps.map(([i, t, d]) => (
            <div key={t} className="relative text-center md:px-2">
              <span className="relative mx-auto size-12 rounded-full bg-white border border-[var(--landing-line)] text-[var(--landing-brand)] grid place-items-center"><Icon n={i} s={22} /></span>

              <div className="font-semibold mt-0.5">{t}</div>
              <p className="text-sm text-[var(--landing-muted)] mt-1.5 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <StudyExample />

      <section id="groups" className="max-w-6xl mx-auto px-5 py-16 lg:py-20 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div><h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-tight">A study community built around your subjects</h2><p className="text-[var(--landing-muted)] mt-4 leading-relaxed">Join public subject spaces, share your reviewers, and get help from classmates who are studying the same material.</p></div>
        <CommunityPrev />
      </section>

      <section id="about" className="px-5 pb-16">
        <div className="max-w-6xl mx-auto bg-[var(--landing-mint)] rounded-2xl py-14 px-6 text-center">
          <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[var(--landing-deep)]">Ready to organize your study routine?</h2>
          <p className="text-[var(--landing-muted)] mt-3 max-w-lg mx-auto">Bring your tasks, reviewers, and study sessions into one connected workspace.</p>
          <div className="flex justify-center gap-3 mt-7 flex-wrap"><Btn className="h-11 px-6" onClick={() => go('/signup')}>{workspace ? primaryLabel : 'Create an Account'}</Btn>{!workspace && <Btn v="secondary" className="h-11 px-6" onClick={() => go('/login')}>Log In</Btn>}</div>
        </div>
      </section>

      </main>

      <footer className="border-t border-[var(--landing-line)] bg-[var(--landing-canvas)]">
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-8">
          <div><Logo /><p className="text-sm text-[var(--landing-muted)] mt-3 max-w-xs">Your workspace for planning, reviewing, and studying together.</p></div>
          <div><div className="text-sm font-semibold mb-3">Navigation</div>{nav.slice(0, 4).map(([l, id]) => <button key={l} onClick={() => jump(id)} className="block text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)] mb-2">{l}</button>)}</div>
          <div>
            <div className="text-sm font-semibold mb-3">Account</div>
            <button type="button" onClick={() => go('/signup')} className="block text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)] mb-2">{workspace ? primaryLabel : 'Sign Up'}</button>
            {!workspace && <button type="button" onClick={() => go('/login')} className="block text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)]">Log In</button>}
          </div>

        </div>
        <div className="border-t border-[var(--landing-line)] py-5 text-center text-xs text-[var(--landing-muted)]">© {new Date().getFullYear()} Study Buddy. All rights reserved.</div>
      </footer>
    </div>
  )
}
