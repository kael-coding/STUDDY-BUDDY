import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { requireStudent } from "../middleware/requireStudent.js";
import { getTrash, restoreTrashItem } from '../controllers/trash.controller.js';
import { archieveNote, archiveTask, getArchive, unArchieveNote } from '../controllers/archives.controller.js';

const router = express.Router();
router.use(protectRoutes, requireStudent);

router.put("/note/archive/:id", archieveNote);
router.put("/note/unarchive/:id", unArchieveNote);

router.put("/task/archive/:id", archiveTask);

router.get("/all", getArchive);
router.get("/trash", getTrash);
router.put("/trash/:type/:id/restore", restoreTrashItem);



export default router;
