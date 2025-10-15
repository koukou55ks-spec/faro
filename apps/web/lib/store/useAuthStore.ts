import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  token: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, token: session?.access_token || null }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, session: null, token: null }),
}));
