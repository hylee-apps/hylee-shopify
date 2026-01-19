/**
 * Component JavaScript - Interactive behaviors for UI components
 * Handles: Accordion, Alert, Modal, Tabs
 */

(function () {
  'use strict';

  // ===========================================
  // ACCORDION
  // ===========================================
  function initAccordions() {
    document.querySelectorAll('[data-accordion]').forEach((accordion) => {
      const trigger = accordion.querySelector('[data-accordion-trigger]');
      const content = accordion.querySelector('[data-accordion-content]');
      const icon = accordion.querySelector('.accordion__icon');

      if (!trigger || !content) return;

      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        trigger.setAttribute('aria-expanded', !isExpanded);
        content.hidden = isExpanded;
        content.classList.toggle('accordion__content--open', !isExpanded);

        if (icon) {
          icon.classList.toggle('accordion__icon--open', !isExpanded);
        }
      });
    });
  }

  // ===========================================
  // ALERT
  // ===========================================
  function initAlerts() {
    document.querySelectorAll('[data-alert]').forEach((alert) => {
      const dismissBtn = alert.querySelector('[data-alert-dismiss]');

      if (!dismissBtn) return;

      dismissBtn.addEventListener('click', () => {
        alert.setAttribute('data-dismissing', '');
        alert.addEventListener(
          'animationend',
          () => {
            alert.remove();
          },
          { once: true }
        );
      });
    });
  }

  // ===========================================
  // MODAL
  // ===========================================
  function initModals() {
    // Open modal triggers
    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) openModal(modal);
      });
    });

    // Close buttons
    document.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('[data-modal]');
        if (modal) closeModal(modal);
      });
    });

    // Backdrop clicks
    document.querySelectorAll('[data-modal-backdrop]').forEach((backdrop) => {
      backdrop.addEventListener('click', () => {
        const modal = backdrop.closest('[data-modal]');
        if (modal) closeModal(modal);
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[data-modal]:not([hidden])');
        if (openModal) closeModal(openModal);
      }
    });
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add('modal-open');

    // Focus first focusable element
    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();

    // Trap focus
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal(modal) {
    modal.setAttribute('data-closing', '');

    modal.addEventListener(
      'animationend',
      () => {
        modal.hidden = true;
        modal.removeAttribute('data-closing');
        document.body.classList.remove('modal-open');
      },
      { once: true }
    );

    modal.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const modal = e.currentTarget;
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }

  // ===========================================
  // TABS
  // ===========================================
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
      const triggers = tabGroup.querySelectorAll('[data-tab-trigger]');
      const panels = tabGroup.querySelectorAll('[data-tab-panel]');

      triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const index = trigger.getAttribute('data-tab-trigger');
          activateTab(tabGroup, index, triggers, panels);
        });

        // Keyboard navigation
        trigger.addEventListener('keydown', (e) => {
          const currentIndex = parseInt(trigger.getAttribute('data-tab-trigger'));
          let newIndex;

          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              e.preventDefault();
              newIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1;
              break;
            case 'ArrowRight':
            case 'ArrowDown':
              e.preventDefault();
              newIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0;
              break;
            case 'Home':
              e.preventDefault();
              newIndex = 0;
              break;
            case 'End':
              e.preventDefault();
              newIndex = triggers.length - 1;
              break;
            default:
              return;
          }

          activateTab(tabGroup, newIndex, triggers, panels);
          triggers[newIndex].focus();
        });
      });
    });
  }

  function activateTab(tabGroup, index, triggers, panels) {
    triggers.forEach((t, i) => {
      const isActive = i == index;
      t.setAttribute('aria-selected', isActive);
      t.setAttribute('tabindex', isActive ? '0' : '-1');
      t.classList.toggle('tabs__trigger--active', isActive);
    });

    panels.forEach((p, i) => {
      const isActive = i == index;
      p.hidden = !isActive;
      p.classList.toggle('tabs__panel--active', isActive);
    });
  }

  // ===========================================
  // ORDERS TAB (Amazon-style Orders Page)
  // ===========================================
  function initOrdersTab() {
    const tabNav = document.querySelector('[data-orders-tab]')?.closest('.customer-orders__nav');
    const searchInput = document.querySelector('[data-orders-search]');
    const searchBtn = document.querySelector('[data-orders-search-btn]');
    const timeFilter = document.querySelector('[data-orders-time-filter]');
    const orderCountEl = document.querySelector('[data-orders-count]');

    // If no tab nav AND no search input, nothing to do
    if (!tabNav && !searchInput) return;

    const tabs = document.querySelectorAll('[data-orders-tab]');
    const panels = document.querySelectorAll('[data-orders-panel]');

    // Tab switching (only if tabs exist)
    if (tabNav) {
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const tabId = tab.getAttribute('data-orders-tab');
          switchOrdersTab(tabId, tabs, panels);
        });

        // Keyboard navigation
        tab.addEventListener('keydown', (e) => {
          const tabsArray = Array.from(tabs);
          const currentIndex = tabsArray.indexOf(tab);
          let newIndex;

          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              newIndex = currentIndex > 0 ? currentIndex - 1 : tabsArray.length - 1;
              break;
            case 'ArrowRight':
              e.preventDefault();
              newIndex = currentIndex < tabsArray.length - 1 ? currentIndex + 1 : 0;
              break;
            case 'Home':
              e.preventDefault();
              newIndex = 0;
              break;
            case 'End':
              e.preventDefault();
              newIndex = tabsArray.length - 1;
              break;
            default:
              return;
          }

          tabsArray[newIndex].click();
          tabsArray[newIndex].focus();
        });
      });
    }

    // Search functionality
    function performSearch() {
      const searchTerm = searchInput?.value.toLowerCase().trim() || '';
      const orderCards = document.querySelectorAll('[data-orders-panel="all"] [data-order-card]');
      let visibleCount = 0;

      orderCards.forEach((card) => {
        const orderNumber = (card.getAttribute('data-order-number') || '').toLowerCase();
        const products = (card.getAttribute('data-order-products') || '').toLowerCase();

        const matches =
          searchTerm === '' || orderNumber.includes(searchTerm) || products.includes(searchTerm);

        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      // Update count display
      if (orderCountEl) {
        orderCountEl.textContent = `${visibleCount} order${visibleCount !== 1 ? 's' : ''}`;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', debounce(performSearch, 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch();
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }

    // Time filter functionality
    if (timeFilter) {
      timeFilter.addEventListener('change', () => {
        const days = timeFilter.value;
        filterOrdersByTime(days);
      });
    }

    function filterOrdersByTime(days) {
      const orderCards = document.querySelectorAll('[data-orders-panel="all"] [data-order-card]');
      const now = Date.now();
      const cutoffMs = days === 'all' ? 0 : now - parseInt(days) * 24 * 60 * 60 * 1000;
      let visibleCount = 0;

      orderCards.forEach((card) => {
        const orderDate = parseInt(card.getAttribute('data-order-date') || '0') * 1000;
        const isVisible = days === 'all' || orderDate >= cutoffMs;

        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });

      // Update count display
      if (orderCountEl) {
        orderCountEl.textContent = `${visibleCount} order${visibleCount !== 1 ? 's' : ''}`;
      }

      // Save filter state
      saveOrdersFilter(null, days);
    }

    // Restore saved filter state on page load
    const savedFilter = loadOrdersFilter();
    if (savedFilter) {
      if (savedFilter.tab && tabs.length > 0) {
        const savedTab = Array.from(tabs).find(
          (t) => t.getAttribute('data-orders-tab') === savedFilter.tab
        );
        if (savedTab) {
          setTimeout(() => savedTab.click(), 0);
        }
      }
      if (savedFilter.period && timeFilter) {
        timeFilter.value = savedFilter.period;
        filterOrdersByTime(savedFilter.period);
      }
    }
  }

  function switchOrdersTab(tabId, tabs, panels) {
    // Update tab buttons
    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-orders-tab') === tabId;
      tab.classList.toggle('customer-orders__nav-item--active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Update panels
    panels.forEach((panel) => {
      const isActive = panel.getAttribute('data-orders-panel') === tabId;
      panel.classList.toggle('customer-orders__panel--active', isActive);
      panel.hidden = !isActive;
    });

    // Save tab state
    saveOrdersFilter(tabId, null);
  }

  // ===========================================
  // ORDERS FILTER PERSISTENCE (sessionStorage)
  // ===========================================
  function saveOrdersFilter(tab, period) {
    try {
      const current = loadOrdersFilter() || {};
      if (tab !== null) current.tab = tab;
      if (period !== null) current.period = period;
      sessionStorage.setItem('ordersFilter', JSON.stringify(current));
    } catch (e) {
      // sessionStorage not available
    }
  }

  function loadOrdersFilter() {
    try {
      const saved = sessionStorage.getItem('ordersFilter');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  // Utility: Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===========================================
  // HEADER INNER (Non-homepage header)
  // ===========================================
  function initHeaderInner() {
    const header = document.querySelector('[data-header-inner]');
    if (!header) return;

    // Mobile menu toggle
    const menuToggle = header.querySelector('[data-header-menu-toggle]');
    const mobileMenu = header.querySelector('[data-header-mobile-menu]');
    const menuClose = header.querySelector('[data-header-menu-close]');
    const menuBackdrop = header.querySelector('[data-header-menu-backdrop]');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => openMobileMenu());

      if (menuClose) {
        menuClose.addEventListener('click', () => closeMobileMenu());
      }

      if (menuBackdrop) {
        menuBackdrop.addEventListener('click', () => closeMobileMenu());
      }
    }

    function openMobileMenu() {
      mobileMenu.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Focus first focusable element in menu
      const firstFocusable = mobileMenu.querySelector('button, a, input');
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }

      // Add focus trap
      mobileMenu.addEventListener('keydown', trapMobileMenuFocus);
    }

    function closeMobileMenu() {
      mobileMenu.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();

      // Remove focus trap
      mobileMenu.removeEventListener('keydown', trapMobileMenuFocus);
    }

    function trapMobileMenuFocus(e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableEls = mobileMenu.querySelectorAll(
        'button:not([hidden]), a:not([hidden]), input:not([hidden]), [tabindex]:not([tabindex="-1"]):not([hidden])'
      );
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    // Mobile search toggle
    const searchToggle = header.querySelector('[data-header-search-toggle]');
    const searchOverlay = header.querySelector('[data-header-search-overlay]');
    const searchClose = header.querySelector('[data-header-search-close]');

    if (searchToggle && searchOverlay) {
      searchToggle.addEventListener('click', () => {
        searchOverlay.hidden = false;
        searchToggle.setAttribute('aria-expanded', 'true');

        const input = searchOverlay.querySelector('input');
        if (input) {
          setTimeout(() => input.focus(), 100);
        }
      });

      if (searchClose) {
        searchClose.addEventListener('click', () => {
          searchOverlay.hidden = true;
          searchToggle.setAttribute('aria-expanded', 'false');
          searchToggle.focus();
        });
      }
    }

    // Account dropdown
    const accountContainer = header.querySelector('[data-header-account]');
    const accountToggle = header.querySelector('[data-header-account-toggle]');
    const accountFlyout = header.querySelector('[data-header-account-flyout]');

    if (accountToggle && accountFlyout) {
      // Click toggle
      accountToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = accountToggle.getAttribute('aria-expanded') === 'true';
        toggleAccountFlyout(!isExpanded);
      });

      // Desktop hover
      if (accountContainer) {
        let hoverTimeout;

        accountContainer.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimeout);
          if (window.innerWidth >= 768) {
            toggleAccountFlyout(true);
          }
        });

        accountContainer.addEventListener('mouseleave', () => {
          hoverTimeout = setTimeout(() => {
            if (window.innerWidth >= 768) {
              toggleAccountFlyout(false);
            }
          }, 150);
        });
      }

      // Keyboard navigation
      accountFlyout.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          toggleAccountFlyout(false);
          accountToggle.focus();
        }
      });
    }

    function toggleAccountFlyout(open) {
      accountFlyout.hidden = !open;
      accountToggle.setAttribute('aria-expanded', open);
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      // Close account flyout
      if (accountFlyout && !accountFlyout.hidden) {
        if (!e.target.closest('[data-header-account]')) {
          toggleAccountFlyout(false);
        }
      }

      // Close search overlay on outside click
      if (searchOverlay && !searchOverlay.hidden) {
        if (
          !e.target.closest('[data-header-search-overlay]') &&
          !e.target.closest('[data-header-search-toggle]')
        ) {
          searchOverlay.hidden = true;
          if (searchToggle) {
            searchToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });

    // Global escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close mobile menu
        if (mobileMenu && !mobileMenu.hidden) {
          closeMobileMenu();
          return;
        }

        // Close search overlay
        if (searchOverlay && !searchOverlay.hidden) {
          searchOverlay.hidden = true;
          if (searchToggle) {
            searchToggle.setAttribute('aria-expanded', 'false');
            searchToggle.focus();
          }
          return;
        }

        // Close account flyout
        if (accountFlyout && !accountFlyout.hidden) {
          toggleAccountFlyout(false);
          if (accountToggle) accountToggle.focus();
        }
      }
    });
  }

  // ===========================================
  // BUY AGAIN / REORDER FUNCTIONALITY
  // ===========================================
  function initBuyAgain() {
    document.querySelectorAll('[data-buy-again]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const variantId = btn.dataset.variantId;
        const quantity = parseInt(btn.dataset.quantity) || 1;
        const productName = btn.dataset.productName || 'Item';

        btn.classList.add('btn--loading');
        btn.disabled = true;

        try {
          await addToCart(variantId, quantity);
          showToast(`${productName} added to cart!`, 'success');
        } catch (error) {
          showToast('Failed to add to cart', 'error');
        } finally {
          btn.classList.remove('btn--loading');
          btn.disabled = false;
        }
      });
    });
  }

  function initReorderAll() {
    document.querySelectorAll('[data-reorder-all]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        let items = [];
        try {
          items = JSON.parse(btn.dataset.items || '[]');
        } catch (parseError) {
          showToast('Failed to parse order items', 'error');
          return;
        }

        if (items.length === 0) {
          showToast('No items to reorder', 'info');
          return;
        }

        btn.classList.add('btn--loading');
        btn.disabled = true;

        try {
          for (const item of items) {
            await addToCart(item.variantId, item.quantity);
          }
          showToast(
            `Added ${items.length} item${items.length > 1 ? 's' : ''} to cart! <a href="/cart" class="toast__link">View Cart</a>`,
            'success',
            true
          );
        } catch (error) {
          showToast('Failed to add some items to cart', 'error');
        } finally {
          btn.classList.remove('btn--loading');
          btn.disabled = false;
        }
      });
    });
  }

  async function addToCart(variantId, quantity = 1) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity }] }),
    });

    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  }

  // ===========================================
  // TOAST NOTIFICATIONS
  // ===========================================
  function showToast(message, type = 'info', allowHtml = false) {
    // Create toast container if doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    if (allowHtml) {
      toast.innerHTML = message;
    } else {
      toast.textContent = message;
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast__close';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => removeToast(toast));
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    // Auto-remove after 5 seconds
    setTimeout(() => removeToast(toast), 5000);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  // ===========================================
  // ORDER DETAIL ACTIONS
  // ===========================================
  function initOrderDetailActions() {
    const orderDetail = document.querySelector('.order-detail');
    if (!orderDetail) return;

    const orderName = orderDetail.dataset.orderName || 'Order';
    const customerEmail = orderDetail.dataset.customerEmail || '';
    const orderDate = orderDetail.dataset.orderDate || '';
    const orderTotal = orderDetail.dataset.orderTotal || '';

    // Download Invoice - triggers browser print dialog
    // User can choose "Save as PDF" for a downloadable invoice
    const downloadBtn = document.querySelector('[data-download-invoice]');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Email Receipt - opens email client with prefilled content
    const emailBtn = document.querySelector('[data-email-receipt]');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        if (!customerEmail) {
          // No email available - inform user
          alert('A receipt was sent to your email when you placed this order.');
          return;
        }

        const subject = encodeURIComponent(`Receipt for ${orderName}`);
        const body = encodeURIComponent(
          `Order Details\n` +
            `─────────────\n` +
            `Order: ${orderName}\n` +
            `Date: ${orderDate}\n` +
            `Total: ${orderTotal}\n\n` +
            `View your order: ${window.location.href}\n\n` +
            `Thank you for your purchase!`
        );

        window.location.href = `mailto:${customerEmail}?subject=${subject}&body=${body}`;
      });
    }
  }

  // ===========================================
  // INITIALIZE
  // ===========================================
  function init() {
    initAccordions();
    initAlerts();
    initModals();
    initTabs();
    initOrdersTab();
    initHeaderInner();
    initBuyAgain();
    initReorderAll();
    initOrderDetailActions();
    initCustomerSettings();
  }

  // ===========================================
  // ADDRESSES PAGE
  // ===========================================
  window.initAddresses = function () {
    const page = document.getElementById('addresses-page');
    if (!page) return;

    // Parse country/province data
    let countryData = {};
    const dataScript = document.getElementById('country-provinces-data');
    if (dataScript) {
      try {
        countryData = JSON.parse(dataScript.textContent);
      } catch (e) {
        console.error('Failed to parse country data:', e);
      }
    }

    // DOM Elements
    const addressModal = document.getElementById('address-modal');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const addressForm = document.getElementById('address-form');
    const formError = document.getElementById('address-form-error');
    const countrySelect = document.getElementById('address-country');
    const provinceSelect = document.getElementById('address-province');
    const provinceField = document.getElementById('province-field');
    const modalTitle = addressModal?.querySelector('.modal__title');
    const submitBtn = document.getElementById('address-form-submit');

    // Remove loading state
    setTimeout(() => {
      page.classList.remove('addresses-page--loading');
    }, 300);

    // Show URL-based alerts (after form submissions)
    checkUrlParams();

    // ===========================================
    // Modal Open Handlers
    // ===========================================
    document.querySelectorAll('[data-modal-open="address-modal"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const addressId = btn.getAttribute('data-address-id');

        if (addressId) {
          // Edit mode - populate form with address data
          populateEditForm(btn);
          if (modalTitle) modalTitle.textContent = 'Edit address';
          if (submitBtn)
            submitBtn.querySelector('.btn__text, span')?.textContent ||
              (submitBtn.textContent = 'Save Changes');

          // Update form action for edit
          const formMethod = document.getElementById('address-form-method');
          const formIdInput = document.getElementById('address-form-id');
          if (formMethod) formMethod.value = 'put';
          if (formIdInput) formIdInput.value = addressId;
          if (addressForm) {
            addressForm.action = addressForm.action.replace(
              /\/addresses\/?$/,
              '/addresses/' + addressId
            );
          }
        } else {
          // Add mode - reset form
          resetAddressForm();
          if (modalTitle) modalTitle.textContent = 'Add a new address';
        }
      });
    });

    // Delete modal open handlers
    document.querySelectorAll('[data-modal-open="delete-confirm-modal"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const addressId = btn.getAttribute('data-address-id');
        const addressName = btn.getAttribute('data-address-name');

        const nameEl = document.getElementById('delete-address-name');
        const idInput = document.getElementById('delete-address-id');

        if (nameEl) nameEl.textContent = addressName;
        if (idInput) idInput.value = addressId;
      });
    });

    // ===========================================
    // Form Cancel Buttons
    // ===========================================
    document.querySelectorAll('.address-form__cancel, .delete-confirm__cancel').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('[data-modal]');
        if (modal) closeModal(modal);
      });
    });

    // ===========================================
    // Confirm Delete Button
    // ===========================================
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        const addressId = document.getElementById('delete-address-id')?.value;
        if (addressId) {
          const deleteForm = document.getElementById('delete-form-' + addressId);
          if (deleteForm) {
            deleteForm.submit();
          }
        }
      });
    }

    // ===========================================
    // Set Default Address Buttons
    // ===========================================
    document.querySelectorAll('[data-set-default-address]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const addressId = btn.getAttribute('data-set-default-address');
        // Use Shopify.postLink which properly handles CSRF tokens
        if (typeof Shopify !== 'undefined' && Shopify.postLink) {
          Shopify.postLink('/account/addresses/' + addressId, {
            parameters: {
              _method: 'put',
              'address[default]': '1',
            },
          });
        } else {
          // Fallback: submit hidden form
          const form = document.getElementById('set-default-form-' + addressId);
          if (form) {
            form.submit();
          }
        }
      });
    });

    // ===========================================
    // Country/Province Cascade
    // ===========================================
    if (countrySelect && provinceSelect) {
      countrySelect.addEventListener('change', () => {
        updateProvinces(countrySelect.value);
      });

      // Initialize provinces for default country
      updateProvinces(countrySelect.value);
    }

    function updateProvinces(countryCode) {
      if (!provinceSelect || !provinceField) return;

      // Find country by code or name
      let provinces = [];
      if (countryData[countryCode]) {
        provinces = countryData[countryCode].provinces || [];
      } else {
        // Search by name
        for (const code in countryData) {
          if (countryData[code].name === countryCode) {
            provinces = countryData[code].provinces || [];
            break;
          }
        }
      }

      // Clear existing options
      provinceSelect.innerHTML = '<option value="">Select state/province</option>';

      if (provinces.length > 0) {
        provinces.forEach((province) => {
          const option = document.createElement('option');
          option.value = province.code;
          option.textContent = province.name;
          provinceSelect.appendChild(option);
        });
        provinceField.style.display = '';
        provinceSelect.required = true;
      } else {
        provinceField.style.display = 'none';
        provinceSelect.required = false;
      }
    }

    // ===========================================
    // Form Validation
    // ===========================================
    if (addressForm) {
      addressForm.addEventListener('submit', (e) => {
        if (!validateAddressForm()) {
          e.preventDefault();
        }
      });
    }

    function validateAddressForm() {
      const errors = [];

      // Required fields
      const requiredFields = [
        { id: 'address-first-name', label: 'First name' },
        { id: 'address-last-name', label: 'Last name' },
        { id: 'address-address1', label: 'Address' },
        { id: 'address-city', label: 'City' },
        { id: 'address-country', label: 'Country' },
        { id: 'address-zip', label: 'ZIP/Postal code' },
      ];

      requiredFields.forEach((field) => {
        const input = document.getElementById(field.id);
        if (input && !input.value.trim()) {
          errors.push(field.label + ' is required');
          input.classList.add('input--error');
        } else if (input) {
          input.classList.remove('input--error');
        }
      });

      // Province required if visible
      if (provinceField && provinceField.style.display !== 'none') {
        if (!provinceSelect.value) {
          errors.push('State/Province is required');
          provinceSelect.classList.add('select--error');
        } else {
          provinceSelect.classList.remove('select--error');
        }
      }

      // Phone validation (optional but must be valid format if provided)
      const phoneInput = document.getElementById('address-phone');
      if (phoneInput && phoneInput.value.trim()) {
        const phonePattern = /^\+?[\d\s\-()]{7,}$/;
        if (!phonePattern.test(phoneInput.value.trim())) {
          errors.push('Please enter a valid phone number');
          phoneInput.classList.add('input--error');
        } else {
          phoneInput.classList.remove('input--error');
        }
      }

      // Show errors
      if (errors.length > 0 && formError) {
        formError.innerHTML = errors.join('<br>');
        formError.classList.add('is-visible');
        formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return false;
      }

      if (formError) {
        formError.classList.remove('is-visible');
      }
      return true;
    }

    // ===========================================
    // Form Helpers
    // ===========================================
    function populateEditForm(btn) {
      const fields = {
        'address-first-name': 'data-address-first-name',
        'address-last-name': 'data-address-last-name',
        'address-company': 'data-address-company',
        'address-address1': 'data-address-address1',
        'address-address2': 'data-address-address2',
        'address-city': 'data-address-city',
        'address-zip': 'data-address-zip',
        'address-phone': 'data-address-phone',
      };

      for (const [inputId, dataAttr] of Object.entries(fields)) {
        const input = document.getElementById(inputId);
        if (input) {
          input.value = btn.getAttribute(dataAttr) || '';
        }
      }

      // Country
      const countryValue = btn.getAttribute('data-address-country');
      if (countrySelect && countryValue) {
        // Try to find matching option
        for (const option of countrySelect.options) {
          if (option.value === countryValue || option.textContent === countryValue) {
            countrySelect.value = option.value;
            break;
          }
        }
        updateProvinces(countrySelect.value);
      }

      // Province (after updating provinces)
      setTimeout(() => {
        const provinceValue =
          btn.getAttribute('data-address-province') ||
          btn.getAttribute('data-address-province-code');
        if (provinceSelect && provinceValue) {
          for (const option of provinceSelect.options) {
            if (option.value === provinceValue || option.textContent === provinceValue) {
              provinceSelect.value = option.value;
              break;
            }
          }
        }
      }, 50);

      // Default checkbox
      const isDefault = btn.getAttribute('data-address-default') === 'true';
      const defaultCheckbox = document.getElementById('address-default');
      const defaultWrapper = document.getElementById('default-checkbox-wrapper');

      if (defaultCheckbox) {
        defaultCheckbox.checked = isDefault;
      }
      // Hide checkbox if already default
      if (defaultWrapper) {
        defaultWrapper.style.display = isDefault ? 'none' : '';
      }

      // Clear any previous errors
      if (formError) {
        formError.classList.remove('is-visible');
      }
      document.querySelectorAll('.input--error, .select--error').forEach((el) => {
        el.classList.remove('input--error', 'select--error');
      });
    }

    function resetAddressForm() {
      if (addressForm) {
        addressForm.reset();
        addressForm.action = addressForm.action.replace(/\/addresses\/\d+/, '/addresses');
      }

      const formMethod = document.getElementById('address-form-method');
      const formIdInput = document.getElementById('address-form-id');
      if (formMethod) formMethod.value = '';
      if (formIdInput) formIdInput.value = '';

      // Show default checkbox
      const defaultWrapper = document.getElementById('default-checkbox-wrapper');
      if (defaultWrapper) {
        defaultWrapper.style.display = '';
      }

      // Clear errors
      if (formError) {
        formError.classList.remove('is-visible');
      }
      document.querySelectorAll('.input--error, .select--error').forEach((el) => {
        el.classList.remove('input--error', 'select--error');
      });

      // Reset provinces
      if (countrySelect) {
        updateProvinces(countrySelect.value);
      }
    }

    function checkUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const alertEl = document.getElementById('addresses-alert');

      if (!alertEl) return;

      if (params.get('address_added') === 'true') {
        showAlert(alertEl, 'success', 'Address added successfully!');
        cleanUrl();
      } else if (params.get('address_updated') === 'true') {
        showAlert(alertEl, 'success', 'Address updated successfully!');
        cleanUrl();
      } else if (params.get('address_deleted') === 'true') {
        showAlert(alertEl, 'success', 'Address removed successfully!');
        cleanUrl();
      }
    }

    function showAlert(container, type, message) {
      container.innerHTML = `
        <div class="alert alert--${type}" data-alert role="alert">
          <div class="alert__content">
            <span class="alert__message">${message}</span>
          </div>
          <button type="button" class="alert__dismiss" data-alert-dismiss aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Re-init alert dismiss
      const alert = container.querySelector('[data-alert]');
      const dismissBtn = alert?.querySelector('[data-alert-dismiss]');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          alert.remove();
        });
      }
    }

    function cleanUrl() {
      const url = new URL(window.location.href);
      url.searchParams.delete('address_added');
      url.searchParams.delete('address_updated');
      url.searchParams.delete('address_deleted');
      window.history.replaceState({}, '', url.pathname);
    }

    // Empty state add button
    const addFirstBtn = document.getElementById('add-first-address-btn');
    if (addFirstBtn) {
      addFirstBtn.addEventListener('click', () => {
        const addBtn = document.querySelector(
          '[data-modal-open="address-modal"][data-action="add"]'
        );
        if (addBtn) addBtn.click();
      });
    }

    // Header add button
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
      addAddressBtn.addEventListener('click', () => {
        resetAddressForm();
        if (modalTitle) modalTitle.textContent = 'Add a new address';
        if (addressModal) openModal(addressModal);
      });
    }
  };

  // ===========================================
  // CUSTOMER SETTINGS (Login & Security)
  // ===========================================
  const initCustomerSettings = function () {
    const settingsContainer = document.querySelector('[data-customer-settings]');
    if (!settingsContainer) return;

    const alertsContainer = document.getElementById('settings-alerts');
    const forms = settingsContainer.querySelectorAll('[data-settings-form]');

    // Initialize each form
    forms.forEach((form) => {
      const formType = form.getAttribute('data-settings-form');
      const submitBtn = form.querySelector('button[type="submit"]');
      const errorContainer = form.querySelector('.customer-settings__form-error');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateSettingsForm(form)) {
          return;
        }

        // Show loading state
        setLoadingState(submitBtn, true);
        hideFormError(errorContainer);

        try {
          if (formType === 'password') {
            // Handle password reset - this is the only active form
            await handlePasswordReset(form, settingsContainer);
          }
          // Note: Name, email, and phone editing requires Shopify Admin API backend
          // These forms are disabled in the UI until a backend solution is implemented
        } catch (error) {
          console.error('Settings form error:', error);
          showFormError(errorContainer, error.message || 'An error occurred. Please try again.');
        } finally {
          setLoadingState(submitBtn, false);
        }
      });
    });

    // Check URL params for success messages on page load
    checkSettingsUrlParams();

    // Form validation
    function validateSettingsForm(form) {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach((field) => {
        const value = field.value.trim();
        const inputGroup = field.closest('.input-group');

        if (!value) {
          isValid = false;
          field.classList.add('input--error');
          if (inputGroup) {
            const existingError = inputGroup.querySelector('.input-error');
            if (!existingError) {
              const errorSpan = document.createElement('span');
              errorSpan.className = 'input-error';
              errorSpan.id = `${field.id}-error`;
              errorSpan.textContent = 'This field is required';
              inputGroup.appendChild(errorSpan);
            }
          }
        } else {
          field.classList.remove('input--error');
          if (inputGroup) {
            const existingError = inputGroup.querySelector('.input-error');
            if (existingError) existingError.remove();
          }
        }

        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            field.classList.add('input--error');
            if (inputGroup) {
              let errorSpan = inputGroup.querySelector('.input-error');
              if (!errorSpan) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'input-error';
                errorSpan.id = `${field.id}-error`;
                inputGroup.appendChild(errorSpan);
              }
              errorSpan.textContent = 'Please enter a valid email address';
            }
          }
        }
      });

      return isValid;
    }

    // Password reset handler
    async function handlePasswordReset(form, container) {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      // Shopify returns a redirect for password reset, so we show confirmation
      // regardless of response (the email will be sent if account exists)
      const modal = form.closest('[data-modal]');
      const confirmation = modal.querySelector('#password-confirmation');

      if (confirmation) {
        form.hidden = true;
        confirmation.hidden = false;

        // Update modal title
        const modalTitle = modal.querySelector('.modal__title');
        if (modalTitle) {
          modalTitle.textContent = 'Email Sent';
        }
      }
    }

    /*
     * ===========================================================================
     * DISABLED HANDLERS - Email, Name, Phone
     * These require Shopify Admin API backend to function.
     * Re-enable when backend API endpoint is implemented.
     * ===========================================================================
     */

    // Email change handler (DISABLED - requires backend API)
    /*
    async function handleEmailChange(form, container) {
      const formData = new FormData(form);
      const newEmail = formData.get('customer[email]');

      // For demo purposes, we'll show the confirmation
      // In production, you'd save to metafield and send verification email
      const modal = form.closest('[data-modal]');
      const confirmation = modal.querySelector('#email-confirmation');

      if (confirmation) {
        form.hidden = true;
        confirmation.hidden = false;

        // Update modal title
        const modalTitle = modal.querySelector('.modal__title');
        if (modalTitle) {
          modalTitle.textContent = 'Verification Sent';
        }
      }

      // Note: Actual email change requires Shopify Admin API
      // This UI demonstrates the flow
    }
    */

    // Profile update handler (name, phone) - DISABLED - requires backend API
    /*
    async function handleProfileUpdate(form, formType, container) {
      const formData = new FormData(form);

      // Submit to Shopify's account endpoint
      const response = await fetch('/account', {
        method: 'POST',
        body: formData,
      });

      if (response.ok || response.redirected) {
        // Close modal
        const modal = form.closest('[data-modal]');
        if (modal) {
          closeModal(modal);
        }

        // Show success message
        showSettingsAlert('success', getSuccessMessage(formType));

        // Update displayed value without page refresh
        updateDisplayedValue(formType, formData);
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    }

    // Get success message based on form type
    function getSuccessMessage(formType) {
      const messages = {
        name: 'Your name has been updated successfully.',
        phone: 'Your phone number has been updated successfully.',
        email: 'Verification email sent. Please check your inbox.',
        password: 'Password reset email sent. Please check your inbox.',
      };
      return messages[formType] || 'Your changes have been saved.';
    }

    // Update displayed value in the UI
    function updateDisplayedValue(formType, formData) {
      if (formType === 'name') {
        const firstName = formData.get('customer[first_name]') || '';
        const lastName = formData.get('customer[last_name]') || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Not set';

        const nameDisplay = settingsContainer.querySelector('[data-field="name"]');
        if (nameDisplay) {
          nameDisplay.textContent = fullName;
        }
      } else if (formType === 'phone') {
        const phone = formData.get('customer[phone]') || 'Not set';
        const phoneDisplay = settingsContainer.querySelector('[data-field="phone"]');
        if (phoneDisplay) {
          phoneDisplay.textContent = phone;
        }
      }
    }
    End of disabled handlers
    */

    // Loading state
    function setLoadingState(button, isLoading) {
      if (!button) return;

      if (isLoading) {
        button.classList.add('customer-settings__btn--loading');
        button.disabled = true;
      } else {
        button.classList.remove('customer-settings__btn--loading');
        button.disabled = false;
      }
    }

    // Form error display
    function showFormError(container, message) {
      if (!container) return;
      container.textContent = message;
      container.hidden = false;
    }

    function hideFormError(container) {
      if (!container) return;
      container.textContent = '';
      container.hidden = true;
    }

    // Settings alert display
    function showSettingsAlert(type, message) {
      if (!alertsContainer) return;

      alertsContainer.innerHTML = `
        <div class="alert alert--${type}" data-alert role="alert">
          <div class="alert__icon">
            ${
              type === 'success'
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
            }
          </div>
          <div class="alert__content">
            <span class="alert__message">${message}</span>
          </div>
          <button type="button" class="alert__dismiss" data-alert-dismiss aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Initialize dismiss button
      const alert = alertsContainer.querySelector('[data-alert]');
      const dismissBtn = alert?.querySelector('[data-alert-dismiss]');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          alert.remove();
        });
      }

      // Scroll to alert
      alertsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        if (alert && alert.parentNode) {
          alert.remove();
        }
      }, 5000);
    }

    // Check URL params for success messages
    function checkSettingsUrlParams() {
      const params = new URLSearchParams(window.location.search);

      if (params.get('name_updated') === 'true') {
        showSettingsAlert('success', 'Your name has been updated successfully.');
        cleanSettingsUrl();
      } else if (params.get('phone_updated') === 'true') {
        showSettingsAlert('success', 'Your phone number has been updated successfully.');
        cleanSettingsUrl();
      }
    }

    function cleanSettingsUrl() {
      const url = new URL(window.location.href);
      url.searchParams.delete('name_updated');
      url.searchParams.delete('phone_updated');
      window.history.replaceState({}, '', url.pathname);
    }

    // Reset form when modal opens (for email/password modals)
    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);

        if (modal) {
          // Reset form state
          const form = modal.querySelector('form');
          const confirmation = modal.querySelector('.customer-settings__confirmation');

          if (form) {
            form.hidden = false;
            form.reset();

            // Clear errors
            const errorContainer = form.querySelector('.customer-settings__form-error');
            if (errorContainer) {
              errorContainer.hidden = true;
              errorContainer.textContent = '';
            }

            form.querySelectorAll('.input--error').forEach((el) => {
              el.classList.remove('input--error');
            });

            form.querySelectorAll('.input-error').forEach((el) => {
              el.remove();
            });
          }

          if (confirmation) {
            confirmation.hidden = true;
          }

          // Reset modal title
          const modalTitle = modal.querySelector('.modal__title');
          if (modalTitle) {
            const originalTitles = {
              'edit-name-modal': 'Edit Name',
              'edit-email-modal': 'Change Email Address',
              'edit-phone-modal': 'Edit Phone Number',
              'reset-password-modal': 'Reset Password',
            };
            modalTitle.textContent = originalTitles[modalId] || modalTitle.textContent;
          }
        }
      });
    });
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize for Shopify sections
  document.addEventListener('shopify:section:load', init);
})();
