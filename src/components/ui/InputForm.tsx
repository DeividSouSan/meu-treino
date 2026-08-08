import type { ReactNode, ChangeEvent, FormEvent } from 'react';

export interface InputFormProps {
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

export function InputForm({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  inputType = 'text',
  submitButtonContent,
  submitButtonStyle,
  inputStyle,
  onKeyDown,
}: InputFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim() === '') {
      return;
    }
    onSubmit(value.trim());
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={inputStyle}
        onKeyDown={onKeyDown}
      />
      <button
        type="submit"
        className="small"
        style={{
          borderColor: 'var(--accent-color)',
          color: 'var(--accent-color)',
          ...submitButtonStyle,
        }}
      >
        {submitButtonContent}
      </button>
    </form>
  );
}