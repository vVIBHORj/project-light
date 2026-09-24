import { create } from 'zustand';
import { User, UserProfile } from '../domain/types';
import { repositories } from '../data';

interface SessionState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: {
    id: 'user_1',
    phone: '+91 98765 43210',
    status: 'active',
    riskTier: 'standard',
    createdAt: '2026-09-01',
    lastActiveAt: '2026-09-24',
  },
  profile: null,
  token: 'mock-jwt-session-token',
  isLoading: false,
  isOnboarded: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setToken: (token) => set({ token }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { user, token } = await repositories.auth.getSession();
      if (user) {
        const profile = await repositories.profile.getProfile(user.id);
        set({ user, token, profile, isOnboarded: Boolean(profile?.completionPercentage && profile.completionPercentage > 50) });
      } else {
        set({ user: null, token: null, profile: null, isOnboarded: false });
      }
    } catch {
      set({ user: null, token: null, profile: null, isOnboarded: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await repositories.auth.signOut();
    set({ user: null, token: null, profile: null, isOnboarded: false });
  },

  clearSession: async () => {
    await repositories.auth.signOut();
    set({ user: null, token: null, profile: null, isOnboarded: false });
  },
}));
