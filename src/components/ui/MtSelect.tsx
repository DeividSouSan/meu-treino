import type { ChangeEvent, CSSProperties } from 'react';

export interface MtSelectOption {
  value: string;
  label: string;
}

export interface MtSelectProps {
  label?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: MtSelectOption[];
  disabled?: boolean;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
}

export function MtSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  style,
  labelStyle,
}: MtSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {label && (
        <label
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            ...labelStyle,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 'var(--border-radius-sm, 8px)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
