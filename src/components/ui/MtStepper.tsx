import { type ChangeEvent, type CSSProperties } from 'react';
import { Minus, Plus } from 'lucide-react';
import { hapticService } from '../../services/hapticService';

export interface MtStepperProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  quickIncrements?: number[];
  style?: CSSProperties;
  disabled?: boolean;
}

export function MtStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  unit,
  placeholder,
  quickIncrements,
  style,
  disabled = false,
}: MtStepperProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  const handleAdjust = (delta: number) => {
    if (disabled) return;
    const current = typeof value === 'number' ? value : parseFloat(value) || 0;
    let next = Math.round((current + delta) * 100) / 100;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    hapticService.lightTap();
    onChange(String(next));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {label && (
        <label
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '2px',
          }}
        >
          {label} {unit ? `(${unit})` : ''}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          backgroundColor: 'var(--card-background)',
          overflow: 'hidden',
          minHeight: '48px',
        }}
      >
        <button
          type="button"
          onClick={() => handleAdjust(-step)}
          disabled={disabled || (min !== undefined && numericValue <= min)}
          style={{
            width: '48px',
            minWidth: '48px',
            minHeight: '48px',
            padding: 0,
            borderRadius: 0,
            border: 'none',
            borderRight: '1px solid var(--border-color)',
            background: 'var(--background-color)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: 'none',
          }}
          aria-label={`Diminuir ${label || 'valor'}`}
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>

        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 0,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
              padding: '0 4px',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => handleAdjust(step)}
          disabled={disabled || (max !== undefined && numericValue >= max)}
          style={{
            width: '48px',
            minWidth: '48px',
            minHeight: '48px',
            padding: 0,
            borderRadius: 0,
            border: 'none',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--background-color)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: 'none',
          }}
          aria-label={`Aumentar ${label || 'valor'}`}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {quickIncrements && quickIncrements.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleAdjust(inc)}
              disabled={disabled}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-background)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: 'none',
                minHeight: '28px',
              }}
            >
              {inc > 0 ? `+${inc}` : inc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
