import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from './LoadingScreen';
import toast from 'react-hot-toast';

/*
  GOOGLE OAUTH SETUP REQUIRED:
  1. Go to https://console.cloud.google.com/
  2. Create a new project or select existing
  3. Enable Google+ API or Google Identity API
  4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
  5. Set Application type to "Web application"
  6. Add Authorized JavaScript origins: http://localhost:3000 (your dev server)
  7. Copy the Client ID and replace it in handleGoogleLogin function below
  8. For production, add your production domain to authorized origins
*/

// Load Google Identity Services
if (typeof window !== 'undefined' && !window.google) {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  document.head.appendChild(script);
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const isAuthenticated = !!(user && user.id);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Client ID not configured');
      return;
    }
    
    if (!window.google) {
      toast.error('Google Sign-In not loaded. Please refresh and try again.');
      return;
    }

    try {
      // Clear any existing button
      const buttonContainer = document.getElementById('google-button-container');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false
      });
      
      // Render Google button directly (no popup)
      window.google.accounts.id.renderButton(
        buttonContainer,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with'
        }
      );
      
      // Hide custom button, show Google button
      document.getElementById('custom-google-btn').style.display = 'none';
      buttonContainer.style.display = 'block';
      
    } catch (error) {
      console.error('Google initialization error:', error);
      toast.error('Google Sign-In configuration error. Please check your setup.');
    }
  };

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Validate required fields
      if (!payload.sub || !payload.name || !payload.email) {
        throw new Error('Incomplete user data from Google');
      }

      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=4285F4&color=fff`,
        provider: 'google',
        verified: payload.email_verified || false
      };
      
      await login(userData);
      toast.success(`Welcome ${payload.name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };



  if (authLoading || isLoading) {
    return <LoadingScreen message="Logging you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            AI Job Hunter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600"
          >
            Your intelligent career assistant powered by AI
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Sign in to access your personalized job hunting assistant
          </p>

          {/* Google Login Button */}
          <motion.button
            id="custom-google-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </motion.button>
          
          {/* Google Button Container */}
          <div id="google-button-container" className="mb-6" style={{display: 'none'}}></div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-powered job recommendations
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Interview preparation & coaching
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Resume analysis & optimization
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                24/7 career guidance chat
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;