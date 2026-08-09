import { MtInputForm, EditableList } from '../ui';
import { Plus } from 'lucide-react';

export interface CueManagerProps {
  cues: string[];
  cueInput: string;
  onCueInputChange: (value: string) => void;
  onAddCue: (cue: string) => void;
  onRemoveCue: (cueIndex: number) => void;
}

export function CueManager({
  cues,
  cueInput,
  onCueInputChange,
  onAddCue,
  onRemoveCue,
}: CueManagerProps) {
  const handleAddCue = (value: string) => {
    onAddCue(value);
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
    <section className="card">
      <h2>Cues da Sessão (Lembretes)</h2>
      <MtInputForm
        value={cueInput}
        onChange={(event) => onCueInputChange(event.target.value)}
        onSubmit={handleAddCue}
        placeholder="Ex: Controlar a descida no agachamento"
        submitButtonContent={<Plus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
      />
      <EditableList
        items={cueItems}
        onRemove={handleRemoveCue}
        emptyMessage="Nenhum lembrete adicionado"
      />
    </section>
  );
}