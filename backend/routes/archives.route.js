import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { archieveNote, archiveTask, getArchive, unArchieveNote } from '../controllers/archives.controller.js';

const router = express();

router.put("/note/archive/:id", protectRoutes, archieveNote);
router.put("/note/unarchive/:id", protectRoutes, unArchieveNote);

router.put("/task/archive/:id", protectRoutes, archiveTask);

router.get("/all", protectRoutes, getArchive);



export default router;
