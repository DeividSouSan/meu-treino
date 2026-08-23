import { useState } from 'react';
import { MtInputForm, MtEditableList, MtCard, MtSectionTitle } from '../ui';
import { Plus, Bell } from 'lucide-react';

export interface CueManagerProps {
  cues: string[];
  onAddCue: (cue: string) => void;
  onRemoveCue: (cueIndex: number) => void;
}

export function CueManager({ cues, onAddCue, onRemoveCue }: CueManagerProps) {
  const [cueInput, setCueInput] = useState<string>('');

  const handleAddCue = (value: string) => {
    onAddCue(value);
    setCueInput('');
  };

  const cueItems = cues.map((cue, index) => ({
    id: `cue-${index}`,
    content: cue,
  }));

  const handleRemoveCue = (id: string) => {
    const index = parseInt(id.replace('cue-', ''), 10);
    onRemoveCue(index);
  };

  return (
    <MtCard as="section" style={{ gap: 'var(--spacing-xs)' }}>
      <MtSectionTitle icon={<Bell size={16} />}>Cues da Sessão (Lembretes)</MtSectionTitle>
      <MtInputForm
        value={cueInput}
        onChange={(event) => setCueInput(event.target.value)}
        onSubmit={handleAddCue}
        placeholder="Ex: Controlar a descida no agachamento"
        submitButtonContent={
          <Plus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        }
      />
      <MtEditableList
        items={cueItems}
        onRemove={handleRemoveCue}
        emptyMessage="Nenhum lembrete adicionado"
      />
    </MtCard>
  );
}
