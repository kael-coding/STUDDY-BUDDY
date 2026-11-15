import { topics, tDot } from "./LandingElements.jsx";
import { Avatar, Badge, Bars, Card, Icon, PriorityBadge, Progress, Ring } from './PreviewElements.jsx';

const MiniSide = ({ active = 'Dashboard' }) => (
  <div className="w-36 bg-[var(--landing-brand)] p-3 text-white shrink-0 hidden sm:block">
    <div className="text-[12px] font-semibold mb-3">Study Buddy</div>
    {[['home', 'Dashboard'], ['radar', 'Review Radar'], ['calendar', 'Study Planner'], ['book', 'Study Library'], ['cards', 'Flashcards'], ['timer', 'Focus Session'], ['chart', 'Progress']].map(([i, l]) => (
      <div key={l} className={`flex items-center gap-2 text-[11px] px-2 h-7 rounded-md mb-0.5 ${l === active ? 'bg-[var(--landing-sel)] text-[var(--landing-ink)]' : 'text-white/90'}`}><Icon n={i} s={13} />{l}</div>
    ))}
  </div>
)
const Frame = ({ children, side }) => (
  <div className="bg-white border border-[var(--landing-line)] rounded-xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(54,94,83,.25)] flex text-left">
    <MiniSide active={side} />
    <div className="flex-1 bg-[var(--landing-canvas)] p-4 min-w-0">{children}</div>
  </div>
)
const Reviewer = () => <div className="flex items-center gap-2 text-xs text-[var(--landing-muted)]"><Icon n="link" s={13} />Biology — Cell Structure Notes</div>

