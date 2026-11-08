export const PRODUCT_QUANTITY_LIMIT = 20;

/** @param {{id?:string,productId:string}} item @param {{id?:string,productId:string,quantity:number}[]} items */
export function remainingProductQuantity(item, items) {
  const otherQuantity = items.reduce((sum, other) =>
    other.productId === item.productId && (!item.id || other.id !== item.id)
      ? sum + other.quantity : sum, 0);
  return Math.max(0, PRODUCT_QUANTITY_LIMIT - otherQuantity);
}
