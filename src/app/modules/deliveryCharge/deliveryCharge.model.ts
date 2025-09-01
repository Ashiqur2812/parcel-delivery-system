import { model, Schema } from "mongoose";
import { IDeliveryCharge } from "./deliveryCharge.interface";

const deliveryChargeSchema = new Schema<IDeliveryCharge>({
    district: { type: String, required: true },
    type: { type: String, required: true },
    baseFee: { type: Number, required: true },
    perKgRate: { type: Number, required: true },
    estimatedDeliveryDays: { type: Number, required: true }
}, {
    timestamps: true,
    versionKey: false
});

export const DeliveryCharge = model<IDeliveryCharge>('DeliveryCharge', deliveryChargeSchema);
