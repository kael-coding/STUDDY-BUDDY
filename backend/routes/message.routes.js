import express from 'express'
import multer from 'multer';

import { protectRoutes } from '../middleware/protectRoutes.js'
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/messages/users", protectRoutes, getUsersForSidebar);
router.get("/messages/:id", protectRoutes, getMessages);

router.post("/send/:id", protectRoutes, upload.array('images'), sendMessage);

export default router;
