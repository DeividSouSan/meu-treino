import type { ReactNode, FormEvent } from 'react';
import { MtInput } from './MtInput';
import { MtButton } from './MtButton';

export interface MtInputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'number';
  submitButtonContent: ReactNode;
  submitButtonStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function MtInputForm({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  inputType = 'text',
  submitButtonContent,
  submitButtonStyle,
  inputStyle,
  onKeyDown,
}: MtInputFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim() === '') {
      return;
    }
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
      <MtInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={inputType}
        style={inputStyle}
        onKeyDown={onKeyDown}
      />
      <MtButton
        type="submit"
        size="small"
        style={{
          borderColor: 'var(--accent-color)',
          color: 'var(--accent-color)',
          ...submitButtonStyle,
        }}
      >
        {submitButtonContent}
      </MtButton>
    </form>
  );
}