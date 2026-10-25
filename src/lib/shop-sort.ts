import { getProductListPrice, type Product } from "@/data/products";

/** Sort by newness and price, then apply the approved shop display placements. */
export function sortShopProducts(products: readonly Product[]): Product[] {
  const sorted = [true, false].flatMap((isNew) => {
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

  const mushroomIndex = sorted.findIndex((product) => product.id === "mushroom-hat");
  if (mushroomIndex !== -1 && sorted.some((product) => product.id === "elf-hat")) {
    const [mushroom] = sorted.splice(mushroomIndex, 1);
    const elfIndex = sorted.findIndex((product) => product.id === "elf-hat");
    sorted.splice(elfIndex, 0, mushroom);
  }
  const catCaveIndex = sorted.findIndex((product) => product.id === "cat-cave");
  if (catCaveIndex !== -1) {
    const [catCave] = sorted.splice(catCaveIndex, 1);
    sorted.push(catCave);
  }
  return sorted;
}