export function DashPrev() {
  return (
    <Frame>
      <div className="flex justify-between items-center mb-3"><div><div className="text-sm font-semibold">Good morning, Alex</div><div className="text-[11px] text-[var(--landing-muted)]">Sample workspace</div></div><Avatar name="Alex Rivera" size={26} /></div>
      <div className="bg-[var(--landing-brand)] text-white rounded-lg p-3.5 mb-3">
        <div className="text-[10px] opacity-80 tracking-wider">START STUDYING</div>
        <div className="font-semibold text-[13px] mt-1">Biology Quiz — Cell Structure</div>
        <div className="text-[11px] opacity-90 mt-0.5">Current topic: Nucleus · 2 of 5 topics</div>
        <div className="h-1.5 rounded-full bg-white/25 mt-2.5"><div className="h-full w-2/5 bg-white rounded-full" /></div>
        <span className="inline-block mt-3 bg-white text-[var(--landing-deep)] text-[11px] font-medium px-3 py-1.5 rounded-md">Start Studying</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-[var(--landing-line)] rounded-lg p-3"><div className="text-[11px] font-medium mb-1.5">Upcoming deadline</div><div className="text-xs">Biology Quiz</div><div className="text-[11px] text-[var(--landing-muted)] mb-1.5">Nov 20</div><PriorityBadge p="High" /></div>
        <div className="bg-white border border-[var(--landing-line)] rounded-lg p-3"><div className="text-[11px] font-medium mb-1.5">Flashcards to review</div><div className="text-xl font-semibold">4</div><Reviewer /></div>
      </div>
      <div className="bg-white border border-[var(--landing-line)] rounded-lg p-3 mt-2.5 space-y-1.5">
        {topics.slice(0, 3).map(([t, s]) => <div key={t} className="flex items-center gap-2 text-xs"><span className={`size-2 rounded-full ${tDot(s)}`} />{t}<span className="ml-auto text-[10px] text-[var(--landing-muted)]">{s}</span></div>)}
      </div>
    </Frame>
  )
}
export function PlannerPrev() {
  return (
    <Frame side="Study Planner">
      <div className="text-sm font-semibold mb-3">Study Planner</div>
      {[['Biology Quiz — Cell Structure', 'Quiz · Biology', 'Nov 20', 'High', 2], ['Data Structures Midterm', 'Exam · Computer Science', 'Nov 25', 'High', 1], ['Calculus Problem Set 4', 'Assignment · Mathematics', 'Nov 13', 'Medium', 1]].map(([t, m, d, p, n]) => (
        <div key={t} className="bg-white border border-[var(--landing-line)] rounded-lg p-3 mb-2 flex items-center gap-3">
          <div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{t}</div><div className="text-[11px] text-[var(--landing-muted)]">{m} · {d}</div><Progress value={n} max={5} className="mt-2 max-w-40" /></div>
          <PriorityBadge p={p} />
        </div>
      ))}
    </Frame>
  )
}
export function FlashPrev() {
  return (
    <Frame side="Flashcards">
      <div className="flex justify-between text-xs mb-2"><span className="font-medium">Cell Structure Notes</span><span className="text-[var(--landing-muted)]">Card 4 of 12</span></div>
      <Progress value={4} max={12} className="mb-3" />
      <div className="bg-white border border-[var(--landing-line)] rounded-lg p-5 text-center">
        <div className="text-[10px] text-[var(--landing-muted)] tracking-wider mb-2">QUESTION</div>
        <div className="text-sm font-medium">What is the main function of the mitochondria?</div>
        <div className="mt-4 text-xs text-[var(--landing-muted)]">Mitochondria produce most of the cell’s ATP through cellular respiration.</div>
      </div>
      <div className="flex gap-2 mt-3"><span className="flex-1 text-center text-xs h-8 grid place-items-center rounded-md bg-[var(--landing-mint)] text-[var(--landing-ok)] font-medium">Got It · 8</span><span className="flex-1 text-center text-xs h-8 grid place-items-center rounded-md bg-[#FAF0DC] text-[#9A6A1E] font-medium">Review Again · 4</span></div>
    </Frame>
  )
}
export function LibPrev() {
  return (
    <Frame side="Study Library">
      <div className="flex justify-between mb-3"><span className="text-sm font-semibold">Study Library</span><Badge t="green">4 subjects</Badge></div>
      <div className="grid grid-cols-2 gap-2.5">
        {[['Cell Structure Notes', 'Biology', true], ['Differentiation Rules', 'Mathematics', true], ['Web Fundamentals', 'Computer Science', false], ['Essay Structure', 'English', false]].map(([t, s, f]) => (
          <div key={t} className="bg-white border border-[var(--landing-line)] rounded-lg p-3"><div className="flex justify-between"><Badge t="green">{s}</Badge>{f && <Icon n="cards" s={14} className="text-[var(--landing-brand)]" />}</div><div className="text-xs font-medium mt-2">{t}</div><div className="text-[11px] text-[var(--landing-muted)] mt-1">Updated Nov 12</div></div>
        ))}
      </div>
    </Frame>
  )
}
export function RadarPrev() {
  return (
    <Frame side="Review Radar">
      <div className="text-sm font-semibold mb-3">Review Radar</div>
      <div className="grid grid-cols-2 gap-2 mb-3">{[['Overdue', '2', 'text-[var(--landing-bad)]'], ['Due in 7 days', '2', 'text-[var(--landing-warn)]'], ['Unfinished topics', '12', ''], ['Review again', '4', '']].map(([l, v, c]) => <div key={l} className="bg-white border border-[var(--landing-line)] rounded-lg p-2.5"><div className={`text-lg font-semibold ${c}`}>{v}</div><div className="text-[11px] text-[var(--landing-muted)]">{l}</div></div>)}</div>
      <div className="bg-white border border-[var(--landing-line)] rounded-lg p-3 text-xs"><div className="flex justify-between font-medium">Biology Quiz<Badge t="warn">In 7 days</Badge></div><div className="text-[var(--landing-muted)] mt-1">3 unfinished topics · Nucleus, Mitochondria, Cell Division</div></div>
    </Frame>
  )
}
export function FocusPrev() {
  return (
    <Frame side="Focus Session">
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <div className="grid place-items-center bg-white border border-[var(--landing-line)] rounded-lg p-3"><Ring pct={0.35} size={120} stroke={8}><div className="text-center"><div className="text-2xl font-semibold tabular-nums">25:00</div><div className="text-[10px] text-[var(--landing-muted)]">Biology Quiz</div></div></Ring></div>
        <div className="bg-white border border-[var(--landing-line)] rounded-lg p-3"><div className="text-[11px] font-medium mb-2">This week · 225 min</div><Bars h={50} data={[['M', 45], ['T', 75], ['W', 25], ['T', 50], ['F', 30], ['S', 0], ['S', 0]].map(([l, v]) => ({ l: l, v: v }))} /></div>
      </div>
    </Frame>
  )
}
export function CommunityPrev() {
  return (
    <Card className="p-5 text-left">
      <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><span className="size-9 rounded-lg bg-[var(--landing-mint)] text-[var(--landing-brand)] grid place-items-center"><Icon n="users" /></span><div><div className="font-medium text-sm">General Biology</div><div className="text-xs text-[var(--landing-muted)]">Biology subject space</div></div></div><Badge t="green">Public</Badge></div>
      <div className="flex gap-3">
        <Avatar name="Maria Santos" />
        <div className="flex-1">
          <div className="flex items-baseline gap-2"><span className="text-sm font-medium">Maria Santos</span><span className="text-xs text-[var(--landing-muted)]">2 hours ago</span></div>
          <p className="text-sm mt-1.5 leading-relaxed">Does anyone have additional notes about cell division? I'm preparing for our quiz next week.</p>
          <div className="flex gap-4 mt-3 text-xs text-[var(--landing-muted)]"><span className="flex items-center gap-1.5"><Icon n="heart" s={14} />12 Likes</span><span className="flex items-center gap-1.5"><Icon n="msg" s={14} />3 Comments</span></div>
          <div className="mt-3 pl-3 border-l-2 border-[var(--landing-line)] flex gap-2.5"><Avatar name="Daniel Cruz" size={28} /><div><span className="text-xs font-medium">Daniel Cruz</span><p className="text-xs text-[var(--landing-muted)] mt-0.5">I can share my mitosis summary here. Which phase are you reviewing?</p></div></div>
        </div>
      </div>
    </Card>
  )
}

