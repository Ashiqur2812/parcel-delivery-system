import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { Role } from "../modules/user/user.interface";

export const checkUserOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information not found');
        }

        // allow admin to access user
        if (req.body.role === Role.ADMIN) {
            return next();
        }

        const userId = req.body.userId || req.body.id || req.body._id;

        if (!userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information is not found');
        }

        // allow user to access their own data
        if (userId.toString() === id.toString()) {
            return next();
        }

        throw new AppError(
            httpStatus.FORBIDDEN, 'Access denied: You can only access your own resources'
        );

    } catch (error) {
        next(error);
    }
};