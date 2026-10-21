---
name: dianas-art-pricing
description: >-
  Prices Diana's art crochet products using docs/pricing and the repo-local
  crochet-product-pricing skill. Use when pricing products in Diana's crochet
  website repo.
disable-model-invocation: true
---

# Diana's art pricing (repo pointer)

Use the repo skill [`.cursor/skills/crochet-product-pricing/SKILL.md`](../crochet-product-pricing/SKILL.md).

Read from this repo:

- [`docs/pricing/README.md`](../../../docs/pricing/README.md)
- [`docs/pricing/dianas-art-context.md`](../../../docs/pricing/dianas-art-context.md)
- [`docs/pricing/defaults.yaml`](../../../docs/pricing/defaults.yaml)
- [`docs/pricing/costs/`](../../../docs/pricing/costs/)
- [`src/data/products.ts`](../../../src/data/products.ts)

Write reports to `docs/pricing/reports/`. Do not commit `products.ts` price changes unless Diana asks.
