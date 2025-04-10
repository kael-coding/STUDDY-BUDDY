import express from 'express'
import { protectRoutes } from '../middleware/protectRoutes.js'
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.get("/users", protectRoutes, getUsersForSidebar);
router.get("/:id", protectRoutes, getMessages);

router.post("/send", protectRoutes, sendMessage);


export default router