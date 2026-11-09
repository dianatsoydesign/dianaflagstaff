import charisma from './charisma.json' with { type: 'json' };
import additional from './hat-yarns.json' with { type: 'json' };

// Shared store inventory, with yarn lines retained separately in their catalogs.
export const MICHAELS_HAT_CATALOG = [...charisma.yarns, ...additional.yarns.filter(yarn => !additional.lines.find(line => line.id === yarn.lineId)?.hidden)];

// Shared refresh catalog. Ribbed yarns never appear in the chunky-hat picker.
import ribbed from './ribbed-yarns.json' with { type: 'json' };
export const MICHAELS_FLAGSTAFF_CATALOG = [...MICHAELS_HAT_CATALOG, ...ribbed.yarns];
