import type {LoaderFunctionArgs} from 'react-router';

const SITEMAP_QUERY = `#graphql
  query Sitemap(
    $collectionsFirst: Int!
    $productsFirst: Int!
    $pagesFirst: Int!
  ) {
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
    pages(first: $pagesFirst) {
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;

const STATIC_PATHS = [
  {path: '/', priority: '1.0', changefreq: 'daily'},
  {path: '/collections', priority: '0.8', changefreq: 'weekly'},
  {path: '/faq', priority: '0.5', changefreq: 'monthly'},
  {path: '/about', priority: '0.5', changefreq: 'monthly'},
  {path: '/contact', priority: '0.5', changefreq: 'monthly'},
  {path: '/order-tracking', priority: '0.4', changefreq: 'monthly'},
];

/** Handles that should be excluded from the sitemap (noindex candidates) */
const EXCLUDED_PAGE_HANDLES = new Set(['return-policy']);

function urlEntry(
  loc: string,
  opts: {lastmod?: string; changefreq: string; priority: string},
) {
  const lastmodLine = opts.lastmod
    ? `\n    <lastmod>${opts.lastmod}</lastmod>`
    : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmodLine}\n    <changefreq>${opts.changefreq}</changefreq>\n    <priority>${opts.priority}</priority>\n  </url>`;
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const baseUrl = new URL(request.url).origin;

  const {collections, products, pages} = await storefront.query(SITEMAP_QUERY, {
    variables: {collectionsFirst: 250, productsFirst: 250, pagesFirst: 100},
  });

  const staticUrls = STATIC_PATHS.map(({path, priority, changefreq}) =>
    urlEntry(`${baseUrl}${path}`, {changefreq, priority}),
  );

  const collectionUrls = collections.nodes.map(
    (c: {handle: string; updatedAt: string}) =>
      urlEntry(`${baseUrl}/collections/${c.handle}`, {
        lastmod: c.updatedAt.split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      }),
  );

  const productUrls = products.nodes.map(
    (p: {handle: string; updatedAt: string}) =>
      urlEntry(`${baseUrl}/products/${p.handle}`, {
        lastmod: p.updatedAt.split('T')[0],
        changefreq: 'weekly',
        priority: '0.9',
      }),
  );

  // Exclude pages that are noindex candidates (e.g. return-policy is in policies route)
  const pageUrls = pages.nodes
    .filter((p: {handle: string}) => !EXCLUDED_PAGE_HANDLES.has(p.handle))
    .map((p: {handle: string; updatedAt: string}) =>
      urlEntry(`${baseUrl}/pages/${p.handle}`, {
        lastmod: p.updatedAt.split('T')[0],
        changefreq: 'monthly',
        priority: '0.6',
      }),
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...collectionUrls, ...productUrls, ...pageUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
