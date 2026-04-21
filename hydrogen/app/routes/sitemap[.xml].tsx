import type {LoaderFunctionArgs} from 'react-router';

const SITEMAP_QUERY = `#graphql
  query Sitemap($collectionsFirst: Int!, $productsFirst: Int!) {
    collections(first: $collectionsFirst) {
      nodes {
        handle
        updatedAt
      }
    }
    products(first: $productsFirst) {
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;

const STATIC_PATHS = [
  '/',
  '/collections',
  '/faq',
  '/about',
  '/contact',
  '/pages/return-policy',
  '/order-tracking',
];

export async function loader({request, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const baseUrl = new URL(request.url).origin;

  const {collections, products} = await storefront.query(SITEMAP_QUERY, {
    variables: {collectionsFirst: 250, productsFirst: 250},
  });

  const collectionUrls = collections.nodes.map(
    (c: {handle: string; updatedAt: string}) =>
      `  <url>\n    <loc>${baseUrl}/collections/${c.handle}</loc>\n    <lastmod>${c.updatedAt.split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  );

  const productUrls = products.nodes.map(
    (p: {handle: string; updatedAt: string}) =>
      `  <url>\n    <loc>${baseUrl}/products/${p.handle}</loc>\n    <lastmod>${p.updatedAt.split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
  );

  const staticUrls = STATIC_PATHS.map(
    (path) =>
      `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.6'}</priority>\n  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...collectionUrls, ...productUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
