import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, ClipboardList, Flag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/superAdminApi.js";
import { AdminHeading, AdminMetrics } from "./components/AdminPanels.jsx";

const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "short", timeZone: "UTC" });

export default function SuperAdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        adminApi.get("/overview", { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setOverview(data); })
            .catch(() => { if (!controller.signal.aborted) setError(true); });
        return () => controller.abort();
    }, [revision]);

    const accounts = overview?.accounts.reduce((total, account) => total + account.total, 0) ?? 0;
    const content = [["Tasks", overview?.tasks ?? 0], ["Notes", overview?.notes ?? 0]];
    const registrations = overview?.registrations ?? [];
    const peak = Math.max(1, ...registrations.map(({ count }) => count));

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="System Overview" description="Monitor accounts, study activity, and moderation." />
            {error && <p role="alert" className="text-sm text-red-700">Could not load dashboard totals. <button type="button" className="underline" onClick={() => { setError(false); setRevision(revision + 1); }}>Retry</button></p>}
            {!overview && !error && <p role="status">Loading dashboard…</p>}
            {overview && <>
                <AdminMetrics items={[
                    { label: "Total accounts", value: accounts, Icon: Users },
                    { label: "Total tasks", value: overview.tasks, Icon: ClipboardList },
                    { label: "Total notes", value: overview.notes, Icon: BookOpen },
                    { label: "Open reports", value: overview.openReports, Icon: Flag },
                ]} />
                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-[#dce7e1] bg-white p-5">
                        <h2 className="font-semibold">New accounts per month</h2>
                        <ul className="mt-4 grid grid-cols-6 gap-2 text-center text-xs">
                            {registrations.map(({ month, count }) => <li key={month}>
                                <p className="tabular-nums">{count}</p>
                                <div aria-hidden="true" className="mx-auto my-1 flex h-28 w-full max-w-10 items-end rounded bg-[#edf2ef]">
                                    <div className="w-full rounded bg-[#4d8172]" style={{ height: `${count / peak * 100}%` }} />
                                </div>
                                <time dateTime={month}>{monthLabel.format(new Date(month + "-01T00:00:00Z"))}</time>
                            </li>)}
                        </ul>
                    </section>
                    <section className="rounded-xl border border-[#dce7e1] bg-white p-5">
                        <h2 className="font-semibold">Content distribution</h2>
                        {content.map(([label, value]) => <div key={label} className="mt-4">
                            <div className="flex justify-between gap-2 text-sm"><span>{label}</span><span>{value.toLocaleString()}</span></div>
                            <progress className="mt-1 block w-full accent-[#346557]" aria-label={label} value={value} max={Math.max(1, overview.tasks + overview.notes)} />
                        </div>)}
                    </section>
                </div>
            </>}
            <nav aria-label="Super admin tools" className="grid gap-3 sm:grid-cols-2">
                {[["/user_management", "User Management"], ["/admin_reports", "Admin Reports"]].map(([to, label]) =>
                    <Link key={to} to={to} className="flex items-center justify-between rounded-xl border border-[#dce7e1] bg-white p-4 font-semibold text-[#346557] hover:bg-[#e7f0ec]">
                        {label}<ArrowUpRight size={17} aria-hidden="true" />
                    </Link>)}
            </nav>
        </div>
    );
}
