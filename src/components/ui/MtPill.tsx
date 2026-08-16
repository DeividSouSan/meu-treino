import React from 'react';

export interface MtPillProps {
  /**
   * Texto ou conteúdo exibido dentro da pílula (ex: "FS", "RP", "DS", "ISO").
   */
  children: React.ReactNode;
  /**
   * Indica se a pílula está ativada ou selecionada.
   */
  isActive?: boolean;
  /**
   * Ação executada ao tocar ou clicar na pílula.
   */
  onClick?: () => void;
  /**
   * Estilo visual CSS personalizado.
   */
  style?: React.CSSProperties;
  /**
   * Texto descritivo de acessibilidade ou tooltip exibido ao passar o mouse.
   */
  title?: string;
}

/**
 * MtPill é o componente do Design System para tags e botões de filtro em formato de pílula.
 * Representa itens selecionáveis como técnicas avançadas de treino.
 */
export function MtPill({
  children,
  isActive = false,
  onClick,
  style,
  title,
}: MtPillProps) {
  const activeClass = isActive ? 'active' : '';
  const combinedClassName = `pill ${activeClass}`.trim();

  return (
    <span
      className={combinedClassName}
      onClick={onClick}
      style={style}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
}
