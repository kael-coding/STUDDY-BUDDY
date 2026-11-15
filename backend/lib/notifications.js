import Notification from "../models/notification.model.js";
import { emitToUser } from "./socket.js";

export function refreshUserNotifications(userId) {
    emitToUser(userId, "notifications:changed");
}

export async function publishNotification(notification) {
    const saved = await Notification.create(notification);
    refreshUserNotifications(notification.userId);
    return saved;
}
