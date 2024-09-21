import { ToppingMessage } from "../types";
import toppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
  try {
    const topping: ToppingMessage = JSON.parse(value);
    return await toppingCacheModel.updateOne(
      { toppingId: topping.id },
      { $set: { price: topping.price } },
      { upsert: true },
    );
  } catch (error) {
    return;
  }
};
