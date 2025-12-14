// Global JavaScript functions and utilities

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

// Shopify section events
if (!customElements.get('shopify-section')) {
  customElements.define('shopify-section', class extends HTMLElement {
    constructor() {
      super();
    }
  });
}
