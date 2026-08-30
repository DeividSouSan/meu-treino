import { useState, type FormEvent } from 'react';
import type { WorkoutExercise } from '../types/workout';
import { useExerciseScreen } from './useExerciseScreen';
import { RestTimer } from './RestTimer';
import {
  MtButton,
  MtEmptyState,
  MtField,
  MtCard,
  MtConfirmDialog,
  MtStepper,
  MtAlertDialog,
  MtTextArea,
  MtPill,
} from './ui';
import { ExerciseSetItem } from './ExerciseSetItem';

import { ExerciseTechniquePills } from './ExerciseTechniquePills';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Copy, Plus } from 'lucide-react';
import { LastWorkoutSets } from './LastWorkoutSets';

export interface ExerciseNavigationProps {
  onBack: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ExerciseScreenProps {
  exercise: WorkoutExercise;
  onUpdateExercise: (updatedExercise: WorkoutExercise) => void;
  onDeleteExercise: () => void;
  exerciseNavigation: ExerciseNavigationProps;
}

export function ExerciseScreen({
  exercise,
  onUpdateExercise,
  onDeleteExercise,
  exerciseNavigation,
}: ExerciseScreenProps) {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const form = useExerciseScreen({ initialExercise: exercise, onUpdateExercise });

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    form.handleAddSet();
  };

  return (
    <MtCard style={{ padding: 'var(--spacing-md)' }}>
      {/* Barra superior de navegação com hit targets generosos */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <MtButton
          size="small"
          onClick={exerciseNavigation.onBack}
          title="Voltar para lista"
          aria-label="Voltar para a lista de exercícios"
          style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
        >
          <ArrowLeft size={18} strokeWidth={2.25} />
        </MtButton>

        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <MtButton
            size="small"
            onClick={exerciseNavigation.onNavigatePrevious}
            disabled={!exerciseNavigation.hasPrevious}
            title="Exercício anterior"
            aria-label="Ir para exercício anterior"
            style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
          >
            <ChevronLeft size={20} strokeWidth={2.25} />
          </MtButton>
          <MtButton
            size="small"
            onClick={exerciseNavigation.onNavigateNext}
            disabled={!exerciseNavigation.hasNext}
            title="Próximo exercício"
            aria-label="Ir para próximo exercício"
            style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
          >
            <ChevronRight size={20} strokeWidth={2.25} />
          </MtButton>
        </div>

        <MtButton
          variant="danger"
          size="small"
          onClick={() => setIsConfirmDeleteOpen(true)}
          title="Excluir exercício"
          aria-label="Excluir exercício atual"
          style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
        >
          <Trash2 size={18} strokeWidth={2.25} />
        </MtButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <MtField
          label="Nome do Exercício"
          value={form.exercise.name}
          onChange={form.handleUpdateName}
          placeholder="Ex: Supino Reto"
        />

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <MtTextArea
            label="Notas"
            value={form.exercise.notes || ''}
            onChangeValue={form.handleUpdateNotesValue}
            placeholder="Ex: Peso por lado com halteres; barra olímpica; polia..."
            style={{ flex: 1 }}
          />
        </div>

        {/* Seleção de Equipamento com MtPill */}
        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)', display: 'block', fontWeight: 700 }}>
            Equipamento
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            <MtPill
              isActive={form.exercise.equipmentType === 'barbell'}
              onClick={() => form.handleUpdateEquipmentType('barbell')}
            >
              Barra
            </MtPill>
            <MtPill
              isActive={form.exercise.equipmentType === 'dumbbell'}
              onClick={() => form.handleUpdateEquipmentType('dumbbell')}
            >
              Halteres
            </MtPill>
            <MtPill
              isActive={form.exercise.equipmentType === 'cable'}
              onClick={() => form.handleUpdateEquipmentType('cable')}
            >
              Polia
            </MtPill>
            <MtPill
              isActive={form.exercise.equipmentType === 'machine'}
              onClick={() => form.handleUpdateEquipmentType('machine')}
            >
              Máquina
            </MtPill>
            <MtPill
              isActive={form.exercise.equipmentType === 'bodyweight'}
              onClick={() => form.handleUpdateEquipmentType('bodyweight')}
            >
              Peso Corporal
            </MtPill>
          </div>
        </div>

        {/* Seleção de Tipo de Carga com MtPill */}
        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)', display: 'block', fontWeight: 700 }}>
            Carga
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <MtPill
              isActive={form.exercise.loadType === 'total'}
              onClick={() => form.handleUpdateLoadType('total')}
            >
              Carga Total
            </MtPill>
            <MtPill
              isActive={form.exercise.loadType === 'each_side'}
              onClick={() => form.handleUpdateLoadType('each_side')}
            >
              Cada Lado
            </MtPill>
          </div>
        </div>

