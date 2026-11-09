// Diana confirmed a separate bulk source for red stocking yarn.
// This does not represent Michaels store inventory or apply to Chunky hat.
export function hasBulkYarnSource(productId, yarnId) {
  return productId === "christmas-stockings" && yarnId === "charisma-red";
}
