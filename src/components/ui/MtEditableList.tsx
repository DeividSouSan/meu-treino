import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { MtButton } from './MtButton';

export interface MtEditableListItem {
  id: string;
  content: ReactNode;
}

export interface MtEditableListProps {
  /**
   * Lista de itens exibidos na lista editável.
   */
  items: MtEditableListItem[];
  /**
   * Função executada ao clicar no botão de remoção de um item.
   */
  onRemove: (id: string) => void;
  /**
   * Mensagem exibida quando a lista estiver vazia.
   */
  emptyMessage?: string;
  /**
   * Função customizada para renderização de cada item da lista.
   */
  renderItem?: (item: MtEditableListItem, index: number) => ReactNode;
}

/**
 * MtEditableList exibe uma lista de itens com botões de remoção individuais.
 * Utilizado por exemplo para listar os lembretes (cues) da sessão de treino.
 */
export function MtEditableList({
  items,
  onRemove,
  emptyMessage = 'Nenhum item',
  renderItem,
}: MtEditableListProps) {
  if (items.length === 0) {
    return (
      <span
        className="text-secondary"
        style={{
          fontSize: '0.85rem',
          fontStyle: 'italic',
          display: 'block',
          padding: 'var(--spacing-xs) 0',
        }}
      >
        {emptyMessage}
      </span>
    );
  }

  const defaultRenderItem = (item: MtEditableListItem) => (
    <li
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 10px',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--border-radius)',
        fontSize: '0.9rem',
      }}
    >
      <span>{item.content}</span>
      <MtButton
        variant="danger"
        size="small"
        style={{
          padding: '2px 4px',
          border: 'none',
          boxShadow: 'none',
          background: 'none',
          minWidth: 'auto',
          minHeight: 'auto',
        }}
        onClick={() => onRemove(item.id)}
        title="Remover"
      >
        <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </MtButton>
    </li>
  );

  return (
    <ul
      style={{
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: 'var(--spacing-sm)',
      }}
    >
      {items.map((item, index) => (
        <li key={item.id}>{renderItem ? renderItem(item, index) : defaultRenderItem(item)}</li>
      ))}
    </ul>
  );
}
