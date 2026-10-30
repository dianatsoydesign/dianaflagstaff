import type { MetadataRoute } from 'next';

/** Block training collection, retaining search and ordinary social previews. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/maker/'] },
      { userAgent: ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended'], disallow: '/' },
    ],
  };
}
