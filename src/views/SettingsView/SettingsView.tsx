import packageInfo from '../../../package.json';
import { useHistoryView } from '../HistoryView/useHistoryView';
import { useNavigation, useTheme, type Theme } from '../../hooks';
import { BackupSection, ExportAISection, VersionInfo } from '../../components/history';
import { MtButton, MtSectionTitle, MtSelect } from '../../components/ui';
import { ArrowLeft, Monitor, Moon, Settings, Sun } from 'lucide-react';

const themeOptions = [
  { value: 'system', label: 'Seguir o sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

/**
 * SettingsView é a tela de Configurações & Backup.
 *
 * Renderizada quando o pathname é /configuracoes. Substitui o antigo
 * MtModal embutido no HistoryView, agora como uma tela própria gerenciada
 * pelo NavigationProvider via pushState/popstate.
 */
export function SettingsView() {
  const { navigateToHistory } = useNavigation();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const { workoutHistory, handleImportSuccess, handleExportSuccess } = useHistoryView();

  const themeIcon =
    theme === 'system' ? (
      <Monitor size={18} strokeWidth={2.25} />
    ) : resolvedTheme === 'dark' ? (
      <Moon size={18} strokeWidth={2.25} />
    ) : (
      <Sun size={18} strokeWidth={2.25} />
    );

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
        <MtSectionTitle icon={<Sun size={18} strokeWidth={2.25} />}>Aparência</MtSectionTitle>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            {themeIcon}
          </span>
          <MtSelect
            label="Tema"
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
            options={themeOptions}
            style={{ flex: 1, maxWidth: '220px' }}
          />
        </div>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-color)',
            margin: 'var(--spacing-xs) 0',
          }}
        />

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
