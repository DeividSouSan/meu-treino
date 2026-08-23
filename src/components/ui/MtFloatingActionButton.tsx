import React from 'react';
import { MtButton } from './MtButton';

export interface MtFloatingActionButtonProps {
  /**
   * Função executada ao clicar no botão de ação flutuante.
   */
  onClick: () => void;
  /**
   * Título ou tooltip acessível exibido ao passar o mouse.
   */
  title?: string;
  /**
   * Rótulo descritivo para leitores de tela e acessibilidade.
   */
  ariaLabel?: string;
  /**
   * Texto opcional exibido no botão (Extended FAB).
   */
  label?: string;
  /**
   * Ícone opcional exibido antes do texto.
   */
  icon?: React.ReactNode;
  /**
   * Estilos customizados opcionais.
   */
  style?: React.CSSProperties;
  /**
   * Ícone, texto ou elemento visual exibido no interior do botão.
   */
  children?: React.ReactNode;
}

/**
 * MtFloatingActionButton é o botão de ação principal fixado no canto inferior da tela.
 * Suporta modo circular (ícone puro) ou estendido (ícone + texto).
 */
export function MtFloatingActionButton({
  onClick,
  title = 'Novo Treino',
  ariaLabel = 'Criar novo treino',
  label,
  icon,
  style,
  children,
}: MtFloatingActionButtonProps) {
  const isExtended = Boolean(label || (typeof children === 'string' && children.length > 2));

  return (
    <MtButton
      variant="primary"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        height: '56px',
        minWidth: '56px',
        width: isExtended ? 'auto' : '56px',
        padding: isExtended ? '0 20px' : '0',
        borderRadius: isExtended ? '28px' : '50%',
        fontSize: isExtended ? '1rem' : '28px',
        fontWeight: 600,
        gap: isExtended ? '8px' : '0',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        lineHeight: '1',
        zIndex: 99,
        ...style,
      }}
    >
      {icon}
      {label}
      {children}
    </MtButton>
  );
}
