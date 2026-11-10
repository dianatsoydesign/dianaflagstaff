// Diana's bulk supply is independent of Michaels pickup counts and applies only to stockings.
export function hasBulkYarnSource(productId, yarnId) {
  return productId === "christmas-stockings" &&
    ["charisma-pine", "charisma-red", "charisma-white", "charisma-off-white"].includes(yarnId);
}
