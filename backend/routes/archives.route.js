import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { archieveNote, archiveTask, getArchive } from '../controllers/archives.controller.js';

const router = express();

router.put("/note/archive/:id", protectRoutes, archieveNote);

router.put("/task/archive/:id", protectRoutes, archiveTask);

router.get("/all", protectRoutes, getArchive);



export default router;
