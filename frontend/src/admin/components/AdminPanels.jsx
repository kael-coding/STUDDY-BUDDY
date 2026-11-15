const number = new Intl.NumberFormat("en-PH");

export function AdminHeading({ title, description, children }) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#233e35] sm:text-3xl">{title}</h1>
                <p className="mt-1 text-sm text-[#526c62]">{description}</p>
            </div>
            {children}
        </header>
    );
}

export function AdminMetrics({ items }) {
    return (
        <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {items.map((item) => {
                const { label, value, detail, Icon } = item;
                return (
                    <div key={label} className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-[#dce7e1] bg-white p-4 sm:p-5">
                        <div className="min-w-0">
                            <dt className="text-sm font-medium text-[#526c62]">{label}</dt>
                            <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{number.format(value)}</dd>
                            {detail && <dd className="mt-1 text-xs text-[#526c62]">{detail}</dd>}
                        </div>
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e7f0ec] text-[#346557]"><Icon size={16} aria-hidden="true" /></span>
                    </div>
                );
            })}
        </dl>
    );
}
