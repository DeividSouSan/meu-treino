import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SessionProvider, useSession } from './SessionProvider';

describe('useSession hook edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider>{children}</SessionProvider>
  );

  it('lança erro ao ser usado fora do SessionProvider', () => {
    const consoleError = console.error;
    console.error = () => {};

    expect(() => renderHook(() => useSession())).toThrowError(
      'useSession must be used within a SessionProvider'
    );

    console.error = consoleError;
  });

  it('ignora finishActiveWorkout se não houver sessão ativa nem informada', () => {
    const { result } = renderHook(() => useSession(), { wrapper });
    expect(result.current.activeSession).toBeNull();

    act(() => {
      // Como não há sessão ativa, deve retornar imediatamente
      result.current.finishActiveWorkout();
    });

    // Nada deve mudar
    expect(result.current.activeSession).toBeNull();
  });

  it('ignora saveEditedWorkout se não houver sessão em edição nem informada', () => {
    const { result } = renderHook(() => useSession(), { wrapper });
    expect(result.current.editingSession).toBeNull();

    act(() => {
      // Como não há sessão em edição, deve retornar imediatamente
      result.current.saveEditedWorkout();
    });

    // Nada deve mudar
    expect(result.current.editingSession).toBeNull();
  });
});
