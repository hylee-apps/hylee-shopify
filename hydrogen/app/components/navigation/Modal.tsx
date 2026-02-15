import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {Icon} from '../display/Icon';
import {cn} from '~/lib/utils';

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
 * Modal component — powered by Radix Dialog for accessible focus trapping,
 * keyboard handling, and portal rendering.
 *
 * Keeps the same external API as the original Liquid migration.
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
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop / Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-modal-backdrop,1040)] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[var(--z-modal,1050)] w-full -translate-x-1/2 -translate-y-1/2 p-4',
            'outline-none',
          )}
          onPointerDownOutside={(e) => {
            if (!closeOnBackdropClick) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!closeOnEscape) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (!closeOnBackdropClick) e.preventDefault();
          }}
        >
          <div
            className={cn(
              'modal-container mx-auto w-full bg-white rounded-xl shadow-xl',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'duration-200',
              sizeStyles[size],
              className,
            )}
          >
            {/* Header */}
            {(title || closable) && (
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                {title ? (
                  <DialogPrimitive.Title className="text-lg font-semibold text-slate-900">
                    {title}
                  </DialogPrimitive.Title>
                ) : (
                  <VisuallyHidden asChild>
                    <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
                  </VisuallyHidden>
                )}
                {closable && (
                  <DialogPrimitive.Close
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                    aria-label="Close modal"
                  >
                    <Icon name="x" size={20} />
                  </DialogPrimitive.Close>
                )}
              </div>
            )}

            {/* Provide a hidden description if none supplied to satisfy Radix */}
            {!title && (
              <VisuallyHidden asChild>
                <DialogPrimitive.Description>
                  Dialog content
                </DialogPrimitive.Description>
              </VisuallyHidden>
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default Modal;
