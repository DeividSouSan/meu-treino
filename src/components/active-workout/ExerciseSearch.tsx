import { useState, useEffect } from 'react';
import { MtInput, MtButton, MtSuggestionDropdown, MtCard, MtSectionTitle } from '../ui';
import { Plus, Search } from 'lucide-react';

export interface ExerciseSuggestion {
  id: string;
  name: string;
}

export interface ExerciseSearchProps {
  onAddExercise: (name: string) => void;
  getSuggestions: (query: string) => ExerciseSuggestion[];
}

export function ExerciseSearch({
  onAddExercise,
  getSuggestions,
}: ExerciseSearchProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);

  useEffect(() => {
    if (searchInput.trim() === '') {
      setSuggestions([]);
    } else {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput, getSuggestions]);

  const handleSelectSuggestion = (suggestion: { id: string; label: string }) => {
    onAddExercise(suggestion.id);
    setSearchInput('');
  };

  const suggestionItems = suggestions.map((suggestion) => ({
    id: suggestion.name,
    label: suggestion.name,
  }));

  const handleAddExercise = () => {
    onAddExercise(searchInput);
    setSearchInput('');
  };

  return (
    <MtCard as="section" style={{ marginTop: 'var(--spacing-md)' }}>
      <MtSectionTitle icon={<Search size={16} />}>
        Adicionar Exercício
      </MtSectionTitle>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)', position: 'relative' }}>
        <MtInput
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar ou digitar nome do exercício..."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAddExercise();
            }
          }}
        />
        <MtButton
          size="small"
          onClick={handleAddExercise}
          style={{
            width: '42px',
            borderColor: 'var(--accent-color)',
            color: 'var(--accent-color)',
          }}
        >
          <Plus size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
      </div>

      <MtSuggestionDropdown
        suggestions={suggestionItems}
        onSelect={handleSelectSuggestion}
      />
    </MtCard>
  );
}
