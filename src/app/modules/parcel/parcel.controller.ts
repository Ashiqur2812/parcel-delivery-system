/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { ParcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";

const getUserId = (req: Request): string => {
    // const userId = req.user?.userId
    const userId = req.body?.userId;

    if (!userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not logged in');
    }

    return String(userId);
};

const createParcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // find userId
        const senderId = getUserId(req);

        // create payload
        const parcelData = { ...req.body, sender: senderId };

        // create parcel in database
        const parcel = await ParcelService.createParcel(parcelData, senderId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'Parcel created successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};


export const ParcelController = {

};