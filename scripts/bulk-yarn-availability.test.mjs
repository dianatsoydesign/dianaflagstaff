import test from "node:test";
import assert from "node:assert/strict";
import { hasBulkYarnSource } from "../src/lib/bulk-yarn-availability.mjs";

test("bulk red applies only to stockings", () => {
  assert.equal(hasBulkYarnSource("christmas-stockings", "charisma-red"), true);
  assert.equal(hasBulkYarnSource("hats", "charisma-red"), false);
  assert.equal(hasBulkYarnSource("christmas-stockings", "charisma-cherry"), false);
});

test("bulk holiday colors are always available only for stockings", () => {
  for (const id of ["charisma-pine", "charisma-red", "charisma-white", "charisma-off-white"]) {
    assert.equal(hasBulkYarnSource("christmas-stockings", id), true);
    assert.equal(hasBulkYarnSource("hats", id), false);
  }
  assert.equal(hasBulkYarnSource("christmas-stockings", "charisma-tweed-cream"), false);
});
