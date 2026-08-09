import type { ChangeEvent, CSSProperties } from 'react';

export interface MtFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  step?: string;
  required?: boolean;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
}

export function MtField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  step,
  required,
  style,
  labelStyle,
}: MtFieldProps) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        required={required}
      />
    </div>
  );
}