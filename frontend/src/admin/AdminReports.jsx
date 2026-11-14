import { useEffect, useState } from "react";
import { adminApi } from "@/lib/superAdminApi.js";
import { AdminHeading } from "./components/AdminPanels.jsx";
import ReportMetrics from "./components/ReportMetrics.jsx";
import ReportTable from "./components/ReportTable.jsx";
import { reportMetrics, reportStatus } from "./components/reportStatus.js";

export default function AdminReports() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        adminApi.get("/reports", { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setResult(data); })
            .catch(() => { if (!controller.signal.aborted) setError(true); });
        return () => controller.abort();
    }, [revision]);

    const total = result ? reportMetrics(result.summary).total : 0;

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="Admin Reports" description="Moderation activity and recent post reports." />
            {error && <p role="alert" className="text-sm text-red-700">Could not load reports. <button type="button" className="underline" onClick={() => { setError(false); setRevision(revision + 1); }}>Retry</button></p>}
            {!result && !error && <p role="status">Loading reports…</p>}
            {result && <>
                <ReportMetrics summary={result.summary} />
                <div className="grid items-start gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
                    <section className="rounded-xl border border-[#dce7e1] bg-white p-5">
                        <h2 className="font-semibold">Status distribution</h2>
                        <div aria-hidden="true" className="my-3 flex h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                            {Object.entries(reportStatus).map(([key, { color }]) => <div key={key} style={{ backgroundColor: color, width: `${(result.summary[key] ?? 0) / Math.max(1, total) * 100}%` }} />)}
                        </div>
                        <dl className="space-y-2 text-sm">
                            {Object.entries(reportStatus).map(([key, { label, color }]) => <div key={key} className="flex justify-between gap-3">
                                <dt className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: color }} />{label}</dt>
                                <dd className="tabular-nums">{result.summary[key] ?? 0}</dd>
                            </div>)}
                        </dl>
                    </section>
                    <section className="min-w-0">
                        <h2 className="mb-2 font-semibold">Recent reports</h2>
                        <ReportTable reports={result.recentReports ?? []} />
                    </section>
                </div>
            </>}
        </div>
    );
}
