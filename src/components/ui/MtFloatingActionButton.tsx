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
   * Ícone ou elemento visual exibido no interior do botão.
   */
  children: React.ReactNode;
}

/**
 * MtFloatingActionButton é o botão de ação principal fixado no canto inferior da tela.
 * Utilizado por exemplo para criar um novo treino a partir de qualquer ponto do histórico.
 */
export function MtFloatingActionButton({
  onClick,
  title = 'Novo Treino',
  ariaLabel = 'Criar novo treino',
  children,
}: MtFloatingActionButtonProps) {
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
    </MtButton>
  );
}

