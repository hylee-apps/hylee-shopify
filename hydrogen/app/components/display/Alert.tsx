import React, {forwardRef, useState} from 'react';
import {Icon} from './Icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert type determines the color and icon */
  type?: AlertType;
  /** Alert title */
  title?: string;
  /** Alert dismissible */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Show type icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const typeStyles: Record<
  AlertType,
  {bg: string; border: string; text: string; icon: string}
> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
  },
};

const typeIcons: Record<AlertType, React.ReactNode> = {
  info: <Icon name="info" size={20} />,
  success: <Icon name="check-circle" size={20} />,
  warning: <Icon name="alert-triangle" size={20} />,
  error: <Icon name="x-circle" size={20} />,
};

/**
 * Alert component - migrated from theme/snippets/alert.liquid
 *
 * Displays important messages to users with contextual styling.
 *
 * @example
 * <Alert type="success" title="Success!">
 *   Your changes have been saved.
 * </Alert>
 *
 * @example
 * <Alert type="error" dismissible onDismiss={() => console.log('dismissed')}>
 *   An error occurred. Please try again.
 * </Alert>
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = 'info',
      title,
      dismissible = false,
      onDismiss,
      showIcon = true,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) {
      return null;
    }

    const styles = typeStyles[type];

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    const alertClasses = [
      'flex gap-3 p-4 rounded-xl border',
      styles.bg,
      styles.border,
      styles.text,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={alertClasses} role="alert" {...rest}>
        {showIcon && (
          <div className={`shrink-0 ${styles.icon}`}>{typeIcons[type]}</div>
        )}

        <div className="flex-1 min-w-0">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${styles.text}`}
            aria-label="Dismiss"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';

export default Alert;
