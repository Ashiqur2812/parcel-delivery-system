/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { verifyToken } from "../utils/jwt";
import config from '../config/env';
import { JwtPayload } from "jsonwebtoken";
// import { AuthPayload } from "../interfaces";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
        }

        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new AppError(httpStatus.FORBIDDEN, 'No authentication token provided');
        }

        const verifiedToken = verifyToken(
            token,
            config.JWT_ACCESS_SECRET
        ) as JwtPayload

        if (!verifiedToken) {
            throw new AppError(httpStatus.FORBIDDEN, 'Invalid token payload');
        }

        if (!authRoles.includes(verifiedToken?.role)) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not permitted to view this route');
        }

        req.user = verifiedToken;
        next();

    } catch (error) {
        console.error('Auth middleware error', error);
        next(error);
    }
};