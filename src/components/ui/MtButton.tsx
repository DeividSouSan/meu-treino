import type { ReactNode, CSSProperties, MouseEvent } from 'react';

export type MtButtonVariant = 'default' | 'primary' | 'danger' | 'text';
export type MtButtonSize = 'small' | 'medium' | 'large';

export interface MtButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: MtButtonVariant;
  size?: MtButtonSize;
  style?: CSSProperties;
  title?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  autoFocus?: boolean;
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
  'aria-label': ariaLabel,
  autoFocus = false,
}: MtButtonProps) {
  const variantClass = variant === 'default' ? '' : ` ${variant}`;
  const sizeClass = size === 'small' ? ' small' : size === 'large' ? ' large' : '';

  return (
    <button
      type={type}
      autoFocus={autoFocus}
      className={`${variantClass}${sizeClass}`.trim()}

      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
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