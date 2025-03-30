import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { createNote, getNotes, updateNote, deleteNote } from "../controllers/notes.controller.js";

const router = express.Router();

router.post("/create-note", protectRoutes, createNote);
router.get("/get-notes", protectRoutes, getNotes);
router.put("/update-note/:id", protectRoutes, updateNote);
router.delete("/delete-note/:id", protectRoutes, deleteNote);

export default router;