import { ShopCatalog } from "@/components/shop-catalog";

import { shareMetadata, SHOP_DESCRIPTION } from "@/lib/social-sharing";

export const metadata = shareMetadata("Shop handmade crochet", SHOP_DESCRIPTION, "/", "/social/shop-v1.jpg");

export default function HomePage() {
  return (
    <div className="site-gutter bg-background pb-[30px] pt-12">
      <div className="site-width">
        <ShopCatalog />
      </div>
    </div>
  );
}
