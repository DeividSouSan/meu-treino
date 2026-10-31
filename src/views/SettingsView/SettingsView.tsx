import packageInfo from '../../../package.json';
import { useHistoryView } from '../HistoryView/useHistoryView';
import { useNavigation } from '../../hooks';
import { BackupSection, ExportAISection, VersionInfo } from '../../components/history';
import { MtButton, MtSectionTitle } from '../../components/ui';
import { ArrowLeft, Settings } from 'lucide-react';

/**
 * SettingsView é a tela de Configurações & Backup.
 *
 * Renderizada quando o pathname é /configuracoes. Substitui o antigo
 * MtModal embutido no HistoryView, agora como uma tela própria gerenciada
 * pelo NavigationProvider via pushState/popstate.
 */
export function SettingsView() {
  const { navigateToHistory } = useNavigation();

  const { workoutHistory, handleImportSuccess, handleExportSuccess } = useHistoryView();

  return (
    <div>
      <header>
        <MtButton
          variant="text"
          size="small"
          onClick={navigateToHistory}
          aria-label="Voltar ao histórico"
          title="Voltar"
          style={{ minHeight: '40px', padding: '0' }}
        >
          <ArrowLeft size={18} strokeWidth={2.25} />
        </MtButton>
        <h1 style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          <Settings size={20} strokeWidth={2.25} />
          Configurações
        </h1>
      </header>

      <main>
        <MtSectionTitle icon={<Settings size={18} strokeWidth={2.25} />}>
          Backup de Treinos
        </MtSectionTitle>

        <BackupSection
          onImportSuccess={handleImportSuccess}
          onExportSuccess={handleExportSuccess}
          workoutHistoryLength={workoutHistory.length}
          asCard={false}
        />

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-color)',
            margin: 'var(--spacing-xs) 0',
          }}
        />

        <ExportAISection asCard={false} workoutHistory={workoutHistory} />

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-color)',
            margin: 'var(--spacing-xs) 0',
          }}
        />

        <VersionInfo version={packageInfo.version} />
      </main>
    </div>
  );
}
