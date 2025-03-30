import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/sched_task.controller.js";



const router = express.Router();

router.post("/create-task", protectRoutes, createTask);
router.get("/get-tasks", protectRoutes, getTasks);
router.put("/update-task/:id", protectRoutes, updateTask);
router.delete("/delete-task/:id", protectRoutes, deleteTask);


export default router;