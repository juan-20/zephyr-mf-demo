import { create } from 'zustand';
import type { LoginRequest, User } from '@repo/types';
import { api, ApiError } from './api';

export type SessionStatus = 'unknown' | 'authed' | 'anon';

type SessionState = {
  user: User | null;
  status: SessionStatus;
  busy: boolean;
  error: string | null;
  restore: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useSession = create<SessionState>()((set) => {
  const authenticate = (path: string) => async (credentials: LoginRequest) => {
    set({ busy: true, error: null });
    try {
      const { user } = await api<{ user: User }>(path, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      set({ user, status: 'authed', busy: false });
      return true;
    } catch (e) {
      set({ busy: false, error: e instanceof Error ? e.message : 'Something went wrong' });
      return false;
    }
  };

  return {
    user: null,
    status: 'unknown',
    busy: false,
    error: null,
    restore: async () => {
      try {
        const user = await api<User>('/auth/me');
        set({ user, status: 'authed' });
      } catch (e) {
        if (!(e instanceof ApiError) || e.status !== 401) console.error(e);
        set({ user: null, status: 'anon' });
      }
    },
    login: authenticate('/auth/login'),
    register: authenticate('/auth/register'),
    logout: async () => {
      try {
        await api<void>('/auth/logout', { method: 'POST' });
      } finally {
        set({ user: null, status: 'anon', error: null });
      }
    },
  };
});
