import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.setupInterceptors();
    this.setupGoogleAuth();
  }

  setupInterceptors() {
    axios.defaults.baseURL = API_URL;
    
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  setupGoogleAuth() {
    // Initialize Google OAuth when available
    if (typeof window !== 'undefined' && window.google) {
      this.initializeGoogleAuth();
    } else {
      // Load Google Auth script if not already loaded
      this.loadGoogleAuthScript();
    }
  }

  loadGoogleAuthScript() {
    if (document.getElementById('google-auth-script')) return;
    
    const script = document.createElement('script');
    script.id = 'google-auth-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => this.initializeGoogleAuth();
    document.head.appendChild(script);
  }

  initializeGoogleAuth() {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn('Google Auth not available or client ID not configured');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: this.handleGoogleCallback.bind(this)
      });
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  }

  handleGoogleCallback(response) {
    if (response.credential) {
      this.processGoogleLogin(response.credential);
    }
  }

  // Initialize Google Sign-In
  async loginWithGoogle() {
    try {
      if (!window.google) {
        throw new Error('Google Auth not loaded');
      }

      // Redirect to backend Google OAuth
      window.location.href = `${API_URL}/auth/google`;
    } catch (error) {
      console.error('Google login error:', error);
      
      // Fallback for development
      if (import.meta.env.DEV) {
        console.warn('Using development fallback authentication');
        return this.login('mock-jwt-token-' + Date.now());
      }
      
      throw error;
    }
  }

  // Process Google credential from callback
  async processGoogleLogin(credential) {
    try {
      const response = await axios.post('/auth/google/verify', {
        credential
      });
      
      if (response.data.success) {
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard or home
        window.location.href = '/dashboard';
        
        return response.data;
      }
      throw new Error(response.data.message || 'Authentication failed');
    } catch (error) {
      console.error('Google credential processing error:', error);
      throw error;
    }
  }

  // Handle OAuth callback from URL
  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      throw new Error(`Authentication failed: ${error}`);
    }

    if (token) {
      this.token = token;
      localStorage.setItem('token', this.token);
      
      // Get user info
      this.getProfile().then(user => {
        localStorage.setItem('user', JSON.stringify(user));
        // Clean URL and redirect to dashboard
        window.history.replaceState({}, document.title, '/dashboard');
      }).catch(err => {
        console.error('Failed to get user profile:', err);
      });
      
      return { success: true, token };
    }

    return null;
  }

  async login(mockToken) {
    try {
      // Handle mock authentication for development
      if (mockToken && mockToken.startsWith('mock-jwt-token-')) {
        // Mock successful authentication
        const mockUser = {
          id: 'dev-user-123',
          name: 'Developer',
          email: 'dev@example.com',
          skills: ['React', 'JavaScript', 'Node.js'],
          experienceLevel: 'Intermediate',
          location: 'Remote'
        };
        
        this.token = mockToken;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return {
          success: true,
          token: mockToken,
          user: mockUser
        };
      }
      
      // For production, redirect to Google OAuth
      throw new Error('Please use Google Sign-In');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.token && !!this.getCurrentUser();
  }

  async getProfile() {
    try {
      const response = await axios.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axios.put('/user/profile', profileData);
      if (response.data.success) {
        // Update stored user data
        const updatedUser = { ...this.getCurrentUser(), ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return response.data;
      }
      throw new Error(response.data.message || 'Profile update failed');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}

export default new AuthService();