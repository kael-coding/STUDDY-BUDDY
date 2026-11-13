import express from "express";
import { protectRoutes } from "../middleware/protectRoutes.js";
import { requireStudent } from "../middleware/requireStudent.js";
import {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    pinNote,
    unpinNote
} from "../controllers/notes.controller.js";

const router = express.Router();
router.use(protectRoutes, requireStudent);

router.post("/create-note", createNote);
router.get("/get-notes", getNotes);
router.get("/get-note/:id", getNote);
router.put("/update-note/:id", updateNote);
router.delete("/delete-note/:id", deleteNote);
router.put("/pin-note/:id", pinNote);
router.put("/unpin-note/:id", unpinNote);

export default router;
