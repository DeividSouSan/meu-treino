import type { ChangeEvent, CSSProperties, KeyboardEvent } from 'react';

export interface MtInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  style?: CSSProperties;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function MtInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  style,
  onKeyDown,
}: MtInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      onKeyDown={onKeyDown}
    />
  );
}
