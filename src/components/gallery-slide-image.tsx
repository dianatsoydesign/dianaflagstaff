import Image from "next/image";
import {
  galleryMatteInsetStyle,
  type GalleryMatteInset,
} from "@/lib/gallery-matte-inset";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  galleryMatteInset?: GalleryMatteInset;
};

/** Intrinsic size hint for matte-zoom layout (Next requires width/height when not using fill). */
const INSET_IMAGE_DIMENSION = 1200;

export function GallerySlideImage({
  src,
  alt,
  sizes,
  priority,
  className,
  galleryMatteInset,
}: Props) {
  const insetStyle = galleryMatteInset
    ? galleryMatteInsetStyle(galleryMatteInset)
    : undefined;
  const useInset = insetStyle && Object.keys(insetStyle).length > 0;

  if (!useInset) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        width={INSET_IMAGE_DIMENSION}
        height={INSET_IMAGE_DIMENSION}
        priority={priority}
        sizes={sizes}
        className={cn(
          "absolute max-h-none max-w-none object-contain",
          className
        )}
        style={insetStyle}
      />
    </div>
  );
}
