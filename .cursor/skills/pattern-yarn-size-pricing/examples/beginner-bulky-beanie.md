# Example: Beginner Bulky Beanie

Pattern: [Beginner Bulky Beanie – MJ's Off the Hook](https://www.mjsoffthehookdesigns.com/beginner-bulky-beanie-free-crochet-pattern/#h-the-yarn-used-for-the-beginner-crochet-hat)

## Extracted yarn

| Size | Yards |
|------|------:|
| Baby | 50 |
| Toddler | 70 |
| Child | 80 |
| Teen | 90 |
| Adult | 100 |

Quote from pattern:

```text
Baby (Toddler, Child, Teen, Adult)
50 (70, 80, 90, 100) yds
```

## Inputs

- Anchor: **Adult**, **$25**
- Fixed (illustration): **$12** labor + tag

## Script input

```json
{
  "source": "https://www.mjsoffthehookdesigns.com/beginner-bulky-beanie-free-crochet-pattern/#h-the-yarn-used-for-the-beginner-crochet-hat",
  "unit": "yards",
  "fixedUsd": 12,
  "anchor": { "size": "Adult", "priceUsd": 25 },
  "yarnBySize": [
    { "size": "Baby", "amount": 50 },
    { "size": "Toddler", "amount": 70 },
    { "size": "Child", "amount": 80 },
    { "size": "Teen", "amount": 90 },
    { "size": "Adult", "amount": 100 }
  ]
}
```

## Expected prices

| Size | Yards | Price |
|------|------:|------:|
| Baby | 50 | $19 |
| Toddler | 70 | $21 |
| Child | 80 | $22 |
| Teen | 90 | $24 |
| Adult | 100 | $25 |

Run from project root:

```bash
node .cursor/skills/pattern-yarn-size-pricing/scripts/calc-size-prices.mjs --file .cursor/skills/pattern-yarn-size-pricing/examples/beginner-bulky-beanie.input.json
```
