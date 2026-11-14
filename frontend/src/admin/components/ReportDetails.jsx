import AdminDialog from "./AdminDialog.jsx";
import { ReportStatus } from "./ReportTable.jsx";
import { reportDate } from "./reportStatus.js";

const secondary = "rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold disabled:opacity-50";
const danger = "rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50";

export default function ReportDetails({ report, decision, onDecision, onReview, onClose, busy, error }) {
    const removing = report.status === "removing";
    const post = report.postId;
    const dismiss = decision === "dismiss";
    const title = decision ? (dismiss ? "Dismiss this report?" : "Remove this post?") : "Report details";
    const actions = decision ? (
        <>
            <button type="button" disabled={busy} onClick={() => onDecision(null)} className={secondary}>Back</button>
            <button type="button" disabled={busy} onClick={onReview} className={dismiss ? secondary : danger}>{busy ? "Saving…" : dismiss ? "Dismiss report" : removing ? "Finish removing" : "Remove post"}</button>
        </>
    ) : (
        <>
            {report.status === "pending" && <button type="button" onClick={() => onDecision("dismiss")} className={secondary}>Dismiss report</button>}
            {(removing || (report.status === "pending" && post)) &&
                <button type="button" onClick={() => onDecision("remove")} className={danger}>{removing ? "Finish removing" : "Remove post"}</button>}
        </>
    );

    return (
        <AdminDialog title={title} busy={busy} onClose={onClose} actions={actions}>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {decision ? (
                <p className="text-sm text-[#526c62]">{dismiss ? "The report will move to Dismissed. This action leaves the post as it is." : "The post will be hidden from the Community feed."}</p>
            ) : (
                <>
                    <div className="rounded-lg bg-[#f0f6f3] p-3 text-sm">
                        <p className="font-semibold">Reported content</p>
                        {post?.text && <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">{post.text}</p>}
                        {post?.image && <a href={post.image} target="_blank" rel="noreferrer"><img src={post.image} alt="Reported post attachment" className="mt-2 max-h-64 max-w-full rounded-lg object-contain" /></a>}
                        {!post && <p className="mt-2 text-[#526c62]">Post unavailable.</p>}
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-[#526c62]">Post author</dt><dd className="[overflow-wrap:anywhere]">{post?.user?.userName || "—"}</dd></div>
                        <div><dt className="text-[#526c62]">Date submitted</dt><dd>{reportDate(report.createdAt)}</dd></div>
                        <div><dt className="text-[#526c62]">Status</dt><dd className="mt-1"><ReportStatus status={report.status} /></dd></div>
                        <div className="col-span-2"><dt className="text-[#526c62]">Report reason</dt><dd className="whitespace-pre-wrap [overflow-wrap:anywhere]">{report.reason}</dd></div>
                    </dl>
                </>
            )}
        </AdminDialog>
    );
}
