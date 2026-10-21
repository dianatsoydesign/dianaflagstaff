import type { CSSProperties } from "react";

/** Fractions of full image size (0–1) to hide uniform studio matte. */
export type GalleryMatteInset = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/** Zoom the visible region to fill the frame; `object-contain` on the content box only. */
export function galleryMatteInsetStyle(
  inset: GalleryMatteInset
): CSSProperties {
  const top = inset.top ?? 0;
  const right = inset.right ?? 0;
  const bottom = inset.bottom ?? 0;
  const left = inset.left ?? 0;
  const wFrac = 1 - left - right;
  const hFrac = 1 - top - bottom;
  if (wFrac <= 0 || hFrac <= 0) return {};

  return {
    width: `${100 / wFrac}%`,
    height: `${100 / hFrac}%`,
    maxWidth: "none",
    maxHeight: "none",
    left: `${(-left / wFrac) * 100}%`,
    top: `${(-top / hFrac) * 100}%`,
    right: "auto",
    bottom: "auto",
  };
}
