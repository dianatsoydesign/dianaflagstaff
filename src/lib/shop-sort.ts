import { getProductListPrice, type Product } from "@/data/products";

/** New products lead; price orders each group, with the existing tableware pairing. */
export function sortShopProducts(products: readonly Product[]): Product[] {
  return [true, false].flatMap((isNew) => {
    const group = products
      .filter((product) => Boolean(product.isNew) === isNew)
      .sort((a, b) => getProductListPrice(a) - getProductListPrice(b));
    const placematsIndex = group.findIndex((product) => product.id === "placemats");
    const hasHotpads = group.some((product) => product.id === "hotpads");
    if (placematsIndex !== -1 && hasHotpads) {
      const [placemats] = group.splice(placematsIndex, 1);
      const hotpadsIndex = group.findIndex((product) => product.id === "hotpads");
      group.splice(hotpadsIndex + 1, 0, placemats);
    }
    return group;
  });
}
