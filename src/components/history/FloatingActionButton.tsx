import React from 'react';

export interface FloatingActionButtonProps {
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function FloatingActionButton({ 
  onClick, 
  title = "Novo Treino",
  ariaLabel = "Criar novo treino",
  children 
}: FloatingActionButtonProps) {
  return (
    <button
      className="primary"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        fontSize: '28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        lineHeight: '1',
        zIndex: 99,
      }}
    >
      {children}
    </button>
  );
}