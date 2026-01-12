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
    document.querySelectorAll('[data-accordion]').forEach(accordion => {
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
    document.querySelectorAll('[data-alert]').forEach(alert => {
      const dismissBtn = alert.querySelector('[data-alert-dismiss]');

      if (!dismissBtn) return;

      dismissBtn.addEventListener('click', () => {
        alert.setAttribute('data-dismissing', '');
        alert.addEventListener('animationend', () => {
          alert.remove();
        }, { once: true });
      });
    });
  }

  // ===========================================
  // MODAL
  // ===========================================
  function initModals() {
    // Open modal triggers
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) openModal(modal);
      });
    });

    // Close buttons
    document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('[data-modal]');
        if (modal) closeModal(modal);
      });
    });

    // Backdrop clicks
    document.querySelectorAll('[data-modal-backdrop]').forEach(backdrop => {
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
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    // Trap focus
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal(modal) {
    modal.setAttribute('data-closing', '');

    modal.addEventListener('animationend', () => {
      modal.hidden = true;
      modal.removeAttribute('data-closing');
      document.body.classList.remove('modal-open');
    }, { once: true });

    modal.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const modal = e.currentTarget;
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
      const triggers = tabGroup.querySelectorAll('[data-tab-trigger]');
      const panels = tabGroup.querySelectorAll('[data-tab-panel]');

      triggers.forEach(trigger => {
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
    const tabNav = document.querySelector('[data-orders-tab]')?.closest('.orders-tab__nav');
    if (!tabNav) return;

    const tabs = document.querySelectorAll('[data-orders-tab]');
    const panels = document.querySelectorAll('[data-orders-panel]');
    const searchInput = document.querySelector('[data-orders-search]');
    const searchBtn = document.querySelector('[data-orders-search-btn]');
    const timeFilter = document.querySelector('[data-orders-time-filter]');
    const orderCountEl = document.querySelector('[data-orders-count]');

    // Tab switching
    tabs.forEach(tab => {
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

    // Search functionality
    function performSearch() {
      const searchTerm = searchInput?.value.toLowerCase().trim() || '';
      const orderCards = document.querySelectorAll('[data-orders-panel="all"] [data-order-card]');
      let visibleCount = 0;

      orderCards.forEach(card => {
        const orderNumber = (card.getAttribute('data-order-number') || '').toLowerCase();
        const products = (card.getAttribute('data-order-products') || '').toLowerCase();

        const matches = searchTerm === '' ||
          orderNumber.includes(searchTerm) ||
          products.includes(searchTerm);

        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      // Update count display
      if (orderCountEl) {
        orderCountEl.textContent = `${ visibleCount } order${ visibleCount !== 1 ? 's' : '' }`;
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
      const cutoffMs = days === 'all' ? 0 : now - (parseInt(days) * 24 * 60 * 60 * 1000);
      let visibleCount = 0;

      orderCards.forEach(card => {
        const orderDate = parseInt(card.getAttribute('data-order-date') || '0') * 1000;
        const isVisible = days === 'all' || orderDate >= cutoffMs;

        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });

      // Update count display
      if (orderCountEl) {
        orderCountEl.textContent = `${ visibleCount } order${ visibleCount !== 1 ? 's' : '' }`;
      }
    }
  }

  function switchOrdersTab(tabId, tabs, panels) {
    // Update tab buttons
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-orders-tab') === tabId;
      tab.classList.toggle('orders-tab__nav-item--active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Update panels
    panels.forEach(panel => {
      const isActive = panel.getAttribute('data-orders-panel') === tabId;
      panel.classList.toggle('orders-tab__panel--active', isActive);
      panel.hidden = !isActive;
    });
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
        if (!e.target.closest('[data-header-search-overlay]') && !e.target.closest('[data-header-search-toggle]')) {
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
  // INITIALIZE
  // ===========================================
  function init() {
    initAccordions();
    initAlerts();
    initModals();
    initTabs();
    initOrdersTab();
    initHeaderInner();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize for Shopify sections
  document.addEventListener('shopify:section:load', init);
})();
