<h2>Bug: Category Pages Show "Coming Soon" Instead of Subcategory Scroll When Products Are Out of Stock</h2>

<p><strong>Type:</strong> Bug<br>
<strong>Priority:</strong> High<br>
<strong>Assignee:</strong> Derek<br>
<strong>Labels:</strong> collections, navigation, subcategory-scroll, out-of-stock, shopify-admin</p>

<hr>

<h3>Summary</h3>
<p>Parent category collection pages (e.g. <strong>Furniture</strong>, <strong>Electronics</strong>) render a "Coming Soon" page instead of the subcategory browse experience when Shopify's store-level <strong>"Hide out-of-stock products"</strong> setting is active and all products associated with the collection are out of stock. The <code>SubcategoryScrollSection</code> — which shows child <em>collection</em> tiles, not product listings — is never reached, even though it has no dependency on product availability.</p>

<hr>

<h3>Root Cause</h3>

<h4>Shopify's out-of-stock filter</h4>
<p>Shopify Admin has a store-level setting (<strong>Online Store → Preferences → "Hide out-of-stock products from search and collection pages"</strong>) that instructs the Storefront API to automatically exclude unavailable products from all collection product queries — regardless of what filters are passed in the request. When this setting is enabled and all products in a collection are out of stock, the API returns <code>products.nodes = []</code> and <code>pageInfo.hasNextPage = false</code>.</p>

<h4>The isEmpty guard fires too early</h4>
<p>In <code>hydrogen/app/routes/collections.$handle.tsx</code>, the loader contains a guard that short-circuits any collection returning zero products to a "Coming Soon" page:</p>

<pre><code>const isEmpty =
  !hasActiveFilters &amp;&amp;
  collection.products.nodes.length === 0 &amp;&amp;
  !collection.products.pageInfo.hasNextPage;

if (isEmpty) {
  return { collection: null, comingSoon: true, ... };
}</code></pre>

<p>This check fires before the loader inspects <code>child_nodes</code>. A parent category collection — whose products are hidden by the out-of-stock filter — evaluates <code>isEmpty = true</code> and returns <code>comingSoon: true</code>. The component never reaches the <code>SubcategoryScrollSection</code>, despite the fact that:</p>
<ul>
  <li>The subcategory <em>tiles</em> are collection references, not products — they are unaffected by stock status</li>
  <li>The <code>child_nodes</code> metafield data is fetched and available in the same query response</li>
  <li>The out-of-stock products are reachable by navigating into any of the child subcategory pages</li>
</ul>

<hr>

<h3>Steps to Reproduce</h3>
<ol>
  <li>In <strong>Shopify Admin → Online Store → Preferences</strong>, confirm that <em>"Hide out-of-stock products from search and collection pages"</em> is <strong>enabled</strong></li>
  <li>Identify a parent category collection (e.g. <em>Furniture</em>) that has <code>custom.child_nodes</code> set with 2–3 child collections</li>
  <li>Ensure all products in that parent collection are <strong>out of stock</strong> (all variants have zero inventory and "Continue selling when out of stock" is unchecked)</li>
  <li>Navigate to <code>/collections/furniture</code> on the storefront</li>
  <li><strong>Expected:</strong> Page renders the category layout — <code>CollectionHero</code> + <code>SubcategoryScrollSection</code> showing child collection tiles the customer can browse into</li>
  <li><strong>Actual:</strong> Page renders the branded "Coming Soon" screen — child collection tiles are never shown despite the collection existing and having a valid subcategory structure</li>
</ol>

<hr>

<h3>Impact</h3>
<ul>
  <li>Any parent category with out-of-stock inventory becomes completely unnavigable — customers hit "Coming Soon" and have no path into the subcategory hierarchy</li>
  <li>The out-of-stock products are still accessible if the customer knows the direct URL to a subcategory, but there is no UI path to get there from the parent category page</li>
  <li>The <code>SubcategoryScrollSection</code> is effectively unreachable under normal out-of-stock conditions, which is the standard state for newly onboarded or seasonal categories</li>
  <li>The issue is completely silent — no error is thrown, no log is produced, and the "Coming Soon" UI looks intentional</li>
</ul>

<hr>

<h3>Mitigation (Code Fix)</h3>
<p>In <code>hydrogen/app/routes/collections.$handle.tsx</code>, update the <code>isEmpty</code> check to skip collections that have child nodes. A collection with <code>child_nodes</code> set is a category browse page by definition — it must never be treated as empty regardless of product stock status or what the Shopify out-of-stock filter returns.</p>

<p><strong>Before:</strong></p>
<pre><code>const hasActiveFilters = filters.length &gt; 0;
const isEmpty =
  !hasActiveFilters &amp;&amp;
  collection.products.nodes.length === 0 &amp;&amp;
  !collection.products.pageInfo.hasNextPage;</code></pre>

<p><strong>After:</strong></p>
<pre><code>const hasActiveFilters = filters.length &gt; 0;
const hasChildCollections =
  (collection.childCollections?.references?.nodes?.length ?? 0) &gt; 0;
const isEmpty =
  !hasChildCollections &amp;&amp;
  !hasActiveFilters &amp;&amp;
  collection.products.nodes.length === 0 &amp;&amp;
  !collection.products.pageInfo.hasNextPage;</code></pre>

<p>No GraphQL query changes are required. <code>childCollections</code> is already fetched in the same <code>COLLECTION_QUERY</code> request via the <code>custom.child_nodes</code> metafield, so there is no additional API cost. The <code>child_nodes</code> references are collection pointers — they are <strong>never filtered by product availability</strong> — so this check is reliable regardless of stock status.</p>

<p><strong>Status: Fix has been applied.</strong></p>

<hr>

<h3>Acceptance Criteria</h3>
<ul>
  <li>A parent category collection with <code>custom.child_nodes</code> set renders the full category layout (<code>CollectionHero</code> + <code>SubcategoryScrollSection</code>) even when all associated products are out of stock</li>
  <li>The subcategory tiles in <code>SubcategoryScrollSection</code> are visible and clickable regardless of the stock status of the products within those subcategories</li>
  <li>Navigating into a child subcategory from the tiles works correctly — the child page loads and shows its products (out-of-stock state display is handled per-product on those pages)</li>
  <li>An end-node collection (no <code>child_nodes</code>) with zero in-stock products <strong>still</strong> correctly renders "Coming Soon" — existing behaviour is not regressed</li>
  <li>A collection with both <code>child_nodes</code> and in-stock products renders the non-end-node layout as before</li>
  <li><code>pnpm typecheck</code> and <code>pnpm build</code> pass with no new errors</li>
</ul>
