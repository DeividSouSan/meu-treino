import React from 'react';

export interface MtCardProps {
  /**
   * Elementos visuais ou componentes filhos renderizados dentro do card.
   */
  children: React.ReactNode;
  /**
   * Tag HTML semântica utilizada como container do card. O padrão é 'div'.
   */
  as?: 'div' | 'section' | 'article';
  /**
   * Estilos CSS customizados adicionais para o container do card.
   */
  style?: React.CSSProperties;
  /**
   * Classes CSS adicionais para complementação de estilo.
   */
  className?: string;
  /**
   * Função executada ao clicar no card, quando interativo.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * Papel de acessibilidade do elemento (ex: "button" quando clicável).
   */
  role?: string;
}

/**
 * MtCard é o componente base de superfície do Design System.
 * Encapsula o padrão visual de container com borda, cantos arredondados e fundo sólido.
 */
export function MtCard({
  children,
  as: Component = 'div',
  style,
  className = '',
  onClick,
  role,
}: MtCardProps) {
  const combinedClassName = `card ${className}`.trim();

  return (
    <Component
      className={combinedClassName}
      style={style}
      onClick={onClick}
      role={role}
    >
      {children}
    </Component>
  );
}
