import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { requireStudent } from "../middleware/requireStudent.js";
import { getAchievements } from "../controllers/achievement.controller.js";
import { getFocusProgress, startFocusSession, cancelFocusSession, updateFocusTimer } from "../controllers/focusSession.controller.js";
import { createTask, getTasks, updateTask, deleteTask, updateAssessmentTopic } from "../controllers/sched_task.controller.js";



const router = express.Router();
router.use(protectRoutes, requireStudent);

router.post("/create-task", createTask);
router.get("/get-tasks", getTasks);
router.get("/achievements", getAchievements);
router.get("/focus", getFocusProgress);
router.post("/focus", startFocusSession);
router.patch("/focus/:id", updateFocusTimer);
router.delete("/focus/:id", cancelFocusSession);
router.put("/update-task/:id", updateTask);
router.patch("/:id/topics/:topicId", updateAssessmentTopic);
router.delete("/delete-task/:id", deleteTask);


export default router;
