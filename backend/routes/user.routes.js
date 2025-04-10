import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js';
import { updateProfile } from '../controllers/user.controller.js';

const router = express.Router();


router.post("/update-profile", protectRoutes, updateProfile);

export default router;