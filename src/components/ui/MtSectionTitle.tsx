import React from 'react';

export interface MtSectionTitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function MtSectionTitle({ icon, children, style }: MtSectionTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        ...style,
      }}
    >
      {icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {children}
      </span>
    </div>
  );
}