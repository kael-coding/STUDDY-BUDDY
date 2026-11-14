import { reportDate, reportStatus } from "./reportStatus.js";

export function ReportStatus({ status }) {
    const badge = reportStatus[status];
    return <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${badge?.badge || "bg-gray-100 text-gray-700"}`}>{badge?.label || status}</span>;
}

export default function ReportTable({ reports, onDetails }) {
    if (!reports.length) {
        return <p className="rounded-xl border border-[#dce7e1] bg-white p-7 text-center text-sm text-[#526c62]">No reports in this view.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-[#dce7e1] bg-white">
            <table aria-label="Post reports" className="w-full min-w-[36rem] table-fixed text-left text-sm">
                <thead className="bg-[#f0f6f3] text-xs text-[#425d52]">
                    <tr>
                        <th scope="col" className="w-[30%] p-3">Reported content</th>
                        <th scope="col" className="p-3">Reason</th>
                        <th scope="col" className="w-36 p-3">Status</th>
                        <th scope="col" className="w-28 p-3">Date</th>
                        {onDetails && <th scope="col" className="w-24 p-3">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ef]">
                    {reports.map((report) => (
                        <tr key={report._id} className="align-top">
                            <td className="p-3">
                                <p className="line-clamp-2 font-medium [overflow-wrap:anywhere]">{report.postId?.text || (report.postId?.image ? "Image attachment" : "Post unavailable")}</p>
                                <p className="mt-1 text-xs text-[#526c62] [overflow-wrap:anywhere]">{[report.postId?.user?.userName, report.postId?.subject].filter(Boolean).join(" · ")}</p>
                            </td>
                            <td className="p-3 text-[#526c62]"><p className="line-clamp-2 [overflow-wrap:anywhere]">{report.reason}</p></td>
                            <td className="p-3"><ReportStatus status={report.status} /></td>
                            <td className="p-3 text-xs text-[#526c62]">{reportDate(report.createdAt)}</td>
                            {onDetails && <td className="p-3"><button type="button" onClick={() => onDetails(report)} className="rounded-lg border border-[#dce7e1] px-2 py-1.5 text-xs font-semibold text-[#346557] hover:bg-[#e7f0ec]">Details</button></td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
