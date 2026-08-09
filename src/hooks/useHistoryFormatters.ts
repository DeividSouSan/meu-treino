/**
 * Hook para formatar dados de exibição do histórico de treinos
 */
export function useHistoryFormatters() {
  const formatWorkoutDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWorkoutDuration = (durationInSeconds: number) => {
    const durationInMinutes = Math.round(durationInSeconds / 60);
    return `${durationInMinutes} min`;
  };

  return {
    formatWorkoutDate,
    formatWorkoutDuration,
  };
}