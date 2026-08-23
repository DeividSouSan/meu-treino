import type { CSSProperties, ReactNode } from 'react';
import { MtButton } from './MtButton';

export type MtEmptyStateSize = 'small' | 'large';
export type MtEmptyStateAlign = 'center' | 'left';

export interface MtEmptyStateProps {
  icon?: ReactNode;
  title: string;
  titleStyle?: CSSProperties;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: MtEmptyStateSize;
  align?: MtEmptyStateAlign;
  style?: CSSProperties;
}

export function MtEmptyState({
  icon,
  title,
  titleStyle,
  description,
  actionLabel,
  onAction,
  size = 'large',
  align = 'center',
  style,
}: MtEmptyStateProps) {
  // Estado vazio compacto, usado inline dentro de seções (ex: lista de séries).
  if (size === 'small') {
    if (!description && !actionLabel) {
      return (
        <p
          className="text-secondary"
          style={{ fontSize: '0.85rem', fontStyle: 'italic', ...style }}
        >
          {title}
        </p>
      );
    }

    return (
      <div style={style}>
        <p
          className="text-secondary"
          style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-secondary"
            style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: 'var(--spacing-xs) 0 0' }}
          >
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <MtButton variant="primary" onClick={onAction} style={{ marginTop: 'var(--spacing-sm)' }}>
            {actionLabel}
          </MtButton>
        )}
      </div>
    );
  }

  const isCentered = align === 'center';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCentered ? 'center' : 'flex-start',
        gap: 'var(--spacing-md)',
        textAlign: isCentered ? 'center' : 'left',
        padding: isCentered ? 'var(--spacing-lg) 0' : 0,
        ...style,
      }}
    >
      {icon && <div style={{ opacity: 0.5 }}>{icon}</div>}
      <p
        className="text-secondary"
        style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          margin: 0,
          ...titleStyle,
        }}
      >
        {title}
      </p>
      {description && (
        <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <MtButton variant="primary" onClick={onAction}>
          {actionLabel}
        </MtButton>
      )}
    </div>
  );
}
