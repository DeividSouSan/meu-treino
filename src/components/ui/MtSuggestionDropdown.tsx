import type { ReactNode } from 'react';

export interface MtSuggestionItem {
  id: string;
  label: string;
}

export interface MtSuggestionDropdownProps {
  suggestions: MtSuggestionItem[];
  onSelect: (suggestion: MtSuggestionItem) => void;
  renderItem?: (suggestion: MtSuggestionItem) => ReactNode;
}

export function MtSuggestionDropdown({
  suggestions,
  onSelect,
  renderItem,
}: MtSuggestionDropdownProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const defaultRenderItem = (suggestion: MtSuggestionItem) => (
    <div
      key={suggestion.id}
      onClick={() => onSelect(suggestion)}
      style={{
        padding: '10px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.9rem',
      }}
      className="suggestion-item"
    >
      {suggestion.label}
    </div>
  );

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        marginTop: '4px',
        maxHeight: '150px',
        overflowY: 'auto',
        backgroundColor: 'var(--card-background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {suggestions.map((suggestion) => (
        <div key={suggestion.id}>
          {renderItem ? renderItem(suggestion) : defaultRenderItem(suggestion)}
        </div>
      ))}
    </div>
  );
}
