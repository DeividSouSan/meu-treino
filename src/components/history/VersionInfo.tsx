import React from 'react';

export interface VersionInfoProps {
  version: string;
  style?: React.CSSProperties;
}

export function VersionInfo({ version, style }: VersionInfoProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        userSelect: 'none',
        ...style,
      }}
    >
      <span>Meu Treino (PWA)</span>
      <span>v{version}</span>
    </div>
  );
}