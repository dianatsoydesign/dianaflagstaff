"use client";

import { CustomRequestTile } from "@/components/custom-request-tile";
import { listedProducts } from "@/data/products";
import { sortShopProducts } from "@/lib/shop-sort";
import { patternRequests } from "@/data/pattern-requests";
import { PatternRequestPanel } from "@/components/pattern-request-panel";
import { ProductCard } from "@/components/product-card";

/** Set to true when pattern-request makes are ready to show on the shop page. */
const showRequestAMake = false;

const shopProducts = sortShopProducts(listedProducts);

export function ShopCatalog() {
  return (
    <div className="flex flex-col gap-20">
      <section aria-label="Crochet shop">
        <h1 className="sr-only">Crochet shop</h1>
        <ul className="grid grid-cols-1 gap-y-[30px] md:grid-cols-3 md:gap-x-[1.5vw]">
          {shopProducts.map((product, i) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                index={i}
                animate
                dimInDark
              />
            </li>
          ))}
          <li><CustomRequestTile /></li>
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
