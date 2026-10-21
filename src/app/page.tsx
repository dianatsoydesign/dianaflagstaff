import { ShopCatalog } from "@/components/shop-catalog";

export default function HomePage() {
  return (
    <div className="site-gutter bg-background pb-[30px] pt-12">
      <div className="site-width">
        <ShopCatalog />
      </div>
    </div>
  );
}
