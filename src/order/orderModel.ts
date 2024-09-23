import mongoose, { Schema } from "mongoose";
import { Order, OrderStatus, PaymentMode, PaymentStatus } from "./orderTypes";
import { CartItem, Topping } from "../types";
const toppingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});
const cartSchema = new mongoose.Schema<CartItem>({
  name: String,
  image: String,
  qty: Number,
  priceConfiguration: {
    type: Map,
    of: {
      priceType: {
        type: String,
        enum: ["base", "additional"],
        required: true,
      },
      availableOptions: {
        type: Map,
        of: Number,
        required: true,
      },
    },
  },
  chosenConfiguration: {
    priceConfiguration: {
      type: Map,
      of: String,
      required: true,
    },
    selectedToppings: [
      {
        type: [toppingSchema],
        required: true,
      },
    ],
  },
});
const orderSchema = new mongoose.Schema<Order>(
  {
    cart: {
      type: [cartSchema],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      required: true,
    },
    deliveryCharges: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: false,
    },
    paymentMode: {
      type: String,
      enum: PaymentMode,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PaymentStatus,
      required: true,
    },
    paymentId: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
