import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ExerciseSet, AdvancedTechnique } from '../types/workout';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { ExerciseTechniquePills } from './ExerciseTechniquePills';
import { MtButton, MtConfirmDialog, MtStepper } from './ui';
import { hapticService } from '../services/hapticService';

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
export function ExerciseSetItem({ set, index, onDelete, onUpdate, style }: ExerciseSetItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [localReps, setLocalReps] = useState(set.repetitions);
  const [localWeight, setLocalWeight] = useState(set.weightInKg);
  const [localRest, setLocalRest] = useState(set.restTimeInSeconds);
  const [localTechniques, setLocalTechniques] = useState<AdvancedTechnique[]>([
    ...(set.advancedTechniques || []),
  ]);

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
    hapticService.success();
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

  const handleConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
    onDelete(index);
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
            minHeight: '44px',
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Linha principal com alto contraste operacional */}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '1rem',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>{set.repetitions} reps</strong> @{' '}
                {set.weightInKg}kg
                {set.restTimeInSeconds > 0 && (
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                    - {set.restTimeInSeconds}s
                  </span>
                )}
              </span>

              {/* Técnicas avançadas jogadas abaixo da linha principal */}
              {techniques.length > 0 && (
                <span
                  style={{
                    marginTop: '2px',
                    fontSize: '0.75rem',
                    color: 'var(--accent-color)',
                    fontWeight: 600,
                  }}
                >
                  {techniques.join(', ')}
                </span>
              )}
            </div>
          </span>

          <div>
            <MtButton
              variant="text"
              size="small"
              style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
              onClick={(event) => {
                event.stopPropagation();
                hapticService.lightTap();
                setIsEditing(true);
              }}
              title="Editar série"
              aria-label={`Editar série #${index + 1}`}
            >
              <Edit2 size={16} strokeWidth={2.25} />
            </MtButton>
          </div>
        </div>
      </li>
    );
  }

  // Tela de edição inline com Steppers e botões de toque generosos
  return (
    <li
      style={{
        fontSize: '0.9rem',
        backgroundColor: 'var(--background-color)',
        padding: 'var(--spacing-sm)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.95rem' }}>Série #{index + 1}</strong>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <MtButton
              variant="danger"
              size="small"
              style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
              onClick={() => setIsConfirmDeleteOpen(true)}
              title="Excluir série"
              aria-label={`Excluir série #${index + 1}`}
            >
              <Trash2 size={16} strokeWidth={2.25} />
            </MtButton>
            <MtButton
              variant="primary"
              size="small"
              style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
              onClick={handleSave}
              title="Salvar edição"
              aria-label="Salvar alterações da série"
            >
              <Save size={16} strokeWidth={2.25} />
            </MtButton>
            <MtButton
              size="small"
              style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
              onClick={handleCancel}
              title="Cancelar"
              aria-label="Cancelar edição da série"
            >
              <X size={16} strokeWidth={2.25} />
            </MtButton>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-xs)',
          }}
        >
          <MtStepper
            label="Reps"
            value={String(localReps)}
            onChange={(val) => setLocalReps(parseInt(val, 10) || 0)}
            step={1}
            min={1}
          />
          <MtStepper
            label="Carga"
            unit="kg"
            value={String(localWeight)}
            onChange={(val) => setLocalWeight(parseFloat(val) || 0)}
            step={1}
            min={0}
          />
        </div>

        <MtStepper
          label="Descanso"
          unit="s"
          value={String(localRest)}
          onChange={(val) => setLocalRest(parseInt(val, 10) || 0)}
          step={15}
          min={0}
        />

        <ExerciseTechniquePills
          label="Técnicas"
          selectedTechniques={localTechniques}
          onToggle={toggleTechnique}
        />
      </div>

      <MtConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Excluir Série"
        message={`Tem certeza que deseja apagar a série #${index + 1}? Esta ação não pode ser desfeita.`}
        confirmVariant="danger"
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </li>
  );
}
