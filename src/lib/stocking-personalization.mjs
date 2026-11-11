export const STOCKING_NAME_LIMIT = 10;
export const STOCKING_PLACEMENTS = [
  { id: "none", label: "None" },
  { id: "top", label: "Top" },
  { id: "center-horizontal", label: "Center (horizontal)" },
  { id: "center-vertical", label: "Center (vertical)" },
];
export function stockingPlacementLabel(id) {
  return STOCKING_PLACEMENTS.find(option => option.id === id)?.label ?? "";
}
export function personalizationError(productId, text, placement) {
  if (!text && !placement) return null;
  if (productId !== "christmas-stockings") return "Personalization is only available for stockings.";
  if (!STOCKING_PLACEMENTS.some(option => option.id === placement && option.id !== "none")) return "Choose a personalization placement.";
  if (typeof text !== "string" || !text.trim()) return "Enter a name, initials, or nickname.";
  if (text.length > STOCKING_NAME_LIMIT) return `Use ${STOCKING_NAME_LIMIT} characters or fewer. Try initials or a nickname.`;
  return null;
}

export function isMulticolorStocking(yarn) {
  return !!yarn && !!(yarn.multicolor || (yarn.sortRank ?? 0) >= 2000 ||
    ["stockings-multi", "charisma-holiday-pizza", "charisma-soft-palette", "charisma-warm-palette"].includes(yarn.id));
}
export function stockingAddOnPrice(multicolor, personalized) {
  return (multicolor ? 5 : 0) + (personalized ? 5 : 0);
}
