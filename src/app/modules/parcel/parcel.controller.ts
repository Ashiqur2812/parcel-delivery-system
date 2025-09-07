import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { ParcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import mongoose from "mongoose";

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

const getAllParcels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query;
        const result = await ParcelService.getAllParcels(query as Record<string, string>);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcels retrieved successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getParcelById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const parcel = await ParcelService.getParcelById(id);

        if (!parcel) {
            throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
        }

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcel retrieved successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const getParcelsBySender = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const senderId = getUserId(req);

        const query = req.query;
        const result = await ParcelService.getParcelsBySender(senderId, query as Record<string, string>);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Sender parcels retrieved successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getParcelsByReceiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const receiverId = getUserId(req);

        const query = req.query;
        const result = await ParcelService.getParcelsByReceiver(receiverId, query as Record<string, string>);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Receiver parcels retrieved successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getParcelByTrackingId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingId } = req.params;

        const parcel = await ParcelService.getParcelByTrackingId(trackingId);

        if (!parcel) {
            throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
        }

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcel retrieved successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const updateParcelStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, notes, location } = req.body;
        const updatedBy = new mongoose.Types.ObjectId(getUserId(req));

        const parcel = await ParcelService.updateParcelStatus(
            id,
            status,
            updatedBy,
            notes,
            location
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'Parcel status updated successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};


export const ParcelController = {
    createParcel,
    getAllParcels,
    getParcelById,
    getParcelsBySender,
    getParcelsByReceiver,
    getParcelByTrackingId,
    updateParcelStatus
};