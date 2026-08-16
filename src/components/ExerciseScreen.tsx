import type { FormEvent } from 'react';
import type { WorkoutExercise } from '../types/workout';
import { useExerciseScreen } from './useExerciseScreen';
import { RestTimer } from './RestTimer';
import { MtButton, MtEmptyState, MtField, MtCard } from './ui';
import { ExerciseSetItem } from './ExerciseSetItem';
import { ExerciseTechniquePills } from './ExerciseTechniquePills';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Copy, Minus, Plus } from 'lucide-react';
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
  const form = useExerciseScreen({ initialExercise: exercise, onUpdateExercise });

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    form.handleAddSet();
  };

  return (
    <MtCard style={{ padding: 'var(--spacing-md)' }}>
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
        >
          <ArrowLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <MtButton
            size="small"
            onClick={exerciseNavigation.onNavigatePrevious}
            disabled={!exerciseNavigation.hasPrevious}
            title="Exercício anterior"
          >
            <ChevronLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </MtButton>
          <MtButton
            size="small"
            onClick={exerciseNavigation.onNavigateNext}
            disabled={!exerciseNavigation.hasNext}
            title="Próximo exercício"
          >
            <ChevronRight size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </MtButton>
        </div>
        <MtButton variant="danger" size="small" onClick={onDeleteExercise} title="Excluir exercício">
          <Trash2 size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
          <MtField
            label="Carga (kg)"
            value={form.weightInput}
            onChange={form.handleUpdateReferenceWeight}
            placeholder="Ex: 30"
            type="number"
            step="any"
            style={{ flex: 1 }}
          />
          <MtField
            label="Notas"
            value={form.exercise.notes}
            onChange={form.handleUpdateNotes}
            placeholder="Ex: Pegada aberta"
            style={{ flex: 2 }}
          />
        </div>

        {/* Visualização rápida das séries do último treino deste exercício */}
        <LastWorkoutSets exerciseName={form.exercise.name} />

        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)' }}>Séries</label>
          {form.exercise.sets.length === 0 ? (
            <MtEmptyState
              size="small"
              title="Nenhuma série registrada"
            />
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

        <form
          onSubmit={handleFormSubmit}
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: 'var(--spacing-md)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={form.handleCopyLastSetReps}
              disabled={form.exercise.sets.length === 0}
              title="Copiar reps da última série"
            >
              <Copy size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={() => form.handleQuickAdjustReps(-1)}
              title="Diminuir 1 repetição"
            >
              <Minus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={() => form.handleQuickAdjustReps(1)}
              title="Aumentar 1 repetição"
            >
              <Plus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
          </div>

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
              value={form.repetitionsInput}
              onChange={(event) => form.setRepetitionsInput(event.target.value)}
              type="number"
              placeholder="Reps"
              required
              style={{ flex: 1 }}
            />
            <MtField
              label="Carga"
              labelStyle={{ fontSize: '0.75rem' }}
              value={form.weightInput}
              onChange={(event) => form.setWeightInput(event.target.value)}
              type="number"
              step="any"
              placeholder="kg"
              style={{ flex: 1 }}
            />
            <MtField
              label="Descanso"
              labelStyle={{ fontSize: '0.75rem' }}
              value={form.restInput}
              onChange={(event) => form.setRestInput(event.target.value)}
              type="number"
              placeholder="s"
              style={{ flex: 1 }}
            />
            <MtButton
              type="submit"
              variant="primary"
              style={{
                height: '42px',
                width: '42px',
                padding: '0',
                borderRadius: 'var(--border-radius)',
              }}
              title="Adicionar série"
            >
              <Plus size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
          </div>

          <ExerciseTechniquePills
            label="Técnicas"
            selectedTechniques={form.selectedTechniques}
            onToggle={form.handleToggleTechnique}
          />
        </form>
      </div>

      <RestTimer
        stopwatch={form.restStopwatch}
        targetSeconds={form.restTargetSeconds}
      />
    </MtCard>
  );
}