# Production timing

Confirmed by Diana, October 21, 2026. These are making times in calendar days, separate from yarn sourcing. Prices must not change as part of production-estimate work.

- Coasters: 1 day per batch of up to 4 individual coasters; round up (1–4 = 1 day, 5–8 = 2 days, 9–12 = 3 days). Quantity counts individual pieces, not sets.
- Hotpads: 1 day for 2 hotpads.
- Placemats: 1 day per placemat.
- Hats: 1 day without a pom pom, 2 days with a pom pom, 3 days with a snap-on pom pom.
- Elf hat: 5 days.
- Mushroom hat: 5 days.
- Stockings: 3 days for single color, 5 days for multicolor.
- Cat cave: 3 days.

## Sourcing and acceptance

- Bobbiny: 6 business days for delivery after the yarn order is placed. Production starts after yarn arrives.
- Michaels: Diana can collect yarn within 24–48 hours, subject to local availability.
- Orders are accepted within 24 hours. Total estimates start at acceptance; do not add a separate queue allowance.
- Label all timings as estimates, not guarantees. Keep business days and calendar days explicit. Do not invent specific pickup dates or supplier holiday schedules.

## Implementation

- Show the shared pickup estimate on all eight listed products, after quantity/options and directly above Add to cart.
- Show one estimated ready date range and local Flagstaff pickup; keep the breakdown in a native expandable details section.
- Date range uses today through tomorrow for acceptance (within 24 hours), then 6 business days excluding weekends, then ceil(individual quantity / 4) calendar days. Use America/Phoenix for today. Assumes yarn is ordered at acceptance; supplier delays and holidays may change dates.
- Announce changed estimates politely without moving focus. Preserve existing pricing and quantity limits.
- Hotpads round up at 2 individual hotpads per calendar day. Placemats use 1 calendar day per item. Preserve existing quantity controls on other products.
- Any multicolor stocking appearance (including variegated single yarn and curated combinations) uses 5 calendar days; single-color stockings use 3. Without a selected stocking color, request a color before showing dates.
- Hats follow the selected pom pom: none 1 day, pom pom 2 days, snap-on 3 days.
- These production times apply to standard sizes only. Custom-size timing is confirmed on acceptance; do not invent dates for custom requests.
- Coasters/hotpads/placemats use Bobbiny sourcing. Other listed products use Michaels: earliest range adds 1 calendar day for yarn pickup, latest adds 2, in addition to the 0–24h acceptance window and production.
- Hidden wine bottle holders have no approved production time; do not guess one.
