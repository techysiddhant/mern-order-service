import { Request, Response } from "express";
import {
  CartItem,
  ProductPricingCache,
  Topping,
  ToppingPricingCache,
} from "../types";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import couponModel from "../coupon/couponModel";

export class OrderController {
  create = async (req: Request, res: Response) => {
    // TODO: validate request
    const totalPrice = await this.calculateTotal(req.body.cart);
    let discountPercentage = 0;
    const couponCode = req.body.couponCode;
    const tenantId = req.body.tenantId;
    if (couponCode) {
      discountPercentage = await this.getDiscountPercentage(
        couponCode,
        tenantId,
      );
    }
    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);
    const priceAfterDiscount = totalPrice - discountAmount;
    const TAXES_PERCENTAGE = 18;
    const DELIVERY_CHARGES = 100;
    const taxes = Math.round((priceAfterDiscount * TAXES_PERCENTAGE) / 100);
    const finalTotal = priceAfterDiscount + taxes + DELIVERY_CHARGES;
    res.json({ totalPrice, discountAmount, taxes, finalTotal });
  };

  private calculateTotal = async (cart: CartItem[]) => {
    const productIds = cart.map((item) => item._id);
    // TODO:error handling
    const productPricings = await productCacheModel.find({
      productId: { $in: productIds },
    });
    const cartToppingIds = cart.reduce((acc, item) => {
      return [
        ...acc,
        ...item.chosenConfiguration.selectedToppings.map(
          (topping) => topping.id,
        ),
      ];
    }, []);
    const toppingPricings = await toppingCacheModel.find({
      toppingId: {
        $in: cartToppingIds,
      },
    });

    const totalPrice = cart.reduce((acc, curr) => {
      const cachedProductPrice = productPricings.find(
        (product) => product.productId === curr._id,
      );
      return (
        acc +
        curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPricings)
      );
    }, 0);
    return totalPrice;
  };
  private getItemTotal = (
    item: CartItem,
    cachedProductPrice: ProductPricingCache,
    toppingPricings: ToppingPricingCache[],
  ) => {
    const toppingsTotal = item.chosenConfiguration.selectedToppings.reduce(
      (acc, curr) => {
        return acc + this.getCurrentToppingPrice(curr, toppingPricings);
      },
      0,
    );
    const productTotal = Object.entries(
      item.chosenConfiguration.priceConfiguration,
    ).reduce((acc, [key, value]) => {
      const price =
        cachedProductPrice.priceConfiguration[key].availableOptions[value];
      return acc + price;
    }, 0);
    return productTotal + toppingsTotal;
  };

  private getCurrentToppingPrice = (
    topping: Topping,
    toppingPricings: ToppingPricingCache[],
  ) => {
    const currentTopping = toppingPricings.find(
      (curr) => topping.id === curr.toppingId,
    );
    if (!currentTopping) {
      // TODO: Make sure the item is in the cache else, maybe call catalog service
      return topping.price;
    }
    return currentTopping.price;
  };
  private getDiscountPercentage = async (
    couponCode: string,
    tenantId: string,
  ) => {
    const code = await couponModel.findOne({ code: couponCode, tenantId });
    if (!code) {
      return 0;
    }
    const currentDate = new Date();
    const couponDate = new Date(code.validUpto);
    if (currentDate <= couponDate) {
      return code.discount;
    }
    return 0;
  };
}
