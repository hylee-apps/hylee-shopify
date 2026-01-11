/**
 * Product Card AJAX Add to Cart
 * Handles direct add-to-cart with loading states and variant selection
 */

(function() {
  'use strict';

  // Initialize all product cards
  function initProductCards() {
    const cards = document.querySelectorAll('.product-card[data-product-id]');
    cards.forEach(initCard);
  }

  function initCard(card) {
    const quickAddBtn = card.querySelector('.product-card__quick-add[data-variant-id]');
    const swatches = card.querySelectorAll('.product-card__swatch');
    const sizes = card.querySelectorAll('.product-card__size');

    // Handle quick add click
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', handleQuickAdd);
    }

    // Handle swatch selection
    swatches.forEach(swatch => {
      if (!swatch.disabled) {
        swatch.addEventListener('click', () => handleSwatchClick(card, swatch));
      }
    });

    // Handle size selection
    sizes.forEach(size => {
      if (!size.disabled) {
        size.addEventListener('click', () => handleSizeClick(card, size));
      }
    });
  }

  async function handleQuickAdd(event) {
    event.preventDefault();
    const button = event.currentTarget;
    
    if (button.disabled || button.classList.contains('product-card__quick-add--loading')) {
      return;
    }

    const variantId = button.dataset.variantId;
    
    if (!variantId) {
      console.error('No variant ID found');
      return;
    }

    // Set loading state
    button.classList.add('product-card__quick-add--loading');
    button.disabled = true;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: parseInt(variantId),
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      
      // Set success state
      button.classList.remove('product-card__quick-add--loading');
      button.classList.add('product-card__quick-add--success');

      // Update cart count in header if element exists
      updateCartCount();

      // Reset after 2 seconds
      setTimeout(() => {
        button.classList.remove('product-card__quick-add--success');
        button.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Reset button state
      button.classList.remove('product-card__quick-add--loading');
      button.disabled = false;
      
      // Show error briefly
      const textEl = button.querySelector('.product-card__quick-add-text');
      if (textEl) {
        const originalText = textEl.textContent;
        textEl.textContent = 'Error - Try Again';
        setTimeout(() => {
          textEl.textContent = originalText;
        }, 2000);
      }
    }
  }

  function handleSwatchClick(card, swatch) {
    const container = swatch.closest('.product-card__swatches');
    const allSwatches = container.querySelectorAll('.product-card__swatch');
    
    // Update active state
    allSwatches.forEach(s => s.classList.remove('product-card__swatch--active'));
    swatch.classList.add('product-card__swatch--active');

    // Update variant ID based on selection
    updateSelectedVariant(card);
  }

  function handleSizeClick(card, size) {
    const container = size.closest('.product-card__size-options');
    const allSizes = container.querySelectorAll('.product-card__size');
    
    // Update active state
    allSizes.forEach(s => s.classList.remove('product-card__size--active'));
    size.classList.add('product-card__size--active');

    // Update variant ID based on selection
    updateSelectedVariant(card);
  }

  function updateSelectedVariant(card) {
    // Get all selected options
    const selectedOptions = [];
    
    const activeSwatches = card.querySelectorAll('.product-card__swatch--active');
    activeSwatches.forEach(swatch => {
      selectedOptions.push(swatch.dataset.optionValue);
    });

    const activeSizes = card.querySelectorAll('.product-card__size--active');
    activeSizes.forEach(size => {
      selectedOptions.push(size.dataset.optionValue);
    });

    // If we have selected options, try to find matching variant
    if (selectedOptions.length > 0) {
      const productId = card.dataset.productId;
      const button = card.querySelector('.product-card__quick-add[data-variant-id]');
      
      if (button && window.productVariants && window.productVariants[productId]) {
        const variants = window.productVariants[productId];
        const matchingVariant = variants.find(variant => {
          return selectedOptions.every(option => variant.options.includes(option));
        });

        if (matchingVariant) {
          button.dataset.variantId = matchingVariant.id;
          
          // Update button state based on availability
          if (!matchingVariant.available) {
            button.disabled = true;
            const textEl = button.querySelector('.product-card__quick-add-text');
            if (textEl) textEl.textContent = 'Sold Out';
          } else {
            button.disabled = false;
            const textEl = button.querySelector('.product-card__quick-add-text');
            if (textEl) textEl.textContent = 'Add to Cart';
          }
        }
      }
    }
  }

  async function updateCartCount() {
    try {
      const response = await fetch('/cart.js', {
        headers: { 'Accept': 'application/json' }
      });
      const cart = await response.json();
      
      // Update cart count elements
      const countElements = document.querySelectorAll('[data-cart-count], .cart-count, .header__cart-count');
      countElements.forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? '' : 'none';
      });

      // Dispatch custom event for other scripts
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
      
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductCards);
  } else {
    initProductCards();
  }

  // Re-initialize when new content is loaded (for AJAX pagination, etc.)
  document.addEventListener('shopify:section:load', initProductCards);

})();
