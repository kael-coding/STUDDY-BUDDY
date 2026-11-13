import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { requireStudent } from "../middleware/requireStudent.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/sched_task.controller.js";



const router = express.Router();
router.use(protectRoutes, requireStudent);

router.post("/create-task", createTask);
router.get("/get-tasks", getTasks);
router.put("/update-task/:id", updateTask);
router.delete("/delete-task/:id", deleteTask);


export default router;