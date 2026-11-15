import { BookOpen, LayoutGrid, Search } from "lucide-react";
import { useState } from "react";

export default function SubjectSpaces({ spaces, total, selected, onSelect }) {
    const [search, setSearch] = useState("");
    const filtered = spaces.filter(({ label }) => label.toLowerCase().includes(search.trim().toLowerCase()));
    const items = [{ key: null, label: "All subjects", count: total }, ...filtered];

    return (
        <aside aria-labelledby="subject-spaces-title" className="min-w-0 rounded-xl border border-[#dce7e1] bg-white p-4">
            <h2 id="subject-spaces-title" className="mb-3 text-sm font-semibold text-[#233e35]">Subject spaces</h2>
            <label className="mb-3 flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-2.5 py-2 focus-within:border-[#346557]">
                <Search size={15} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                <input type="search" aria-label="Find a subject" placeholder="Find a subject" value={search}
                    onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" />
            </label>
            <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {items.map(({ key, label, count }) => (
                    <li key={key === null ? "all" : "subject:" + key}>
                        <button type="button" aria-pressed={selected === key} onClick={() => onSelect(key)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${selected === key ? "bg-[#e7f0ec] font-semibold text-[#294f43]" : "text-[#526c62] hover:bg-[#f4f8f6]"}`}>
                            {key === null ? <LayoutGrid size={16} className="shrink-0" aria-hidden="true" /> : <BookOpen size={16} className="shrink-0" aria-hidden="true" />}
                            <span className="flex-1 [overflow-wrap:anywhere]">{label}</span>
                            <span className="text-xs tabular-nums" aria-label={`${count} posts`}>{count}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {search.trim() && !filtered.length && <p className="px-2.5 pt-2 text-xs text-[#526c62]">No subjects found.</p>}
        </aside>
    );
}
