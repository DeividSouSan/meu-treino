import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MtSelect } from './MtSelect';

describe('MtSelect', () => {
  const options = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ];

  it('renders label and options correctly', () => {
    render(<MtSelect label="Test Select" value="opt1" onChange={() => {}} options={options} />);

    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('opt1');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<MtSelect label="Test Select" value="opt1" onChange={handleChange} options={options} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
