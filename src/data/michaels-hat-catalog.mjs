import charisma from './charisma.json' with { type: 'json' };
import additional from './hat-yarns.json' with { type: 'json' };

// Shared store inventory, with yarn lines retained separately in their catalogs.
export const MICHAELS_HAT_CATALOG = [...charisma.yarns, ...additional.yarns];
