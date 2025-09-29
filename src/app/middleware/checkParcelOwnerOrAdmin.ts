import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { Role } from "../modules/user/user.interface";
import { Parcel } from "../modules/parcel/parcel.model";

export const checkParcelOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parcelId = req.params.id;

        if (!req.user) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information not found');
        }

        // allow admin to access any parcel
        const userAdmin = req.user as { role: Role; };

        if (userAdmin && userAdmin.role === Role.ADMIN) {
            return next();
        }

        const user = req.user as { userId?: string; id?: string; _id?: string; role?: string; };

        const userID = user.userId || user.id || user._id;

        if (!userID) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
        }

        // Find the parcel
        const parcel = await Parcel.findById(parcelId);
        if (!parcel) {
            throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
        }

        // Check if user is the sender or receiver of the parcel

        const userIsSender = parcel.sender?.toString() === userID.toString();

        const userIsReceiver = parcel.receiver?.toString() === userID.toString();

        if (userIsSender || userIsReceiver) {
            next();
        }

        throw new AppError(
            httpStatus.FORBIDDEN,
            "Access denied: You can only access your own parcels"
        );


    } catch (error) {
        next(error);
    }
};

export const checkParcelSenderOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parcelId = req.params.id;

        if (!req.user) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'User information not found');
        }

        // allow admin to access any parcel
        const userAdmin = req.user as { role: Role; };

        if (userAdmin && userAdmin.role === Role.ADMIN) {
            return next();
        }

        const user = req.user as { userId?: string; id?: string; _id?: string; role?: string; };

        const userID = user.userId || user.id || user._id;

        if (!userID) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
        }

        // Find the parcel
        const parcel = await Parcel.findById(parcelId);
        if (!parcel) {
            throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
        }

        // check if the user is the sender of the parcel

        const userIsSender = parcel.sender?.toString() === userID.toString();

        if (userIsSender) {
            return next();
        }

        throw new AppError(httpStatus.FORBIDDEN, 'Access denied: Only the sender can perform this action');

    } catch (error) {
        next(error);
    }
};
