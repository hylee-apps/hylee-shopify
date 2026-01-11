/**
 * Component JavaScript - Interactive behaviors for UI components
 * Handles: Accordion, Alert, Modal, Tabs
 */

(function() {
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
  // INITIALIZE
  // ===========================================
  function init() {
    initAccordions();
    initAlerts();
    initModals();
    initTabs();
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
