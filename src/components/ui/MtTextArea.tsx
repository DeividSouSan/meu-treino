import { forwardRef } from 'react';
import './MtTextArea.css';

export interface MtTextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> {
  /** Optional label displayed above the textarea */
  label?: string;
  /** Current value of the textarea */
  value: string;
  /** Callback when the value changes with the plain string */
  onChangeValue?: (value: string) => void;
  /** Legacy onChange with event */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Optional style object */
  style?: React.CSSProperties;
}

/**
 * MtTextArea – UI primitive for a multi‑line, vertically resizable text input.
 * It follows the design system tokens used by other Mt* components (spacing,
 * colors, focus outlines). The component is accessible: the label is linked via
 * the native `<label>` element.
 */
export const MtTextArea = forwardRef<HTMLTextAreaElement, MtTextAreaProps>(
  ({ label, value, onChangeValue, onChange, placeholder, rows = 3, style, ...props }, ref) => {
    const id = label?.replace(/\s+/g, '-').toLowerCase();
    return (
      <div className="mt-textarea" style={style}>
        {label && (
          <label className="mt-textarea-label" htmlFor={id}>
            {label}
          </label>
        )}
        <textarea
          {...props}
          id={id}
          ref={ref}
          className="mt-textarea-input"
          value={value}
          onChange={(e) => {
            if (onChangeValue) onChangeValue(e.target.value);
            if (onChange) onChange(e);
          }}
          placeholder={placeholder}
          rows={rows}
        />
      </div>
    );
  },
);
