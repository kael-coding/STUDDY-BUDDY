import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { createTask, getSTasks, updateTask, deleteTask } from "../controllers/sched_task.controller.js";



const router = express.Router();

router.post("/create-task", protectRoutes, createTask);
router.get("/get-tasks", protectRoutes, getSTasks);
router.put("/update-task/:id", protectRoutes, updateTask);
router.delete("/delete-task/:id", protectRoutes, deleteTask);


export default router;