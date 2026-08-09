import type { ChangeEvent, CSSProperties, KeyboardEvent } from 'react';

export interface MtInputProps {
  value: string;
  onChange: (value: string) => void;
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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
      onKeyDown={onKeyDown}
    />
  );
}