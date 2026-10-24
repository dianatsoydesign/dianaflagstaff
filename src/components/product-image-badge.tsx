import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductImageBadge({ src, compact = false }: { src?: string; compact?: boolean }) {
  const isNew = products.some((product) => product.isNew &&
    (product.imageSrc === src || product.galleryImages?.some((image) => image.src === src)));
  if (!isNew) return null;
  return (
    <Badge className={cn("pointer-events-none absolute z-10 h-auto", compact ? "top-1 left-1 px-1 py-0.5 text-[10px] leading-none" : "top-3 left-3 px-3 py-1")}>
      New
    </Badge>
  );
}
