import { useState } from 'react';
import { MtSectionTitle, MtButton, MtSelect, MtCard } from '../ui';
import { Bot, Download } from 'lucide-react';
import type { WorkoutSession } from '../../types/workout';
import { exportHistoryForAI } from '../../services/exportAI';

export interface ExportAISectionProps {
  /**
   * Se verdadeiro, renderiza dentro de um MtCard. Se falso, renderiza como container flexível simples.
   * Padrão: true.
   */
  asCard?: boolean;
  /**
   * Histórico de treinos a ser filtrado e exportado.
   */
  workoutHistory?: WorkoutSession[];
}

export function ExportAISection({ asCard = true, workoutHistory = [] }: ExportAISectionProps) {
  const [period, setPeriod] = useState<string>('lastWeek');

  const filterSessionsByPeriod = (
    sessions: WorkoutSession[],
    selectedPeriod: string,
  ): WorkoutSession[] => {
    const now = new Date();
    let cutoff = new Date();

    if (selectedPeriod === 'lastWeek') {
      cutoff.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'lastMonth') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === 'last2Months') {
      cutoff.setMonth(now.getMonth() - 2);
    } else if (selectedPeriod === 'last3Months') {
      cutoff.setMonth(now.getMonth() - 3);
    }

    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoff;
    });
  };

  const handleExport = () => {
    const filteredSessions = filterSessionsByPeriod(workoutHistory, period);
    const formattedText = exportHistoryForAI(filteredSessions);

    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    const anchorElement = document.createElement('a');
    anchorElement.href = downloadUrl;
    anchorElement.download = 'workout.txt';

    document.body.appendChild(anchorElement);
    anchorElement.click();

    document.body.removeChild(anchorElement);
    URL.revokeObjectURL(downloadUrl);
  };

  const periodOptions = [
    { value: 'lastWeek', label: 'Última semana' },
    { value: 'lastMonth', label: 'Último mês' },
    { value: 'last2Months', label: 'Últimos 2 meses' },
    { value: 'last3Months', label: 'Últimos 3 meses' },
  ];

  const content = (
    <>
      <MtSectionTitle icon={<Bot size={18} strokeWidth={2} color="var(--accent-color)" />}>
        Exportar para IA
      </MtSectionTitle>

      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
        Selecione o período de treinos para exportar um resumo otimizado para assistentes de IA.
      </p>

      <MtSelect
        label="Período"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        options={periodOptions}
        style={{ marginTop: 'var(--spacing-xs)' }}
      />

      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
        <MtButton size="small" onClick={handleExport} style={{ flex: 1 }}>
          <Download size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Exportar para IA
        </MtButton>
      </div>
    </>
  );

  return asCard ? (
    <MtCard as="section" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
      {content}
    </MtCard>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {content}
    </div>
  );
}
