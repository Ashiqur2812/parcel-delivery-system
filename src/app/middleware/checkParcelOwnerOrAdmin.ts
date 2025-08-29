/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';

export const checkParcelOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parcelId = req.params.id;

        if (!req.user) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information not found');
        }

        // allow admin to access any parcel
        // if (req.user.role === Role.ADMIN) {
        //     return next();
        // }

    } catch (error) {
        next(error);
    }
};