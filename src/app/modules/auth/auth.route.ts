import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import config from '../../config/env';

const router = Router();

router.post('/login', authController.credentialLogin);
router.post('/refresh-token', authController.getNewAccessToken);
router.post('/logout', authController.logOut);
router.post('/reset-password', checkAuth(...Object.values(Role)), authController.resetPassword);

// google OAuth

router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || '';
    passport.authenticate('google', { scope: ['profile', 'email'], state: redirect as string })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${config.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with our support team!` }), authController.googleCallbackController);

export const AuthRoutes = router;
