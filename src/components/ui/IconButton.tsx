import type { ReactNode } from 'react';

export interface IconButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

export function IconButton({
  children,
  onClick,
  className = '',
  style,
  title,
  disabled = false,
  variant = 'default',
}: IconButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {},
    primary: {
      borderColor: 'var(--accent-color)',
      color: 'var(--accent-color)',
    },
    danger: {
      borderColor: 'var(--danger-color)',
      color: 'var(--danger-color)',
    },
  };

  return (
    <button
      type="button"
      className={`small ${className}`.trim()}
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        ...style,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}