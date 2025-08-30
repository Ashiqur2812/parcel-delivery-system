/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { catchAsync } from "../../utils/createAsync";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { createUserToken } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import config from '../../config/env';

interface DecodedUserToken extends JwtPayload {
    userId: string,
    email: string,
    role: Role;
}

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
        if (err) {
            return next(new AppError(httpStatus.UNAUTHORIZED, err));
        }

        if (!user) {
            return next(new AppError(httpStatus.UNAUTHORIZED, info.message));
        }

        const userToken = await createUserToken(user);

        const { password: pass, ...rest } = user.toObject();
        setAuthCookie(res, userToken);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'User logged in successfully',
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        });
    })(req, res, next);
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, 'No refresh token received from cookies');
    }

    const tokenInfo = await authService.getNewAccessToken(refreshToken as string);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'New access token retrieved successfully',
        data: tokenInfo
    });
});

const logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const isProduction = config.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict'
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Log out successful',
        data: null
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    const decodedToken = req.user as unknown as DecodedUserToken;

    await authService.resetPassword(oldPassword, newPassword, decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password updated successfully',
        data: null
    });
});


export const authController = {
    credentialLogin,
    getNewAccessToken,
    logOut,
    resetPassword
};
