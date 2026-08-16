import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigation } from './NavigationProvider';

describe('useNavigation hook edge cases', () => {
  it('lança erro ao ser usado fora do NavigationProvider', () => {
    // Para testar o throw, suprimimos temporariamente o console.error que o React emite
    const consoleError = console.error;
    console.error = () => {};

    expect(() => renderHook(() => useNavigation())).toThrowError(
      'useNavigation must be used within a NavigationProvider'
    );

    console.error = consoleError;
  });
});
