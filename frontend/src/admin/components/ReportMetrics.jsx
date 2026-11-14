import { CheckCircle2, Clock3, Flag, XCircle } from "lucide-react";
import { AdminMetrics } from "./AdminPanels.jsx";
import { reportMetrics } from "./reportStatus.js";

export default function ReportMetrics({ summary }) {
    const { total, open, removed, dismissed } = reportMetrics(summary);
    return <AdminMetrics items={[
        { label: "Total reports", value: total, Icon: Flag },
        { label: "Open reports", value: open, Icon: Clock3 },
        { label: "Post removed", value: removed, Icon: CheckCircle2 },
        { label: "Dismissed", value: dismissed, Icon: XCircle },
    ]} />;
}
