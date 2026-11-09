import review from '../data/yarn-gallery-image-review.json' with { type: 'json' };
/** @param {string} src */
export function yarnImageReviewKeys(src) {
  const clean = src.split('?')[0];
  const keys = [clean];
  const leaf = clean.split('/').at(-1).replace(/\.[a-z0-9]+$/i, '');
  if (clean.includes('imgs.michaels.com') || /^\/yarn-images\/(charisma|bernat-blanket-big)\//.test(clean)) keys.push('michaels-asset:' + leaf);
  return keys;
}
/** @param {string} src */
export function supplierYarnImageDecision(src) {
  const images = /** @type {Record<string, string>} */ (review.images);
  return yarnImageReviewKeys(src).map(key => images[key]).find(Boolean) ?? 'unreviewed';
}
/** Runtime safety net, scoped exclusively to supplier color photos. @param {string[]} images */
export function filterReviewedYarnGalleryImages(images) {
  return images.filter(src => supplierYarnImageDecision(src) === 'yarn');
}
/** Importers must review unknown source images before downloading or publishing them. @param {string[]} images */
export function reviewedSupplierYarnImages(images) {
  const unknown = images.filter(src => supplierYarnImageDecision(src) === 'unreviewed');
  if (unknown.length) throw new Error(`Review ${unknown.length} new supplier images under the yarn-only gallery policy before importing.`);
  return [...new Set(images)].filter(src => supplierYarnImageDecision(src) === 'yarn');
}

/** Prevent a cached rejected file from being reused after supplier image reordering. @param {string} destination */
export function assertYarnImageDestination(destination) {
  if (supplierYarnImageDecision(destination) === 'finished_product') {
    throw new Error('Supplier image order changed into a rejected cached photo. Review a new versioned image path before importing.');
  }
}
