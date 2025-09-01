import { Types } from "mongoose";
import { IUser } from "../user/user.interface";

export enum ParcelStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    DISPATCHED = 'DISPATCHED',
    IN_TRANSIT = 'IN_TRANSIT',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
    BLOCKED = 'BLOCKED'
}

export enum ParcelType {
    DOCUMENT = 'DOCUMENT',
    PACKAGE = 'PACKAGE',
    FRAGILE = 'FRAGILE',
    FOOD = 'FOOD',
    ELECTRONICS = 'ELECTRONICS'
}

export interface IParcelStatusLog {
    status: ParcelStatus,
    timestamp: Date,
    updatedBy: Types.ObjectId | IUser['_id'],
    location?: string,
    note?: string;
}

export interface IParcel {
    _id?: Types.ObjectId,
    trackingId: string,
    type: ParcelType,
    weight: number,
    price: number,
    deliveryCharge: number,
    totalAmount: number,
    sender: Types.ObjectId | IUser['_id'],
    receiver: Types.ObjectId | IUser['_id'],
    senderAddress: string,
    receiverAddress: string,
    deliveryDate?: Date,
    status: ParcelStatus,
    statusLogs: IParcelStatusLog[],
    isBlocked: boolean,
    isPaid?: boolean,
    paymentMethod?: string,
    assignedDriver?: Types.ObjectId | IUser['_id'],
    createdAt?: Date,
    updatedAt?: Date;
}

export interface ParcelFilter {
    status?: ParcelStatus,
    type?: ParcelType,
    sender?: string,
    receiver?: string,
    trackingId?: string,
    dateFrom?: string,
    dateTo?: string;
}