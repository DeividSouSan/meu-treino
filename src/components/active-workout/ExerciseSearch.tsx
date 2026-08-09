import { SuggestionDropdown } from '../ui/SuggestionDropdown';
import { Plus } from 'lucide-react';

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
          <Plus size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>

      <SuggestionDropdown
        suggestions={suggestionItems}
        onSelect={handleSelectSuggestion}
      />
    </section>
  );
}