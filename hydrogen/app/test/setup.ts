import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock react-router hooks commonly used in components
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({pathname: '/', search: '', hash: ''}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});
