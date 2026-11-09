import catalog from "@/data/ribbed-yarns.json";
import hobbyLobby from "@/data/ribbed-hobby-lobby-yarns.json";
import type { YarnColor } from "@/data/products";
import { compareCharismaYarnCatalogOrder } from "@/data/charisma-color-groups";

// Supplier catalogs stay separate so Hobby Lobby never enters the Michaels stock job.
export const RIBBED_COLORS_APPROVED = true;
export const RIBBED_YARNS: YarnColor[] = [...catalog.yarns, ...hobbyLobby.yarns]
  .sort(compareCharismaYarnCatalogOrder) as YarnColor[];
