/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { parcelSearchAbleFields, parcelSearchFields } from "./parcel.constant";
import { IParcel, ParcelFilter, ParcelStatus } from "./parcel.interface";
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

const getParcelsByReceiver = async (receiverId: string, query: Record<string, string>) => {
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

const deleteParcel = async (parcelId: string): Promise<IParcel | null> => {
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    const parcelNonDeletable = [
        ParcelStatus.DISPATCHED,
        ParcelStatus.IN_TRANSIT,
        ParcelStatus.OUT_FOR_DELIVERY,
        ParcelStatus.DELIVERED
    ];

    const isProtected = parcelNonDeletable.includes(parcel.status);
    if (isProtected) {
        throw new AppError(httpStatus.BAD_REQUEST, `Parcel in ${parcel.status} cannot be deleted`);
    }

    return Parcel.findByIdAndDelete(parcelId);
};

const blockUnblockParcel = async (parcelId: string, block: boolean, reason?: string): Promise<IParcel | null> => {
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    const status = block ? ParcelStatus.BLOCKED : ParcelStatus.APPROVED;

    const updateData = {
        isBlocked: block,
        status,
        $push: {
            statusLogs: {
                status,
                updatedBy: new Types.ObjectId(),
                timestamp: new Date(),
                note: reason || `Parcel ${block ? 'blocked' : 'unblocked'} by admin`
            }
        }
    };

    return Parcel.findByIdAndUpdate(parcelId, updateData, { new: true, runValidators: true }).populate('sender receiver', 'name email phone');
};

const updatePaymentStatus = async (parcelId: string, isPaid: boolean, paymentMethod?: string): Promise<IParcel | null> => {

    const statusNote = `Payment ${isPaid ? "completed" : "pending"}${paymentMethod ? ` via ${paymentMethod}` : ""
        }`;

    const updateData = {
        isPaid,
        paymentMethod,
        $push: {
            statusLogs: {
                status: ParcelStatus.APPROVED,
                updatedBy: new Types.ObjectId(),
                timestamp: new Date(),
                note: statusNote
            }
        }
    };

    return Parcel.findByIdAndUpdate(parcelId, updateData, { new: true, runValidators: true }).populate('sender receiver', 'name email phone');
};

const getParcelStatistics = async (): Promise<{
    total: number,
    delivered: number,
    inTransit: number,
    cancelled: number,
    revenue: number,
    pending: number;
}> => {
    const [total, delivered, inTransit, cancelled, pending, revenue] = await Promise.all([
        Parcel.countDocuments(),
        Parcel.countDocuments({ status: ParcelStatus.DELIVERED }),
        Parcel.countDocuments({
            status: {
                $in: [
                    ParcelStatus.IN_TRANSIT,
                    ParcelStatus.OUT_FOR_DELIVERY,
                    ParcelStatus.DISPATCHED
                ]
            }
        }),
        Parcel.countDocuments({ status: ParcelStatus.CANCELLED }),
        Parcel.countDocuments({ status: ParcelStatus.REQUESTED }),
        Parcel.aggregate([
            {
                $match: {
                    status: ParcelStatus.DELIVERED,
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ])
    ]);

    return {
        total,
        delivered,
        inTransit,
        cancelled,
        pending,
        revenue: revenue[0]?.total || 0
    };
};

const searchParcels = (filters: ParcelFilter): Promise<IParcel[]> => {
    const query: any = {};

    // Tracking Id (case insensitive search)
    if (filters.trackingId) {
        query.trackingId = { $regex: filters.trackingId, $options: 'i' };
    }

    // Basic filters
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    // sender and receiver
    if (filters.sender) query.sender = new Types.ObjectId(filters.sender);
    if (filters.receiver) query.receiver = new Types.ObjectId(filters.receiver);

    // Date filter
    // if (filters.dateFrom || filters.dateTo) {
    //     query.createdAt = {
    //         ...(filters.dateFrom && { $gte: new Date(filters.dateFrom) }),
    //         ...(filters.dateTo && { $lte: new Date(filters.dateTo) })
    //     };
    // }

    if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
    }

    if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
    }

    return Parcel.find(query)
        .populate('sender receiver', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(50);
};


export const ParcelService = {
    createParcel,
    getAllParcels,
    getParcelsBySender,
    getParcelsByReceiver,
    getParcelByTrackingId,
    getParcelById,
    updateParcelStatus,
    cancelParcel,
    confirmDelivery,
    deleteParcel,
    blockUnblockParcel,
    updatePaymentStatus,
    getParcelStatistics,
    searchParcels
};
