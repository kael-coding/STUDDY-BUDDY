import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    pinNote,
    unpinNote
} from "../controllers/notes.controller.js";

const router = express.Router();

router.post("/create-note", protectRoutes, createNote);
router.get("/get-notes", protectRoutes, getNotes);
router.put("/update-note/:id", protectRoutes, updateNote);
router.delete("/delete-note/:id", protectRoutes, deleteNote);
router.put("/pin-note/:id", protectRoutes, pinNote);
router.put("/unpin-note/:id", protectRoutes, unpinNote);

export default router;
