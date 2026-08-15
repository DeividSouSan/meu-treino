import type { WorkoutSession } from '../../types/workout';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import { MtButton } from '../ui';
import { X, Check } from 'lucide-react';

export interface ActiveWorkoutHeaderProps {
  /**
   * A sessão atualmente em exibição (ativa ou em edição).
   */
  session: WorkoutSession;
  /**
   * Verdadeiro quando está editando uma sessão já salva.
   */
  isEditing: boolean;
  /**
   * Cronômetro de duração da sessão, exibido na barra de cabeçalho.
   */
  durationStopwatch: UseStopwatchResult;
  /**
   * Ação disparada pelo botão de confirmar (salvar edição ou encerrar treino).
   * A confirmação do usuário é feita aqui, antes de chamar o callback.
   */
  onSaveOrFinish: () => void;
  /**
   * Ação disparada pelo botão de cancelar. Também exige confirmação.
   */
  onCancel: () => void;
}

/**
 * ActiveWorkoutHeader é o cabeçalho fixo da tela de treino ativo.
 *
 * É autocontido quanto à interação: ele pergunta confirmação ao usuário
 * (Salvar/Encerrar e Cancelar) antes de delegar para os callbacks recebidos.
 * Assim a única regra de "ação acidental precisa de confirmação" vive aqui.
 */
export function ActiveWorkoutHeader({
  session,
  isEditing,
  durationStopwatch,
  onSaveOrFinish,
  onCancel,
}: ActiveWorkoutHeaderProps) {
  const formattedDate = new Date(session.date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCancel = () => {
    const confirmado = window.confirm(
      'Tem certeza de que deseja cancelar este treino? O progresso não será salvo.'
    );
    if (confirmado) {
      onCancel();
    }
  };

  const handleSaveOrFinish = () => {
    const confirmMessage = isEditing
      ? 'Tem certeza de que deseja salvar este treino?'
      : 'Tem certeza de que deseja encerrar este treino?';
    const confirmado = window.confirm(confirmMessage);
    if (confirmado) {
      onSaveOrFinish();
    }
  };

  return (
    <header>
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>
          {formattedDate}
        </h1>
        <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block' }}>
          {isEditing ? 'Modo Edição' : `Duração: ${formatTimerValue(durationStopwatch.seconds)}`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <MtButton
          size="small"
          variant="danger"
          onClick={handleCancel}
          title="Cancelar treino"
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          <X size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
        <MtButton
          size="small"
          variant="primary"
          onClick={handleSaveOrFinish}
          title={isEditing ? 'Salvar alterações' : 'Encerrar treino'}
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          <Check size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
      </div>
    </header>
  );
}

/**
 * Formata o tempo total em segundos para o formato MM:SS (ou HH:MM:SS).
 */
function formatTimerValue(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
}
