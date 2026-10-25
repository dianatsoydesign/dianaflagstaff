import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const SITE_URL = "https://dianaflagstaff.com";
export const SHOP_DESCRIPTION = "Handmade crochet hats, home goods, and gifts by Diana in Flagstaff, Arizona. Made with plant-based and synthetic yarns. Local pickup only.";
export const ABOUT_DESCRIPTION = "Meet Diana, the artist behind Diana's art. Discover handmade crochet, thoughtful materials, and a love of making in Flagstaff, Arizona.";

export function shareMetadata(title: string, description: string, path: string, image: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  const images = [{ url: new URL(image, SITE_URL).href, width: 1200, height: 630, alt: `${title} · ${SITE_NAME}` }];
  return {
    title, description, alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: `${title} · ${SITE_NAME}`, description, url, images },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description, images },
  };
}
