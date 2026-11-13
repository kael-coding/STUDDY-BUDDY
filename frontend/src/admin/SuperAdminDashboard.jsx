import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, ClipboardList, Flag, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/superAdminApi.js";

export default function SuperAdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        adminApi.get("/overview", { signal: controller.signal })
            .then(({ data }) => setOverview(data))
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            });
        return () => controller.abort();
    }, []);

    const students = overview?.accounts.find(({ _id }) => _id === "user");
    const admins = overview?.accounts.find(({ _id }) => _id === "admin");
    const metrics = overview && [
        { label: "Student accounts", value: students?.total ?? 0, detail: `${students?.verified ?? 0} verified`, Icon: Users },
        { label: "Community admins", value: admins?.total ?? 0, detail: `${admins?.verified ?? 0} verified`, Icon: ShieldCheck },
        { label: "Tasks", value: overview.tasks, Icon: ClipboardList },
        { label: "Notes", value: overview.notes, Icon: BookOpen },
        { label: "Open post reports", value: overview.openReports, Icon: Flag },
    ];

    return (
        <div className="mx-auto max-w-6xl px-2 py-5 sm:px-6 sm:py-8">
            <h1 className="text-2xl font-bold text-[#233e35] sm:text-3xl">Super Admin Dashboard</h1>
            <p className="mt-2 text-sm text-[#4c6459]">Account, study activity, and moderation totals</p>
            {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">Could not load dashboard totals.</p>}
            {!overview && !error && <p role="status" className="mt-6">Loading dashboard…</p>}
            {metrics && (
                <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map(({ label, value, detail, Icon }) => (
                        <div key={label} className="rounded-xl border border-[#dbe6e0] bg-white p-5">
                            <dt className="flex items-center gap-2 text-sm font-medium text-[#4c6459]">
                                <Icon size={17} aria-hidden="true" /> {label}
                            </dt>
                            <dd className="mt-2 text-3xl font-bold tabular-nums text-[#233e35]">{value.toLocaleString()}</dd>
                            {detail && <dd className="mt-1 text-sm text-[#4c6459]">{detail}</dd>}
                        </div>
                    ))}
                </dl>
            )}
            <nav aria-label="Super admin tools" className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/user_management" className="flex items-center justify-between rounded-xl bg-[#346557] p-4 font-semibold text-white hover:bg-[#285044]">
                    User Management <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/admin_reports" className="flex items-center justify-between rounded-xl border border-[#cbd9d1] bg-white p-4 font-semibold text-[#346557] hover:bg-[#e9f2ed]">
                    Admin Reports <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
            </nav>
        </div>
    );
}
