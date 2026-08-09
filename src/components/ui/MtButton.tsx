import type { ReactNode, CSSProperties } from 'react';

export type MtButtonVariant = 'default' | 'primary' | 'danger';
export type MtButtonSize = 'small' | 'medium';

export interface MtButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: MtButtonVariant;
  size?: MtButtonSize;
  style?: CSSProperties;
  title?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function MtButton({
  children,
  onClick,
  variant = 'default',
  size = 'medium',
  style,
  title,
  disabled = false,
  type = 'button',
}: MtButtonProps) {
  const variantClass = variant === 'default' ? '' : ` ${variant}`;
  const sizeClass = size === 'small' ? ' small' : '';

  return (
    <button
      type={type}
      className={`${variantClass}${sizeClass}`.trim()}
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        ...style,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}