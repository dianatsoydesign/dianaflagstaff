export const HAT_POM_POM_OPTIONS = [
  { id: "no-pom-pom", label: "No pom pom", priceAddUsd: 0 },
  { id: "with-pom-pom", label: "Pom pom", priceAddUsd: 5 },
  { id: "snap-on-pom-pom", label: "Snap-on pom pom", priceAddUsd: 10 },
] as const;

export type HatPomPomId = (typeof HAT_POM_POM_OPTIONS)[number]["id"];

export const DEFAULT_HAT_POM_POM_ID: HatPomPomId = "no-pom-pom";

export function getHatPomPom(id: HatPomPomId) {
  return HAT_POM_POM_OPTIONS.find((o) => o.id === id)!;
}

export function hatPomPomPriceAdd(id: HatPomPomId): number {
  return getHatPomPom(id).priceAddUsd;
}

export function isHatPomPomId(id: string): id is HatPomPomId {
  return HAT_POM_POM_OPTIONS.some((o) => o.id === id);
}
