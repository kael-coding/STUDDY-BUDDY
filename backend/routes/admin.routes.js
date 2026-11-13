
import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";
import { getAllUsersWithStats, deleteUser, getDashboardSummary, getAdminReportSummary } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin/overview", protectRoutes, isSuperAdmin, getDashboardSummary);
router.get("/admin/reports", protectRoutes, isSuperAdmin, getAdminReportSummary);
router.get("/admin/users", protectRoutes, isSuperAdmin, getAllUsersWithStats);
router.delete("/admin/users/:id", protectRoutes, isSuperAdmin, deleteUser);

export default router;
