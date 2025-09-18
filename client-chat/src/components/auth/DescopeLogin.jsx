import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Descope, DescopeProvider } from "@descope/react-sdk";
import useAuthStore from "../../store/authStore";

const DescopeLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const [descopeError, setDescopeError] = useState(null);
  
  const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID;
  
  // Validate environment variables
  if (!projectId) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="error-message">
            Missing Descope Project ID. Please check your environment configuration.
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (e) => {
    const { sessionToken } = e.detail;
    try {
      await login(sessionToken);
      navigate("/chat");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleError = (e) => {
    console.error("Descope error:", e.detail);
    setDescopeError("Authentication failed. Please try again.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎯 AI Job Hunter</h1>
          <p>Your intelligent job search companion</p>
        </div>
        
        {(error || descopeError) && (
          <div className="error-message">
            {error || descopeError}
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Signing you in...</p>
          </div>
        ) : (
          <div className="descope-wrapper">
            <DescopeProvider projectId={projectId}>
              <Descope
                flowId="sign-up-or-in"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </DescopeProvider>
          </div>
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

export default DescopeLogin;