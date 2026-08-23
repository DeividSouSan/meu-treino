import { useState, useEffect } from 'react';
import type { WorkoutSession } from '../../types/workout';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import { MtButton, MtConfirmDialog } from '../ui';
import { X, Check, Pencil } from 'lucide-react';

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
  /**
   * Chamado quando o usuário confirma a edição do nome (blur ou Enter).
   * O header garante que o valor enviado não é vazio antes de chamar.
   */
  onRenameSession: (newName: string) => void;
}

/**
 * ActiveWorkoutHeader é o cabeçalho fixo da tela de treino ativo.
 *
 * É autocontido quanto à interação: ele pergunta confirmação ao usuário
 * (Salvar/Encerrar e Cancelar) antes de delegar para os callbacks recebidos.
 * O nome do treino é editável inline — tocar no título ou no ícone de lápis
 * ativa um input. Ao perder o foco (blur) ou pressionar Enter, o nome é salvo;
 * se ficar vazio, o último nome válido é restaurado silenciosamente.
 * Escape descarta a edição sem salvar.
 */
export function ActiveWorkoutHeader({
  session,
  isEditing,
  durationStopwatch,
  onSaveOrFinish,
  onCancel,
  onRenameSession,
}: ActiveWorkoutHeaderProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(session.name);

  /**
   * Sincroniza o rascunho do nome quando a sessão muda externamente
   * (ex: ao abrir um treino salvo no modo de edição).
   */
  useEffect(() => {
    setDraftName(session.name);
  }, [session.name]);

  /**
   * Valida e persiste o nome rascunho ao sair do campo.
   * Se o valor trimado for vazio, restaura silenciosamente o último nome válido.
   */
  const commitName = () => {
    const trimmedName = draftName.trim();
    if (trimmedName === '') {
      setDraftName(session.name);
    } else if (trimmedName !== session.name) {
      onRenameSession(trimmedName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitName();
    } else if (event.key === 'Escape') {
      setDraftName(session.name);
      setIsEditingName(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    onCancel();
  };

  const handleConfirmSaveOrFinish = () => {
    setIsSaveDialogOpen(false);
    onSaveOrFinish();
  };

  const cancelTitle = isEditing ? 'Descartar Alterações' : 'Cancelar Treino';
  const cancelMessage = isEditing
    ? 'Deseja descartar as alterações deste treino?'
    : 'Tem certeza de que deseja cancelar este treino? O progresso não será salvo.';

  const saveTitle = isEditing ? 'Salvar Alterações' : 'Encerrar Treino';
  const saveMessage = isEditing
    ? 'Deseja salvar as alterações deste treino?'
    : 'Deseja finalizar e registrar este treino no histórico?';

  return (
    <>
      <header>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {isEditingName ? (
            <input
              className="workout-name-input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={handleNameKeyDown}
              maxLength={40}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              aria-label="Nome do treino"
            />
          ) : (
            <h1
              className="workout-name-display"
              onClick={() => setIsEditingName(true)}
              title="Tocar para renomear"
              style={{ fontSize: '1.1rem' }}
            >
              {session.name}
              <Pencil size={12} style={{ marginLeft: '5px', opacity: 0.45, flexShrink: 0 }} />
            </h1>
          )}
          <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block' }}>
            {isEditing ? 'Modo Edição' : `Duração: ${formatTimerValue(durationStopwatch.seconds)}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexShrink: 0 }}>
          <MtButton
            size="small"
            variant="danger"
            onClick={() => setIsCancelDialogOpen(true)}
            title="Cancelar treino"
            aria-label="Cancelar treino ativo"
            style={{ minWidth: '44px', minHeight: '44px', padding: 0 }}
          >
            <X size={18} strokeWidth={2.25} />
          </MtButton>
          <MtButton
            size="small"
            variant="primary"
            onClick={() => setIsSaveDialogOpen(true)}
            title={isEditing ? 'Salvar alterações' : 'Encerrar treino'}
            aria-label={isEditing ? 'Salvar alterações do treino' : 'Encerrar e registrar treino'}
            style={{ minWidth: '44px', minHeight: '44px', padding: 0 }}
          >
            <Check size={18} strokeWidth={2.25} />
          </MtButton>
        </div>
      </header>

      <MtConfirmDialog
        isOpen={isCancelDialogOpen}
        title={cancelTitle}
        message={cancelMessage}
        confirmVariant="danger"
        confirmText={isEditing ? 'Descartar' : 'Cancelar Treino'}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelDialogOpen(false)}
      />

      <MtConfirmDialog
        isOpen={isSaveDialogOpen}
        title={saveTitle}
        message={saveMessage}
        confirmVariant="primary"
        confirmText={isEditing ? 'Salvar' : 'Encerrar'}
        onConfirm={handleConfirmSaveOrFinish}
        onCancel={() => setIsSaveDialogOpen(false)}
      />
    </>
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
