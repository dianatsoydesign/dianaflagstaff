import test from 'node:test';
import assert from 'node:assert/strict';
import { cartProductPhoto } from '../src/lib/cart-product-photo.ts';
const product = { imageSrc: '/main.jpg', imageAlt: 'Product', galleryImages: [
  { src: '/pine.mp4', type: 'video', shownColor: 'Pine', alt: 'Video' },
  { src: '/pine.jpg', shownColor: 'Pine', alt: 'Pine product' },
  { src: '/short.jpg', shownStyle: 'Short tip', alt: 'Short hat' },
] };
test('matches selected color regardless of case, skipping video', () => {
  assert.equal(cartProductPhoto(product, ' pine '), '/pine.jpg');
});
test('matches style when no matching color photo exists', () => {
  assert.equal(cartProductPhoto(product, 'Red', 'Short tip'), '/short.jpg');
});
test('prefers combined match and avoids conflicting styles', () => {
  const p = { ...product, galleryImages: [
    { src: '/long-red.jpg', shownColor: 'Red', shownStyle: 'Long tip' },
    { src: '/short-red.jpg', shownColor: 'Red', shownStyle: 'Short tip' },
  ] };
  assert.equal(cartProductPhoto(p, 'Red', 'Short tip'), '/short-red.jpg');
});
test('falls back to main photo for colors without product photos', () => {
  assert.equal(cartProductPhoto(product, 'Blue'), '/main.jpg');
});
