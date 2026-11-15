import Notification from "../models/notification.model.js";
import PostReport from "../models/postReport.model.js";
import { refreshUserNotifications } from "./notifications.js";

export async function deliverReportOutcome(report) {
    const removed = report.status === "removed";
    const date = report.reviewedAt ?? new Date();

    // The report ID makes delivery safe to retry if the notification was already stored.
    await Notification.updateOne({ _id: report._id }, {
        $setOnInsert: {
            userId: report.reporterId,
            type: removed ? "reportRemoved" : "reportDismissed",
            text: removed ? "An admin removed a post you reported." : "An admin dismissed your report.",
            context: removed ? "The reported post was removed from its feed." : "The admin reviewed the report and took no action.",
            read: false,
            createdAt: date,
            updatedAt: date,
        },
    }, { upsert: true, timestamps: false, runValidators: true });

    refreshUserNotifications(report.reporterId);
    await PostReport.updateOne({ _id: report._id }, { $unset: { outcomeNotificationPending: "" } });
}

export async function retryReportOutcomes() {
    const pending = await PostReport.find({ outcomeNotificationPending: true, status: { $in: ["dismissed", "removed"] } })
        .sort({ reviewedAt: 1, _id: 1 }).limit(50).lean();
    for (const report of pending) {
        try {
            await deliverReportOutcome(report);
        } catch (error) {
            console.error("Could not deliver report notification:", error);
        }
    }
}