        {/* Visualização rápida das séries do último treino deste exercício */}
        <LastWorkoutSets exerciseName={form.exercise.name} />

        {/* Lista de séries já registradas */}
        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 700 }}>
            Séries Realizadas
          </label>
          {form.exercise.sets.length === 0 ? (
            <MtEmptyState size="small" title="Nenhuma série registrada ainda" />
          ) : (
            <ol
              style={{
                paddingLeft: 'var(--spacing-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)',
              }}
            >
              {form.exercise.sets.map((set, index) => (
                <ExerciseSetItem
                  key={index}
                  set={set}
                  index={index}
                  onDelete={form.handleDeleteSet}
                  onUpdate={form.handleUpdateSet}
                />
              ))}
            </ol>
          )}
        </div>

        {/* Formulário de adição de série na Thumb Zone com Steppers */}
        <form
          onSubmit={handleFormSubmit}
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Registrar Próxima Série
            </span>
            {form.exercise.sets.length > 0 && (
              <MtButton
                type="button"
                variant="text"
                size="small"
                onClick={form.handleCopyLastSetReps}
                title="Copiar repetições da última série"
                style={{ padding: '4px 8px', fontSize: '0.8rem', minHeight: '36px' }}
              >
                <Copy size={15} strokeWidth={2.25} />
                <span>Copiar Última</span>
              </MtButton>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-sm)',
            }}
          >
            <MtStepper
              label="Reps"
              value={form.repetitionsInput}
              onChange={form.setRepetitionsInput}
              step={1}
              min={1}
              quickIncrements={[1, 2, 5]}
              placeholder="0"
            />
            <MtStepper
              label="Carga"
              unit="kg"
              value={form.weightInput}
              onChange={form.setWeightInput}
              step={1}
              min={0}
              quickIncrements={[2.5, 5]}
              placeholder="0"
            />
          </div>

          <MtStepper
            label="Descanso"
            unit="s"
            value={form.restInput}
            onChange={form.setRestInput}
            step={15}
            min={0}
            quickIncrements={[60, 90, 120]}
            setValueOnQuickIncrement={true}
            placeholder="120"
          />

          <ExerciseTechniquePills
            label="Técnicas Avançadas"
            selectedTechniques={form.selectedTechniques}
            onToggle={form.handleToggleTechnique}
          />

          {/* Botão Primário Dominante na Thumb Zone */}
          <MtButton
            type="submit"
            variant="primary"
            size="large"
            style={{
              width: '100%',
              marginTop: 'var(--spacing-xs)',
              fontWeight: 700,
              gap: '8px',
            }}
            title="Salvar série e iniciar descanso"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Adicionar Série</span>
          </MtButton>
        </form>
      </div>

      <RestTimer stopwatch={form.restStopwatch} targetSeconds={form.restTargetSeconds} />

      <MtConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Remover Exercício"
        message={`Deseja realmente remover o exercício "${form.exercise.name || 'Sem nome'}" e todas as suas séries?`}
        confirmVariant="danger"
        confirmText="Remover"
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDeleteExercise();
        }}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <MtAlertDialog
        isOpen={Boolean(form.validationError)}
        title="Atenção"
        message={form.validationError || ''}
        buttonText="Entendido"
        variant="primary"
        onClose={form.clearValidationError}
      />
    </MtCard>
  );
}
