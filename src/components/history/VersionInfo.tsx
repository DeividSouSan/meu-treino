export interface VersionInfoProps {
  version: string;
}

export function VersionInfo({ version }: VersionInfoProps) {
  return (
    <span
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        opacity: 0.4,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 99,
      }}
    >
      v{version}
    </span>
  );
}