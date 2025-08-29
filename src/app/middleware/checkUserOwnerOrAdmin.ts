import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { Role } from "../modules/user/user.interface";

export const checkUserOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        if (!req.user) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information not found');
        }

        // allow admin to access user
        if (req.user.role === Role.ADMIN) {
            return next();
        }

        const userId = req.user.userId || req.user.id || req.user._id

    } catch (error) {
        next(error);
    }
};