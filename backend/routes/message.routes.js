import express from 'express'
import { protectRoutes } from '../middleware/protectRoutes.js'
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.get("/messages/users", protectRoutes, getUsersForSidebar);
router.get("/messages/:id", protectRoutes, getMessages);

router.post("/send/:id", protectRoutes, sendMessage);

export default router;
