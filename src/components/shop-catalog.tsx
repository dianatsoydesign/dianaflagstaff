"use client";

import { getProductListPrice, listedProducts } from "@/data/products";
import { patternRequests } from "@/data/pattern-requests";
import { PatternRequestPanel } from "@/components/pattern-request-panel";
import { ProductCard } from "@/components/product-card";

/** Set to true when pattern-request makes are ready to show on the shop page. */
const showRequestAMake = false;

const shopProducts = listedProducts
  .filter((product) => product.id !== "placemats")
  .sort((a, b) => getProductListPrice(a) - getProductListPrice(b));
const placemats = listedProducts.find((product) => product.id === "placemats");
const hotpadsIndex = shopProducts.findIndex((product) => product.id === "hotpads");
if (placemats) {
  shopProducts.splice(hotpadsIndex === -1 ? shopProducts.length : hotpadsIndex + 1, 0, placemats);
}

export function ShopCatalog() {
  return (
    <div className="flex flex-col gap-20">
      <section aria-label="Crochet shop">
        <h1 className="sr-only">Crochet shop</h1>
        <ul className="grid grid-cols-1 gap-y-[30px] md:grid-cols-3 md:gap-x-[1.5vw] md:gap-y-[4vw]">
          {shopProducts.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} index={i} animate />
            </li>
          ))}
        </ul>
      </section>

      {showRequestAMake && (
        <section
          id="request-a-make"
          aria-labelledby="request-makes"
          className="scroll-mt-24"
        >
          <h2
            id="request-makes"
            className="font-display mb-10 text-[clamp(1.75rem,2.3vw,2.3rem)] tracking-[-0.04em] text-ink"
          >
            Request a make
          </h2>

          <div className="flex flex-col gap-14">
            {patternRequests.map((item) => (
              <PatternRequestPanel key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
