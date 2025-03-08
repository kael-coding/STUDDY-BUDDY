import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { createTask, getSTasks } from "../controllers/sched_task.controller.js";



const router = express.Router();

router.post("/create-task", protectRoutes, createTask);
router.get("/get-tasks", protectRoutes, getSTasks);
//router.put("/update-task", protectRoutes, updateTask);
//router.delete("/delete-task/:id", protectRoutes, deleteTask);


export default router;