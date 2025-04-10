import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { checkAuth, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/check-auth", protectRoutes, checkAuth);
router.post("/update-profile", protectRoutes, updateProfile);

export default router;