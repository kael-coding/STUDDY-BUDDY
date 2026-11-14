import { useState } from "react";
import { Badge, Card, Icon, PriorityBadge } from "./PreviewElements.jsx";
import { PlannerPrev, LibPrev, FlashPrev, RadarPrev, FocusPrev, CommunityPrev } from "./Previews.jsx";
import { PreviewTabs, topics, tDot } from "./LandingElements.jsx";

const PREVIEWS = { Planner: <PlannerPrev />, Library: <LibPrev />, Flashcards: <FlashPrev />, 'Review Radar': <RadarPrev />, 'Focus Session': <FocusPrev /> }

function Showcase({ eyebrow, title, text, bullets, visual, flip }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-10 lg:py-14">
      <div className={flip ? 'lg:order-2' : ''}>
        <div className="text-xs font-semibold tracking-widest text-[var(--landing-brand)] mb-3">{eyebrow}</div>
        <h3 className="text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">{title}</h3>
        <p className="text-[var(--landing-muted)] mt-3 leading-relaxed">{text}</p>
        <ul className="mt-5 space-y-2.5">{bullets.map((b) => <li key={b} className="flex items-center gap-2.5 text-sm"><span className="size-5 rounded-full bg-[var(--landing-mint)] text-[var(--landing-brand)] grid place-items-center"><Icon n="check" s={12} /></span>{b}</li>)}</ul>
      </div>
      <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  )
}

export function LandingFeatures() {
  return (
      <section id="features" className="bg-[var(--landing-canvas)] border-y border-[var(--landing-line)]">
        <div className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center"><h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-tight">Everything you need for a more organized study routine</h2><p className="text-[var(--landing-muted)] mt-3">Keep your assessments, reviewers, and study activities connected.</p></div>
          <div className="mt-8 divide-y divide-[var(--landing-line)]">
            <Showcase eyebrow="STUDY PLANNER" title="Stay ahead of your deadlines" text="Manage quizzes, exams, assignments, and tasks with deadlines, priorities, and topic checklists." bullets={['Quiz, exam, assignment, and task types', 'Priorities and topic checklists']} visual={<PlannerPrev />} />
            <Showcase flip eyebrow="STUDY LIBRARY AND FLASHCARDS" title="Your reviewers, all in one place" text="Organize notes by subject and turn important information into flashcards for easier review." bullets={['Subject collections and pinned notes', 'Flashcards linked to each note']} visual={<div className="space-y-4"><LibPrev /></div>} />
            <Showcase eyebrow="REVIEW RADAR" title="Focus on what needs attention" text="Quickly find overdue assessments, unfinished topics, and flashcards that need another review." bullets={['Grouped by urgency', 'One click into the unfinished topic']} visual={<RadarPrev />} />
            <Showcase flip eyebrow="FOCUS SESSIONS AND STUDY PROGRESS" title="Build a consistent study routine" text="Use a focused study timer and monitor your completed study sessions throughout the week." bullets={['15, 25, or 50 minute sessions', 'Weekly focus minutes, Monday to Sunday']} visual={<FocusPrev />} />
            <Showcase eyebrow="STUDY GROUPS" title="Study together, learn together" text="Ask questions, share resources, and join academic discussions with classmates." bullets={['Public subject spaces', 'Posts, comments, and shared resources']} visual={<CommunityPrev />} />
          </div>
        </div>
      </section>
  );
}

export function StudyExample() {
  const [tab, setTab] = useState('Planner');
  return (
      <section className="bg-[var(--landing-canvas)] border-y border-[var(--landing-line)]">
        <div className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
          <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-center">See how your study tools work together</h2>
          <p className="text-center text-[var(--landing-muted)] mt-3">One example, connected across every tool.</p>
          <div className="grid lg:grid-cols-[320px_1fr] gap-6 mt-10 items-start">
            <Card className="p-5">
              <Badge t="green">Biology</Badge>
              <h3 className="font-semibold mt-3 leading-snug">Biology Quiz — Cell Structure and Function</h3>
              <dl className="text-sm mt-4 space-y-2.5">
                <div className="flex justify-between"><dt className="text-[var(--landing-muted)]">Type</dt><dd>Quiz</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--landing-muted)]">Deadline</dt><dd>Nov 20</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--landing-muted)]">Priority</dt><dd><PriorityBadge p="High" /></dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[var(--landing-muted)]">Reviewer</dt><dd className="text-right">Cell Structure Notes</dd></div>
                <div className="flex justify-between"><dt className="text-[var(--landing-muted)]">Flashcards</dt><dd>8 Got It · 4 Review Again</dd></div>
              </dl>
              <div className="mt-4 pt-4 border-t border-[var(--landing-line)] space-y-2">{topics.map(([t, s]) => <div key={t} className="flex items-center gap-2 text-sm"><span className={`size-2 rounded-full ${tDot(s)}`} />{t}<span className="ml-auto text-xs text-[var(--landing-muted)]">{s}</span></div>)}</div>
            </Card>
            <div>
              <PreviewTabs previews={PREVIEWS} value={tab} onChange={setTab} />
            </div>
          </div>
        </div>
      </section>
  );
}
