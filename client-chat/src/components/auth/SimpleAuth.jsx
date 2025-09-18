import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const SimpleAuth = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      // For testing purposes, let's simulate a successful login
      // In a real app, you would call your authentication API here
      const mockToken = 'mock-jwt-token-' + Date.now();
      await login(mockToken);
      navigate("/chat");
    } catch (error) {
      console.error('Login failed:', error);
      setLocalError('Authentication failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Skip authentication for development (temporary)
  const handleSkipAuth = () => {
    // Create a mock user for development
    const mockUser = {
      id: 'dev-user-123',
      name: 'Developer',
      email: 'dev@example.com'
    };
    
    localStorage.setItem('token', 'dev-token-123');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Update auth store
    useAuthStore.getState().initializeAuth();
    navigate("/chat");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎯 AI Job Hunter</h1>
          <p>Your intelligent job search companion</p>
        </div>
        
        {(error || localError) && (
          <div className="error-message">
            {error || localError}
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Signing you in...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="toggle-auth"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </form>
            
            {/* Development skip option */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                onClick={handleSkipAuth}
                className="skip-auth-btn"
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Skip Auth (Dev Mode)
              </button>
            </div>
          </>
        )}
        
        <div className="features-preview">
          <h3>✨ What you can do:</h3>
          <ul>
            <li>💬 Chat with AI to find perfect jobs</li>
            <li>📄 Upload resume for smart matching</li>
            <li>🎯 Get personalized job recommendations</li>
            <li>📅 Schedule interviews with calendar integration</li>
            <li>🚀 Prepare for interviews with AI coaching</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuth;