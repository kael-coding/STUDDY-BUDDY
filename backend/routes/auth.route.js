import express from 'express';
import { checkAuth, forgotpassword, login, logout, resetPassword, signup, verifyEmail, resendVerificationCode, resendPasswordResetLink, updateProfile } from '../controllers/auth.controller.js';
import { protectRoutes } from '../middleware/protectRoutes.js'

const router = express()

router.get("/check-auth", protectRoutes, checkAuth);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", protectRoutes, verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/resend-password-reset", protectRoutes, resendPasswordResetLink);

router.post("/forgot-password", forgotpassword);
router.post("/reset-password/:token", resetPassword);

router.post("/user/update-profile", protectRoutes, updateProfile);

export default router;