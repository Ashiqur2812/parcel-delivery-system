import { DeliveryChargeService } from "./deliveryCharge.service";

const getFeeForParcel = async (district: string, type: string, weight: number) => {
    return DeliveryChargeService.calculateFee(district, type, weight);
};

export const DeliveryChargeController = {
    getFeeForParcel
};