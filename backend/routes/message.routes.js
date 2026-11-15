import express from 'express'
import multer from 'multer';

import { protectRoutes } from '../middleware/protectRoutes.js'
import { deleteMessage, editMessage, getMessages, getUsersForSidebar, searchChatContacts, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/messages/users", protectRoutes, getUsersForSidebar);
router.get("/contacts", protectRoutes, searchChatContacts);
router.get("/messages/:id", protectRoutes, getMessages);
router.patch("/messages/:id", protectRoutes, editMessage);
router.delete("/messages/:id", protectRoutes, deleteMessage);

router.post("/send/:id", protectRoutes, upload.array('images'), sendMessage);

export default router;
