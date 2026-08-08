import { SuggestionDropdown } from '../ui/SuggestionDropdown';

export interface ExerciseSuggestion {
  id: string;
  name: string;
}

export interface ExerciseSearchProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onAddExercise: (name: string) => void;
  suggestions: ExerciseSuggestion[];
}

export function ExerciseSearch({
  searchInput,
  onSearchInputChange,
  onAddExercise,
  suggestions,
}: ExerciseSearchProps) {
  const handleSelectSuggestion = (suggestion: { id: string; label: string }) => {
    onAddExercise(suggestion.id);
  };

  const suggestionItems = suggestions.map((suggestion) => ({
    id: suggestion.name,
    label: suggestion.name,
  }));

  return (
    <section className="card" style={{ marginTop: 'var(--spacing-md)' }}>
      <h2>Adicionar Exercício</h2>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)', position: 'relative' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Buscar ou digitar nome do exercício..."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onAddExercise(searchInput);
            }
          }}
        />
        <button
          className="small"
          onClick={() => onAddExercise(searchInput)}
          style={{
            width: '42px',
            borderColor: 'var(--accent-color)',
            color: 'var(--accent-color)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <SuggestionDropdown
        suggestions={suggestionItems}
        onSelect={handleSelectSuggestion}
      />
    </section>
  );
}