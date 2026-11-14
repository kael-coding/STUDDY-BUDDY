import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeading } from "./components/AdminPanels.jsx";
import ReportDetails from "./components/ReportDetails.jsx";
import ReportMetrics from "./components/ReportMetrics.jsx";
import ReportTable from "./components/ReportTable.jsx";
import { reportStatus } from "./components/reportStatus.js";
import { decidePostReport, getPostReports } from "@/lib/communityReports.js";

const filters = { open: "Open", all: "All reports", ...Object.fromEntries(Object.entries(reportStatus).map(([key, value]) => [key, value.label])) };
const button = "rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec] disabled:opacity-50";

export default function CommunityReports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("open");
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState(null);
    const [decision, setDecision] = useState(null);
    const [reviewing, setReviewing] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const reload = () => setRevision((value) => value + 1);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        getPostReports({ status, page }, controller.signal)
            .then((result) => {
                if (controller.signal.aborted) return;
                if (page > result.pages) setPage(result.pages);
                else setData(result);
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) setError(requestError.response?.data?.message || "Could not load reports.");
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [status, page, revision]);

    const review = async () => {
        if (reviewing || !selected || !decision) return;
        setReviewing(true);
        setReviewError("");
        try {
            const { data: response } = await decidePostReport(selected._id, decision);
            toast.success(response.message);
            setSelected(null);
        } catch (requestError) {
            setReviewError(requestError.response?.data?.message || "Could not save the decision. Try again.");
        } finally {
            setReviewing(false);
            reload();
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="Community Reports" description="Review reported posts from Study Groups.">
                <button type="button" onClick={reload} disabled={loading} className={button}>Refresh</button>
            </AdminHeading>
            {data && <ReportMetrics summary={data.summary} />}
            <div aria-label="Filter reports" className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, label]) => (
                    <button key={key} type="button" aria-pressed={status === key} className={button + (status === key ? " !border-[#346557] !bg-[#e7f0ec]" : "")}
                        onClick={() => { setStatus(key); setPage(1); }}>{label}</button>
                ))}
            </div>
            {loading && <p role="status" className="text-sm text-[#526c62]">Loading reports…</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {!loading && !error && data && (
                <>
                    <ReportTable reports={data.reports} onDetails={(report) => { setSelected(report); setDecision(null); setReviewError(""); }} />
                    {data.pages > 1 && <nav aria-label="Report pages" className="flex items-center justify-end gap-3 text-sm">
                        <button className={button} type="button" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
                        <span>Page {page} of {data.pages}</span>
                        <button className={button} type="button" onClick={() => setPage(page + 1)} disabled={page === data.pages}>Next</button>
                    </nav>}
                </>
            )}
            {selected && <ReportDetails report={selected} decision={decision} busy={reviewing} error={reviewError}
                onDecision={(next) => { setDecision(next); setReviewError(""); }} onReview={review} onClose={() => setSelected(null)} />}
        </div>
    );
}
