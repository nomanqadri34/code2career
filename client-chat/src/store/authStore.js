import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true, // Start with loading true to prevent flicker
      error: null,
      isInitialized: false, // Track if auth has been initialized

      // Initialize auth from localStorage
      initializeAuth: () => {
        const { isInitialized } = get();
        if (isInitialized) return; // Prevent multiple initializations
        
        try {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ 
                user, 
                token, 
                isLoading: false, 
                isInitialized: true,
                error: null 
              });
            } catch (parseError) {
              console.error('Failed to parse stored user data:', parseError);
              // Clear corrupted data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              set({ 
                user: null, 
                token: null, 
                isLoading: false, 
                isInitialized: true,
                error: null 
              });
            }
          } else {
            set({ 
              user: null, 
              token: null, 
              isLoading: false, 
              isInitialized: true,
              error: null 
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null, 
            token: null, 
            isLoading: false, 
            isInitialized: true,
            error: error.message 
          });
        }
      },

      // Login with Google
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.loginWithGoogle();
          // Redirect happens in authService
        } catch (error) {
          console.error('Google login error:', error);
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Login failed');
        }
      },

      // Login with mock token (development)
      loginWithMock: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login('mock-jwt-token-' + Date.now());
          
          if (response.success) {
            set({ 
              user: response.user, 
              token: response.token, 
              isLoading: false 
            });
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            toast.success('Welcome! Logged in with demo account.');
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.error('Mock login error:', error);
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Login failed');
        }
      },

      // Process OAuth callback
      handleOAuthCallback: (token) => {
        if (token) {
          set({ isLoading: true });
          
          // Get user profile
          authService.getProfile()
            .then(response => {
              if (response.data.success) {
                set({
                  user: response.data.user,
                  token,
                  isLoading: false
                });
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                toast.success(`Welcome back, ${response.data.user.name}!`);
              }
            })
            .catch(error => {
              console.error('Profile fetch error:', error);
              set({ isLoading: false, error: error.message });
              toast.error('Failed to get user profile');
            });
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(profileData);
          
          if (response.data.success) {
            const updatedUser = { ...get().user, ...response.data.user };
            set({ user: updatedUser, isLoading: false });
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Profile updated successfully!');
            
            return response.data;
          } else {
            throw new Error(response.data.message || 'Profile update failed');
          }
        } catch (error) {
          console.error('Profile update error:', error);
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Profile update failed');
          throw error;
        }
      },

      // Logout
      logout: () => {
        authService.logout();
        set({ user: null, token: null, error: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
      },

      // Generic login function (defaults to mock for demo)
      login: async (userData = null) => {
        if (userData) {
          // Direct login with provided user data (e.g., from Google OAuth)
          set({ isLoading: true, error: null });
          try {
            const token = 'google-oauth-token-' + Date.now();
            set({ 
              user: userData, 
              token: token, 
              isLoading: false 
            });
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return { success: true, user: userData, token };
          } catch (error) {
            console.error('Direct login error:', error);
            set({ error: error.message, isLoading: false });
            throw error;
          }
        } else {
          return get().loginWithMock();
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Computed authentication status - prevent function calls
      get isAuthenticated() {
        const state = get();
        return !!(state.user && state.token);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isInitialized: state.isInitialized,
      }),
      // Add hydration and rehydration handlers
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);