import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { archieveNote, getArchive } from '../controllers/archives.controller.js';

const router = express();

router.put("/note/archive/:id", protectRoutes, archieveNote);
router.get("/archive", protectRoutes, getArchive);


export default router;
