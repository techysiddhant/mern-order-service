import mongoose from "mongoose";
import { CartItem } from "../types";
export enum PaymentMode {
  CARD = "card",
  CASH = "cash",
}
export enum OrderStatus {
  RECEIVED = "received",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY_FOR_DELIVERY = "ready_for_delivery",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}
export interface Order {
  cart: CartItem[];
  couponCode: string;
  tenantId: string;
  customerId: mongoose.Types.ObjectId;
  total: number;
  discount: number;
  taxes: number;
  deliveryCharges: number;
  address: string;
  comment?: string;
  paymentMode: PaymentMode;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
}
