import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ExerciseSet, AdvancedTechnique } from '../types/workout';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { ExerciseTechniquePills } from './ExerciseTechniquePills';
import { MtField } from './ui';

export interface ExerciseSetItemProps {
  set: ExerciseSet;
  index: number;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updatedSet: ExerciseSet) => void;
  style?: CSSProperties;
}

/**
 * ExerciseSetItem é autocontido: gerencia seu próprio estado de edição.
 * Recebe apenas o set atual (estado da entidade) e callbacks para ações externas.
 *
 * O item NÃO é expansível por toque. A interação de clique abre o modo de edição.
 * Na tela de visualização normal, as técnicas avançadas são mostradas como texto simples.
 */
export function ExerciseSetItem({
  set,
  index,
  onDelete,
  onUpdate,
  style,
}: ExerciseSetItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localReps, setLocalReps] = useState(set.repetitions);
  const [localWeight, setLocalWeight] = useState(set.weightInKg);
  const [localRest, setLocalRest] = useState(set.restTimeInSeconds);
  const [localTechniques, setLocalTechniques] = useState<AdvancedTechnique[]>([...(set.advancedTechniques || [])]);

  const toggleTechnique = (tech: AdvancedTechnique) => {
    const idx = localTechniques.indexOf(tech);
    if (idx >= 0) {
      setLocalTechniques(localTechniques.filter((t) => t !== tech));
    } else {
      setLocalTechniques([...localTechniques, tech]);
    }
  };

  const handleSave = () => {
    const updatedSet: ExerciseSet = {
      ...set,
      repetitions: localReps,
      weightInKg: localWeight,
      restTimeInSeconds: localRest,
      advancedTechniques: localTechniques,
    };
    onUpdate(index, updatedSet);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Restaura valores originais antes de sair do modo de edição
    setLocalReps(set.repetitions);
    setLocalWeight(set.weightInKg);
    setLocalRest(set.restTimeInSeconds);
    setLocalTechniques([...(set.advancedTechniques || [])]);
    setIsEditing(false);
  };

  const handleDelete = () => {
    // O usuário precisa confirmar antes de apagar a série
    const confirmou = window.confirm(
      `Tem certeza que deseja apagar a série #${index + 1}? Esta ação não pode ser desfeita.`
    );
    if (confirmou) {
      onDelete(index);
    }
  };

  // Técnicas avançadas realmente selecionadas neste set (dados reais do estado da entidade)
  const techniques = set.advancedTechniques || [];

  // Tela de visualização normal (read-only)
  if (!isEditing) {
    return (
      <li style={{ fontSize: '0.95rem', ...style }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Linha principal: "5 reps @ 10kg - 120" nunca deve quebrar a linha */}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <strong>{set.repetitions} reps</strong> @ {set.weightInKg}kg
                {set.restTimeInSeconds > 0 && ` - ${set.restTimeInSeconds}s`}
              </span>

              {/* Técnicas avançadas jogadas abaixo da linha principal (texto simples) */}
              {techniques.length > 0 && (
                <span
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {techniques.join(', ')}
                </span>
              )}
            </div>
          </span>

          <div>
            <button
              className="text"
              style={{ padding: '2px 6px' }}
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
              }}
              title="Editar série"
            >
              <Edit2 size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
          </div>
        </div>
      </li>
    );
  }

  // Tela de edição inline
  return (
    <li style={{ fontSize: '0.9rem', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Série #{index + 1}</strong>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            {/* O botão de apagar foi movido para dentro da edição para economizar espaço na linha principal */}
            <button
              className="text text-danger small"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={handleDelete}
              title="Excluir série"
            >
              <Trash2 size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
            <button
              className="small"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={handleSave}
              title="Salvar edição"
            >
              <Save size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
            <button
              className="small"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={handleCancel}
              title="Cancelar"
            >
              <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
          </div>
        </div>

        {/* Campos Reps, Carga e Descanso na mesma linha (semelhante ao formulário de ExerciseScreen) */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-xs)',
            alignItems: 'flex-end',
          }}
        >
          <MtField
            label="Reps"
            labelStyle={{ fontSize: '0.75rem' }}
            value={String(localReps)}
            onChange={(event) => setLocalReps(Number(event.target.value))}
            type="number"
            placeholder="Reps"
            style={{ flex: 1 }}
          />
          <MtField
            label="Carga"
            labelStyle={{ fontSize: '0.75rem' }}
            value={String(localWeight)}
            onChange={(event) => setLocalWeight(Number(event.target.value))}
            type="number"
            step="any"
            placeholder="kg"
            style={{ flex: 1 }}
          />
          <MtField
            label="Descanso"
            labelStyle={{ fontSize: '0.75rem' }}
            value={String(localRest)}
            onChange={(event) => setLocalRest(Number(event.target.value))}
            type="number"
            placeholder="s"
            style={{ flex: 1 }}
          />
        </div>

        <ExerciseTechniquePills
          label="Técnicas"
          selectedTechniques={localTechniques}
          onToggle={toggleTechnique}
        />
      </div>
    </li>
  );
}
