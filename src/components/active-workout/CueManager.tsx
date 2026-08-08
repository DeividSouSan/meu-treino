import { InputForm } from '../ui/InputForm';
import { EditableList } from '../ui/EditableList';

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
      <InputForm
        value={cueInput}
        onChange={onCueInputChange}
        onSubmit={handleAddCue}
        placeholder="Ex: Controlar a descida no agachamento"
        submitButtonContent={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }
      />
      <EditableList
        items={cueItems}
        onRemove={handleRemoveCue}
        emptyMessage="Nenhum lembrete adicionado"
      />
    </section>
  );
}