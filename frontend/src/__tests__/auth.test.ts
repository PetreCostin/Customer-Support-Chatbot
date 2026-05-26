import { getToken, setToken, getUser, setUser, clearAuth } from '@/lib/auth';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth utilities', () => {
  beforeEach(() => localStorageMock.clear());

  it('getToken returns null when not set', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken and getToken work correctly', () => {
    setToken('test-token');
    expect(getToken()).toBe('test-token');
  });

  it('setUser and getUser work correctly', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'USER' };
    setUser(user);
    expect(getUser()).toEqual(user);
  });

  it('clearAuth removes token and user', () => {
    setToken('token');
    setUser({ id: '1', email: 'test@test.com', name: 'Test', role: 'USER' });
    clearAuth();
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });
});
