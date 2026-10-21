# Flagstaff AZ tax (cost floor)

## What to tax

Apply **combined retail sales tax** to:

- Yarn materials (pretax)
- Hang tag (`tag_usd_per_product`, default **$0.90**)

Do **not** tax labor (hourly floor × hours).

## Rate

Each run: confirm **Flagstaff, AZ** combined TPT/sales tax rate (state + county + city). Cite source (AZ Department of Revenue TPT rate pages or City of Flagstaff).

Fallback if lookup fails: `flagstaff_combined_sales_tax_rate` in `docs/pricing/defaults.yaml` (currently **9.181%** — verify).

```
taxable_supplies = materials_pretax + tag_usd
flagstaff_tax_usd = taxable_supplies × combined_rate
```

## Disclaimer (include in report)

- This models **your cost** buying at Michaels Flagstaff (and similar local retail for tags).
- Bobbiny shipped to Flagstaff may owe use tax; default same rate unless intake `notes` say otherwise.
- Venmo/local sales to customers may not charge tax; this is not tax advice.
