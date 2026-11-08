import test from "node:test";
import assert from "node:assert/strict";
import { hasBulkYarnSource } from "../src/lib/bulk-yarn-availability.mjs";

test("bulk red applies only to stockings", () => {
  assert.equal(hasBulkYarnSource("christmas-stockings", "charisma-red"), true);
  assert.equal(hasBulkYarnSource("hats", "charisma-red"), false);
  assert.equal(hasBulkYarnSource("christmas-stockings", "charisma-cherry"), false);
});
