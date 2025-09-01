export interface IDeliveryCharge {
    district: string,
    type: string,
    baseFee: number,
    perKgRate: number,
    estimatedDeliveryDays: number;
}
