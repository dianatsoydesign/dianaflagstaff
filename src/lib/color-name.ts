const PROPER_WORDS = new Set(["Holiday", "Italian"]);

/** Yarn data keeps the supplier's spelling (stock sync matches on it); display it lowercase. */
export function colorName(name: string) {
  return name
    .split(" ")
    .map((word) => (PROPER_WORDS.has(word) ? word : word.toLowerCase()))
    .join(" ");
}
