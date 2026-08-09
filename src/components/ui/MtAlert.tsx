import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';

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

const defaultIcon = (variant: MtAlertVariant) => {
  const size = 14;
  const strokeWidth = 2.5;
  switch (variant) {
    case 'warning':
      return <AlertTriangle size={size} strokeWidth={strokeWidth} />;
    case 'danger':
      return <XCircle size={size} strokeWidth={strokeWidth} />;
    case 'success':
      return <CheckCircle size={size} strokeWidth={strokeWidth} />;
    case 'info':
    default:
      return <Info size={size} strokeWidth={strokeWidth} />;
  }
};
export function MtAlert({ variant = 'info', icon, children, style }: MtAlertProps) {
  const colors = variantStyles[variant];

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
      {icon ?? defaultIcon(variant)}
      {children}
    </div>
  );
}
