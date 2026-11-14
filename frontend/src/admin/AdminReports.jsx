import { useEffect, useState } from "react";
import { adminApi } from "@/lib/superAdminApi.js";

const statuses = [
    ["pending", "Pending review"],
    ["removing", "Removal in progress"],
    ["dismissed", "Dismissed"],
    ["removed", "Reports resolved by removal"],
];

export default function AdminReports() {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        adminApi.get("/reports", { signal: controller.signal })
            .then(({ data }) => setSummary(data.summary))
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            });
        return () => controller.abort();
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-2 py-5 sm:px-6 sm:py-8">
            <h1 className="text-2xl font-bold text-[#233e35] sm:text-3xl">Admin Reports</h1>
            <p className="mt-2 text-sm text-[#4c6459]">Community post reports by review status</p>
            {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">Could not load the reports summary.</p>}
            {!summary && !error && <p role="status" className="mt-6">Loading reports…</p>}
            {summary && (
                <dl className="mt-6 divide-y divide-[#dbe6e0] rounded-xl border border-[#dbe6e0] bg-white">
                    {statuses.map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                            <dt>{label}</dt>
                            <dd className="font-semibold tabular-nums text-[#233e35]">{summary[key].toLocaleString()}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}
