import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { requireStudent } from "../middleware/requireStudent.js";
import { getFocusProgress, startFocusSession, cancelFocusSession } from "../controllers/focusSession.controller.js";
import { createTask, getTasks, updateTask, deleteTask, updateAssessmentTopic } from "../controllers/sched_task.controller.js";



const router = express.Router();
router.use(protectRoutes, requireStudent);

router.post("/create-task", createTask);
router.get("/get-tasks", getTasks);
router.get("/focus", getFocusProgress);
router.post("/focus", startFocusSession);
router.delete("/focus/:id", cancelFocusSession);
router.put("/update-task/:id", updateTask);
router.patch("/:id/topics/:topicId", updateAssessmentTopic);
router.delete("/delete-task/:id", deleteTask);


export default router;
