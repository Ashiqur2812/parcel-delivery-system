/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { parcelSearchAbleFields, parcelSearchFields } from "./parcel.constant";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import { DeliveryChargeService } from "../deliveryCharge/deliveryCharge.service";
import { Parcel } from "./parcel.model";
import { QueryBuilder } from "../../utils/queryBuilder";

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
    [ParcelStatus.DELIVERED]: [],
    [ParcelStatus.CANCELLED]: [],
    [ParcelStatus.RETURNED]: [],
};



const calculateTotalAmount = (price: number, deliveryCharge: number): number => {
    return price + deliveryCharge;
};

const createParcel = async (payload: Partial<IParcel>, userId: string) => {

    const senderId = new Types.ObjectId(userId);

    const receiver = await User.findById(payload.receiver);
    if (!receiver) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Receiver not found');
    }

    const deliveryCharge = await DeliveryChargeService.calculateFee(
        payload.receiverAddress as string,
        payload.type as string,
        payload.weight as number
    );

    const totalAmount = calculateTotalAmount(payload.price ?? 0, deliveryCharge);

    const parcelData: Partial<IParcel> = {
        trackingId: generateTrackingId(),
        status: ParcelStatus.REQUESTED,
        sender: senderId,
        deliveryCharge,
        totalAmount,
        statusLogs: [
            {
                status: ParcelStatus.REQUESTED,
                updatedBy: senderId,
                timestamp: new Date(),
                notes: "Parcel created by sender",
            },
        ],
        ...payload
    };

    return Parcel.create(parcelData);

};

const getAllParcels = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Parcel.find().populate('sender receiver', 'name email phone'), query);

    const parcelData = queryBuilder
        .filter()
        .search(parcelSearchAbleFields)
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        parcelData.build(),
        parcelData.getMeta()
    ]);

    return { data, meta };

};

const getParcelsBySender = async (senderId: string, query: Record<string, string>) => {
    const baseQuery = { sender: new Types.ObjectId(senderId) };

    const queryBuilder = new QueryBuilder(Parcel.find(baseQuery).populate('receiver', 'name email phone'), query);

    const parcelData = queryBuilder
        .filter()
        .search(parcelSearchFields)
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        parcelData.build(),
        parcelData.getMeta()
    ]);

    return { data, meta };

};

const getParcelByReceiver = async (receiverId: string, query: Record<string, string>) => {
    const baseQuery = { receiver: new Types.ObjectId(receiverId) };

    const parcelQuery = new QueryBuilder(Parcel.find(baseQuery).populate('sender', 'name email phone'), query);

    const parcelData = parcelQuery
        .filter()
        .search(parcelSearchFields)
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        parcelData.build(),
        parcelData.getMeta()
    ]);

    return { data, meta };

};

const getParcelByTrackingId = async (trackingId: string): Promise<IParcel | null> => {
    return Parcel.findOne({ trackingId })
        .populate('sender', 'name email phone address')
        .populate('receiver', 'name email phone address')
        .populate('assignedDriver', 'name email phone');
};

const getParcelById = async (id: string): Promise<IParcel | null> => {
    return Parcel.findOne({ id })
        .populate('sender', 'name email phone address')
        .populate('receiver', 'name email phone address')
        .populate('assignedDriver', 'name email phone');
};

const updateParcelStatus = async (
    parcelId: string,
    status: ParcelStatus,
    updatedBy: Types.ObjectId,
    notes?: string,
    location?: string
): Promise<IParcel | null> => {
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    const currentStatus = parcel.status;
    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(status)) {
        throw new AppError(httpStatus.BAD_REQUEST,
            `Invalid status transition: ${currentStatus} -> ${status}`
        );
    }

    const statusUpdate = {
        status,
        updatedBy,
        timestamp: new Date(),
        notes,
        location
    };

    const updateData: any = {
        status,
        $push: { statusLogs: statusUpdate }
    };

    if (status === ParcelStatus.DELIVERED) {
        updateData.actualDeliveryDate = new Date();
    }

    return Parcel.findByIdAndUpdate(parcelId, updateData, { new: true, runValidators: true }).populate('sender receiver', 'name email phone');

};

const cancelParcel = async (parcelId: string, userId: string): Promise<IParcel | null> => {
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    // Check Ownership
    if (parcel.sender?.toString() !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You can only cancel your own parcels');
    }

    const cancellableStatuses = [ParcelStatus.REQUESTED, ParcelStatus.APPROVED];

    if (!cancellableStatuses.includes(parcel.status)) {
        throw new AppError(httpStatus.BAD_REQUEST, `You cannot cancel parcel ${parcel.status} status`);
    }

    const id = new Types.ObjectId(userId);

    return updateParcelStatus(
        parcelId,
        ParcelStatus.CANCELLED,
        id,
        'Parcel cancelled by sender'
    );

};

const confirmDelivery = async (parcelId: string, receiverId: string): Promise<IParcel | null> => {
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    // verify receiver
    const isReceiver = parcel.receiver?.toString() === receiverId;
    if (!isReceiver) {
        throw new AppError(httpStatus.FORBIDDEN, 'Only can receiver can confirm the delivery');
    }

    if (parcel.status !== ParcelStatus.OUT_FOR_DELIVERY) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Parcel is not out fpr delivery');
    }

    const id = new Types.ObjectId(receiverId);

    return updateParcelStatus(
        parcelId,
        ParcelStatus.DELIVERED,
        id,
        'Delivery confirmed by receiver'
    );

};


export const ParcelService = {
    createParcel,
    getAllParcels,
    getParcelsBySender,
    getParcelByReceiver,
    getParcelByTrackingId,
    getParcelById,
    updateParcelStatus,
    cancelParcel,
    confirmDelivery
};
