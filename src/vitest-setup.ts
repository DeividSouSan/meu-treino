/**
 * Arquivo de configuração global executado antes de cada arquivo de teste.
 *
 * Aqui configuramos os matchers personalizados do jest-dom (como
 * `toBeInTheDocument`, `toBeDisabled`) para que estejam disponíveis
 * globalmente em todos os testes, sem precisar importar em cada arquivo.
 */
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

/**
 * O jsdom não implementa `window.matchMedia`. Fornecemos um stub padrão
 * (sistema prefere tema claro) para que qualquer componente que consulte a
 * preferência do sistema possa renderizar sem precisar mockar em cada teste.
 */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

/**
 * No jsdom, clicar em um `<a href="blob:...">` dispara o aviso
 * "Not implemented: navigation to another Document". Substituímos o clique
 * por um no-op; os testes que precisam verificar o download continuam usando
 * `vi.spyOn(HTMLAnchorElement.prototype, 'click')`.
 */
HTMLAnchorElement.prototype.click = function click() {
  // Intencionalmente vazio: evita navegação real no ambiente de teste.
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
