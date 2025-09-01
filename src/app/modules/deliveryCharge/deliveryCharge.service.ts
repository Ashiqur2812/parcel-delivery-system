import { DeliveryCharge } from "./deliveryCharge.model";

const getDeliveryCharge = async (district: string, type: string) => {
    return DeliveryCharge.findOne({ district, type });
};

const calculateFee = async (
    district: string,
    type: string,
    weight: number
): Promise<number> => {
    const deliveryCharge = await getDeliveryCharge(district, type);

    const baseFee = deliveryCharge?.baseFee ?? 50;
    const perKgRate = deliveryCharge?.perKgRate ?? 20;

    return baseFee + perKgRate * weight;
};

export const DeliveryChargeService = {
    getDeliveryCharge,
    calculateFee
};