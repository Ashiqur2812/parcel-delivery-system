/* eslint-disable @typescript-eslint/no-unused-vars */
import { Types } from "mongoose";
import { FINAL_STATUSES } from "./parcel.constant";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes'

const generateTrackingId = () => {
    const random = Math.floor(Math.random() * 900000 + 100000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `TRK-${date}-${random}`;
};


const VALID_STATUS_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
    [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
    [ParcelStatus.APPROVED]: [ParcelStatus.DISPATCHED, ParcelStatus.CANCELLED],
    [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
    [ParcelStatus.IN_TRANSIT]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED],
    [ParcelStatus.OUT_FOR_DELIVERY]: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
    [ParcelStatus.BLOCKED]: [ParcelStatus.APPROVED],
    ...Object.fromEntries(FINAL_STATUSES.map(status => [status, []])),
};


const calculateTotalAmount = (price: number, deliveryCharge: number): number => {
    return price + deliveryCharge;
};

const createParcel = async(payload:Partial<IParcel>,userId:string) => {

    const senderId = new Types.ObjectId(userId)

    const receiver = await User.findById(payload.receiver)
    if(!receiver){
        throw new AppError(httpStatus.BAD_REQUEST,'Receiver not found')
    }


}
