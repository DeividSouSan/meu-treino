import { useMemo } from 'react';
import { History } from 'lucide-react';
import type { WorkoutSession } from '../../types/workout';
import { useContextWorkout } from '../../hooks';
import { MtSectionTitle } from './MtSectionTitle';

export interface MtLastWorkoutSetsProps {
  /**
   * Nome do exercício que o usuário está treinando neste momento.
   * Serve para localizar o mesmo exercício nos treinos anteriores.
   */
  exerciseName: string;
}

/**
 * MtLastWorkoutSets mostra de forma resumida as séries do último treino
 * em que o usuário realizou este mesmo exercício.
 *
 * O componente é autocontido: toda a lógica de busca está dentro dele.
 * Ele obtém o histórico de treinos diretamente do contexto (sem prop-drilling)
 * e encontra a sessão mais recente que contenha o exercício informado.
 *
 * O único dado recebido via props é o nome do exercício atual.
 */
export function MtLastWorkoutSets({ exerciseName }: MtLastWorkoutSetsProps) {
  const { workoutHistory } = useContextWorkout();

  /**
   * Procura no histórico a última sessão concluída que contenha
   * um exercício com o mesmo nome (ignora maiúsculas/minúsculas e espaços).
   * O histórico já vem ordenado da sessão mais recente para a mais antiga,
   * então basta pegar a primeira que combinar.
   */
  const ultimoTreino = useMemo(() => {
    const nomeNormalizado = exerciseName.trim().toLowerCase();
    if (nomeNormalizado === '') {
      return null;
    }

    const sessaoEncontrada = workoutHistory.find(
      (session: WorkoutSession) => {
        const contemExercicio = session.exercises.some(
          (exercise) => exercise.name.trim().toLowerCase() === nomeNormalizado
        );
        return session.status === 'completed' && contemExercicio;
      }
    );

    if (!sessaoEncontrada) {
      return null;
    }

    const exercicioDoUltimoTreino = sessaoEncontrada.exercises.find(
      (exercise) => exercise.name.trim().toLowerCase() === nomeNormalizado
    );

    if (!exercicioDoUltimoTreino || exercicioDoUltimoTreino.sets.length === 0) {
      return null;
    }

    return {
      series: exercicioDoUltimoTreino.sets,
      dataDoTreino: sessaoEncontrada.date,
    };
  }, [exerciseName, workoutHistory]);

  /**
   * Formata a data de um treino no padrão brasileiro (ex: "05/08, 14:30").
   */
  const formatarDataDoTreino = (dataEmString: string): string => {
    const data = new Date(dataEmString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--background-color)',
      }}
    >
      <MtSectionTitle
        icon={
          <History
            size={16}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        }
        style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}
      >
        Último Treino
      </MtSectionTitle>

      {ultimoTreino ? (
        <>
          {/* Data do último treino em fonte menor e desativada */}
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            {formatarDataDoTreino(ultimoTreino.dataDoTreino)}
          </span>

          {/* Lista de séries: número, reps e carga em destaque, tempo de descanso secundário */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xs)',
            }}
          >
            {ultimoTreino.series.map((set, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'var(--card-background)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '0.95rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  #{index + 1}
                </span>

                <span
                  style={{
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  <strong>{set.repetitions} reps</strong> @ {set.weightInKg}kg
                </span>

                {set.restTimeInSeconds > 0 && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {set.restTimeInSeconds}s
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        // Mensagem sutil quando não há registro anterior
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            display: 'block',
            textAlign: 'center',
            padding: 'var(--spacing-xs) 0',
          }}
        >
          Nenhum registro anterior para este exercício.
        </span>
      )}
    </div>
  );
}
