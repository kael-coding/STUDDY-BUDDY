import express from 'express';
import { protectRoutes } from '../middleware/protectRoutes.js'
import { updateProfilePic, updatePassword, updateProfile, userDetails } from '../controllers/user.controller.js';

const router = express();


router.get("/details", protectRoutes, userDetails);;
router.put("/update-profile-picture", protectRoutes, updateProfilePic);
router.put("/update-password", protectRoutes, updatePassword);
router.put("/update-profile", protectRoutes, updateProfile);

export default router;