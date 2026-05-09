<h2>Discounts Header Dropdown — Shopify Admin Setup</h2>

<p><strong>Type:</strong> Configuration / Admin Task<br>
<strong>Priority:</strong> High<br>
<strong>Assignee:</strong> Shawn<br>
<strong>Labels:</strong> shopify-admin, navigation, discounts, no-code</p>

<hr>

<h3>Background</h3>
<p>The Discounts link in the site header has been updated to open a full-width dropdown bar (matching the behavior of the Categories and Seasonal dropdowns). The dropdown is wired and ready — it reads its menu items from a Shopify collection called <code>discounts-menu</code> via the <code>custom.child_nodes</code> metafield. Until that collection is created and populated in Shopify Admin, the dropdown will open and show a "Discounted categories coming soon" placeholder message.</p>

<h3>Steps to Complete</h3>

<h4>Step 1 — Create the <code>discounts-menu</code> collection</h4>
<ol>
  <li>Go to <strong>Shopify Admin → Products → Collections → Create collection</strong></li>
  <li>Set the <strong>Title</strong> to: <code>Discounts Menu</code> <em>(internal only — customers never navigate to this collection)</em></li>
  <li>Confirm the <strong>Handle</strong> is exactly: <code>discounts-menu</code> — this must match exactly or the dropdown will not populate</li>
  <li>Set collection type to <strong>Manual</strong></li>
  <li>Leave the product list empty — this collection is a navigation container only, not a shoppable page</li>
  <li>Save</li>
</ol>

<h4>Step 2 — Verify the <code>child_nodes</code> metafield definition exists</h4>
<p>This metafield is already used by other nav collections (Categories, Seasonal). If it was already set up, skip to Step 3.</p>
<ol>
  <li>Go to <strong>Settings → Custom Data → Collections</strong></li>
  <li>Look for a metafield definition with namespace <code>custom</code> and key <code>child_nodes</code></li>
  <li>If it does not exist, create it:
    <ul>
      <li><strong>Namespace:</strong> <code>custom</code></li>
      <li><strong>Key:</strong> <code>child_nodes</code></li>
      <li><strong>Type:</strong> Collection reference → <em>List of collections</em></li>
    </ul>
  </li>
</ol>

<h4>Step 3 — Link the discounted category collections</h4>
<ol>
  <li>Open the <strong>Discounts Menu</strong> collection you created in Step 1</li>
  <li>Scroll down to the <strong>Metafields</strong> section</li>
  <li>Find <code>custom.child_nodes</code> and add each category collection you want to appear in the Discounts dropdown (e.g. Furniture, Electronics, Appliances, etc.)</li>
  <li>Save</li>
</ol>

<h4>Step 4 — Set display order with <code>menu_priority_order</code></h4>
<p>Each collection linked in Step 3 can be given an integer priority to control its position in the dropdown. Lower numbers appear first. Collections with no value set are sorted alphabetically after all numbered items.</p>
<ol>
  <li>Open one of the category collections you linked (e.g. "Furniture")</li>
  <li>Scroll to <strong>Metafields</strong> → find <code>custom.menu_priority_order</code></li>
  <li>Enter a whole number (e.g. <code>1</code> for first position, <code>2</code> for second, etc.)</li>
  <li>Save</li>
  <li>Repeat for each collection in the Discounts dropdown</li>
</ol>

<p><strong>Recommended numbering convention:</strong> Use values like <code>10</code>, <code>20</code>, <code>30</code> instead of <code>1</code>, <code>2</code>, <code>3</code>. This leaves room to insert new items between existing ones later without renumbering the whole list.</p>

<table>
  <thead>
    <tr>
      <th><code>menu_priority_order</code> value</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>10</code></td>
      <td>Appears first in the dropdown</td>
    </tr>
    <tr>
      <td><code>20</code></td>
      <td>Appears second</td>
    </tr>
    <tr>
      <td><code>30</code></td>
      <td>Appears third</td>
    </tr>
    <tr>
      <td><em>(not set)</em></td>
      <td>Sorted alphabetically after all numbered items</td>
    </tr>
  </tbody>
</table>

<h3>Acceptance Criteria</h3>
<ul>
  <li>Clicking <strong>Discounts</strong> in the site header opens a full-width dropdown bar (same visual style as Categories)</li>
  <li>The dropdown shows the category collections that were linked in Step 3, in the order defined by <code>menu_priority_order</code></li>
  <li>Clicking a category in the dropdown navigates to that collection page</li>
  <li>The dropdown closes when the user clicks elsewhere on the page or navigates to a new route</li>
  <li>Opening the Discounts dropdown closes any open Categories or Seasonal dropdown (they are mutually exclusive)</li>
  <li>On mobile, Discounts appears as a collapsible accordion section in the slide-out menu, showing the same category links</li>
  <li>The "Discounted categories coming soon" placeholder is no longer visible once at least one collection is linked</li>
</ul>
