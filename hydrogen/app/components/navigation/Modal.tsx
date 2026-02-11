import React, {useEffect, useCallback, useRef, useId} from 'react';
import {createPortal} from 'react-dom';
import {Icon} from '../display/Icon';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: ModalSize;
  /** Show close button */
  closable?: boolean;
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Modal footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Modal body content */
  children: React.ReactNode;
}

const sizeStyles: Record<ModalSize, string> = {
  small: 'max-w-sm',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)]',
};

/**
 * Modal component - migrated from theme/snippets/modal.liquid
 *
 * A dialog overlay for focused interactions.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'medium',
  closable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  className,
  children,
}: ModalProps) {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose],
  );

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  // Focus trap
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  if (!open) return null;

  const modalClasses = [
    'modal-container w-full mx-auto bg-white rounded-xl shadow-xl',
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <div
      className="fixed inset-0 z-[var(--z-modal,1050)] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        className={`${modalClasses} relative z-10 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {closable && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto"
                aria-label="Close modal"
              >
                <Icon name="x" size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to document body
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

export default Modal;
