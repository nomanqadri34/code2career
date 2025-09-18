import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import JobSearch from './components/JobSearch';
import InterviewPrep from './components/InterviewPrep';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Profile from './components/Profile';
import LoadingScreen from './components/LoadingScreen';

// Hooks and stores
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import authService from './services/authService';

function App() {
  const { user, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const { initializeChat } = useChatStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    // Mark as hydrated to prevent SSR issues
    setIsHydrated(true);
    
    // Initialize authentication on app start
    if (!isInitialized) {
      initializeAuth();
    }
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
    } else if (token) {
      // Process OAuth token
      authService.handleOAuthCallback();
    }
  }, [isInitialized]); // Depend on isInitialized

  useEffect(() => {
    // Initialize chat when user is authenticated
    if (user && user.id) {
      initializeChat(user.id);
    }
  }, [user?.id]); // Only depend on user.id

  // Show loading screen until both hydrated and initialized
  if (!isHydrated || isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <LandingPage />
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? <Dashboard /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/chat" 
              element={
                user ? <ChatInterface /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/jobs" 
              element={
                user ? <JobSearch /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/job-search" 
              element={
                user ? <JobSearch /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/interview" 
              element={
                user ? <InterviewPrep /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/interview-prep" 
              element={
                user ? <InterviewPrep /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/resume" 
              element={
                user ? <ResumeAnalyzer /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/resume-analyzer" 
              element={
                user ? <ResumeAnalyzer /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? <Profile /> : <Navigate to="/login" replace />
              } 
            />
            
            {/* Auth callback */}
            <Route 
              path="/auth/callback" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* 404 fallback */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-xl mb-8">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </AnimatePresence>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;