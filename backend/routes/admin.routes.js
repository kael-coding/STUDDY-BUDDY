
import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { getAllUsersWithStats, deleteUser, getDashboardSummary, getAdminReportSummary } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectRoutes, requireAdmin);
router.get("/overview", getDashboardSummary);
router.get("/reports", getAdminReportSummary);
router.get("/users", getAllUsersWithStats);
router.delete("/users/:id", deleteUser);

export default router;
