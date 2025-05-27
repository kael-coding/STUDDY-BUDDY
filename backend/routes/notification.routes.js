import express from "express";
import { getNotifications, notificationDeleteById, markAsRead, markAsUnread } from "../controllers/notification.controller.js";
import { protectRoutes } from "../middleware/protectRoutes.js";


const router = express.Router();

router.get("/all", protectRoutes, getNotifications);
router.delete("/:id", protectRoutes, notificationDeleteById);
router.post("/markAsRead/:id", protectRoutes, markAsRead);
router.post("/markAsUnread/:id", protectRoutes, markAsUnread)
export default router;