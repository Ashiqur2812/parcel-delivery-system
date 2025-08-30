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

interface decodedUserToken extends JwtPayload {
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