export default function ViewFilters({ label, options, value, onChange }) {
    return (
        <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg bg-[#e7efeb] p-1">
            {options.map(([key, title]) => (
                <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${value === key ? "bg-white text-[#233e35] shadow-sm" : "text-[#526c62] hover:bg-white/60"}`}>
                    {title}
                </button>
            ))}
        </div>
    );
}
