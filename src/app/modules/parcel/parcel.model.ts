import { model, Schema } from "mongoose";
import { IParcel, IParcelStatusLog, ParcelStatus, ParcelType } from "./parcel.interface";
import { Types } from "mongoose";

const parcelStatusLogSchema = new Schema<IParcelStatusLog>({
    status: {
        type: String,
        enum: Object.values(ParcelStatus),
        required: true
    },
    timestamp: { type: Date, default: Date.now() },
    updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
    location: { type: String },
    notes: { type: String }
}, {
    _id: false, versionKey: false
});

const parcelSchema = new Schema<IParcel>({
    trackingId: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(ParcelType), required: true },
    weight: { type: Number, required: true, min: 0.1 },
    price: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    sender: { type: Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Types.ObjectId, ref: 'User', required: true },
    senderAddress: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    deliveryDate: { type: Date },
    status: {
        type: String,
        enum: Object.values(ParcelStatus),
        default: ParcelStatus.REQUESTED
    },
    statusLogs: { type: [parcelStatusLogSchema], default: [] },
    isBlocked: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String },
    assignedDriver: { type: Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    versionKey: false
});

parcelSchema.index({ sender: 1 });
parcelSchema.index({ receiver: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ createdAt: -1 });
parcelSchema.index({ isBlocked: 1 });

export const Parcel = model<IParcel>('Parcel', parcelSchema);