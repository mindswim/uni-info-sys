import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { User, LoginCredentials, RegisterData } from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  getPrimaryRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login with:', credentials.email);
          const { token, user } = await authService.login(credentials);
          console.log('Login successful, setting auth state:', { user, token: token?.substring(0, 10) + '...' });
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Login failed in store:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Even if logout fails on server, clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authService.register(data);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      refreshUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Failed to fetch user',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasRole: (roleName: string) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        return user.roles.some(role => role.name === roleName);
      },

      hasPermission: (permissionName: string) => {
        const { user } = get();
        if (!user) return false;

        // Check direct permissions
        if (user.permissions?.some(perm => perm.name === permissionName)) {
          return true;
        }

        // Check role permissions
        if (user.roles) {
          for (const role of user.roles) {
            if (role.permissions?.some(perm => perm.name === permissionName)) {
              return true;
            }
          }
        }

        return false;
      },

      getPrimaryRole: () => {
        const { user } = get();
        if (!user || !user.roles || user.roles.length === 0) return null;

        // Priority order for roles
        const rolePriority = ['admin', 'staff', 'instructor', 'student'];

        for (const priority of rolePriority) {
          if (user.roles.some(role => role.name === priority)) {
            return priority;
          }
        }

        return user.roles[0].name;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Simply rehydrate the state without making API calls
        // This prevents redirect loops on initial load
        if (state && !state.token) {
          state.isAuthenticated = false;
          state.user = null;
        }
      },
    }
  )
);