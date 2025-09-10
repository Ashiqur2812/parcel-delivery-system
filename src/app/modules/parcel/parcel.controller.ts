/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { ParcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";


const createParcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // find userId
        const { userId } = req.user as JwtPayload;
        // console.log(userId);

        // create payload
        const parcelData = req.body;

        // create parcel in database
        const parcel = await ParcelService.createParcel(parcelData, userId);

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
        const { userId } = req.user as JwtPayload;

        const query = req.query;
        const result = await ParcelService.getParcelsBySender(userId, query as Record<string, string>);

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
        const { userId } = req.user as JwtPayload;

        const query = req.query;
        const result = await ParcelService.getParcelsByReceiver(userId, query as Record<string, string>);

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
        const { userId } = req.user as JwtPayload;

        const parcel = await ParcelService.updateParcelStatus(
            id,
            status,
            userId,
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

const cancelParcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { userId } = req.user as JwtPayload;

        const parcel = await ParcelService.cancelParcel(id, userId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcel cancelled successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const confirmDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { userId } = req.user as JwtPayload;

        const parcel = await ParcelService.confirmDelivery(id, userId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Delivery confirmed successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const deleteParcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const parcel = await ParcelService.deleteParcel(id);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcel deleted successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const blockUnblockParcel = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;
        const { block, reason } = req.body;

        const parcel = await ParcelService.blockUnblockParcel(id, block, reason);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: `parcel ${block ? 'blocked' : 'unblocked'} successfully`,
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { isPaid, paymentMethod } = req.body;

        const parcel = await ParcelService.updatePaymentStatus(id, isPaid, paymentMethod);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: `Payment status updated to ${isPaid ? 'paid' : 'pending'}`,
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const getParcelStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parcel = await ParcelService.getParcelStatistics();

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcel statistics retrieved successfully',
            data: parcel
        });

    } catch (error) {
        next(error);
    }
};

const searchParcels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parcel = await ParcelService.searchParcels(req.query as any);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Parcels search completed successfully',
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
    updateParcelStatus,
    cancelParcel,
    confirmDelivery,
    deleteParcel,
    blockUnblockParcel,
    updatePaymentStatus,
    getParcelStatistics,
    searchParcels
};