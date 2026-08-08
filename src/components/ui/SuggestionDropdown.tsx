import type { ReactNode } from 'react';

export interface SuggestionItem {
  id: string;
  label: string;
}

export interface SuggestionDropdownProps {
  suggestions: SuggestionItem[];
  onSelect: (suggestion: SuggestionItem) => void;
  renderItem?: (suggestion: SuggestionItem) => ReactNode;
}

export function SuggestionDropdown({
  suggestions,
  onSelect,
  renderItem,
}: SuggestionDropdownProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const defaultRenderItem = (suggestion: SuggestionItem) => (
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