import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { decidePostReport, getPostReports } from "@/lib/communityReports.js";

export default function CommunityReports() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(null);
    const [error, setError] = useState("");

    const loadReports = async () => {
        setLoading(true);
        setError("");
        try {
            setReports(await getPostReports());
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const review = async (reportId, decision) => {
        if (decision === "remove" && !window.confirm("Remove this post from Community?")) return;
        setReviewing(reportId);
        try {
            const { data } = await decidePostReport(reportId, decision);
            toast.success(data.message);
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not save the decision. Try again.");
        } finally {
            await loadReports();
            setReviewing(null);
        }
    };

    return (
        <section className="mx-auto max-w-4xl p-4 text-gray-900 sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Community Reports</h1>
                <button type="button" onClick={loadReports} disabled={loading || !!reviewing} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50">
                    Refresh
                </button>
            </div>
            {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
            {loading && <p role="status" className="mb-4 text-sm">Loading reports…</p>}
            {reports?.length === 0 && !loading && !error && <p>No pending reports.</p>}
            <ul className="space-y-4">
                {reports?.map((report) => (
                    <li key={report._id} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div>
                            <h2 className="text-sm font-semibold">Report reason</h2>
                            <p className="whitespace-pre-wrap break-words">{report.reason}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3">
                            {report.postId ? (
                                <>
                                    {report.postId.text && <p className="whitespace-pre-wrap break-words">{report.postId.text}</p>}
                                    {report.postId.image && <img src={report.postId.image} alt="Reported post attachment" loading="lazy" className="mt-2 max-h-64 max-w-full rounded object-contain" />}
                                </>
                            ) : <p className="text-sm text-gray-600">This post is no longer visible.</p>}
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            {report.status === "pending" && (
                                <button type="button" onClick={() => review(report._id, "dismiss")} disabled={!!reviewing || loading} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50">
                                    Dismiss Report
                                </button>
                            )}
                            {(report.postId || report.status === "removing") && (
                                <button type="button" onClick={() => review(report._id, "remove")} disabled={!!reviewing || loading} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    {report.status === "removing" ? "Finish Removing" : "Remove Post"}
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
