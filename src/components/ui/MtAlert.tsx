import React from 'react';

export type MtAlertVariant = 'warning' | 'danger' | 'success' | 'info';

export interface MtAlertProps {
  variant?: MtAlertVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<MtAlertVariant, { bg: string; color: string }> = {
  warning: { bg: 'var(--warning-light)', color: 'var(--warning-color)' },
  danger: { bg: 'var(--danger-light)', color: 'var(--danger-color)' },
  success: { bg: 'var(--success-light)', color: 'var(--success-color)' },
  info: { bg: 'var(--accent-light)', color: 'var(--accent-color)' },
};

export function MtAlert({ variant = 'info', icon, children, style }: MtAlertProps) {
  const colors = variantStyles[variant];

  const defaultIcon = (() => {
    switch (variant) {
      case 'warning':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'danger':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'success':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  })();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 10px',
        backgroundColor: colors.bg,
        borderRadius: 'var(--border-radius)',
        fontSize: '0.8rem',
        color: colors.color,
        fontWeight: 600,
        ...style,
      }}
    >
      {icon ?? defaultIcon}
      {children}
    </div>
  );
}