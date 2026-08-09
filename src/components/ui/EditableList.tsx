import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface EditableListItem {
  id: string;
  content: ReactNode;
}

export interface EditableListProps {
  items: EditableListItem[];
  onRemove: (id: string) => void;
  emptyMessage?: string;
  renderItem?: (item: EditableListItem, index: number) => ReactNode;
}

export function EditableList({
  items,
  onRemove,
  emptyMessage = 'Nenhum item',
  renderItem,
}: EditableListProps) {
  if (items.length === 0) {
    return (
      <p className="text-secondary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
        {emptyMessage}
      </p>
    );
  }

  const defaultRenderItem = (item: EditableListItem) => (
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
      <button
        className="text text-danger"
        style={{
          padding: '0 4px',
          fontSize: '0.8rem',
          border: 'none',
          boxShadow: 'none',
          background: 'none',
        }}
        onClick={() => onRemove(item.id)}
        title="Remover"
      >
        <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </button>
    </li>
  );

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'var(--spacing-sm)' }}>
      {items.map((item, index) => (
        <li key={item.id}>
          {renderItem ? renderItem(item, index) : defaultRenderItem(item)}
        </li>
      ))}
    </ul>
  );
}