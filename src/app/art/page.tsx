import type { Metadata } from "next";
import { ArtGallery } from "@/components/art-gallery";

export const metadata: Metadata = {
  title: "Art + design",
  description: "Drawings and studies by Diana. A collection of art beyond crochet.",
};

export default function ArtPage() {
  return <ArtGallery />;
}
