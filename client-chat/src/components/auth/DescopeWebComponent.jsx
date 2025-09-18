import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const DescopeWebComponent = () => {
  const navigate = useNavigate();
  const descopeRef = useRef(null);
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const [descopeError, setDescopeError] = useState(null);
  const [isDescopeLoaded, setIsDescopeLoaded] = useState(false);
  
  const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Load Descope web component script
    const loadDescopeScript = () => {
      if (document.querySelector('script[src*="descope"]')) {
        setIsDescopeLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@descope/web-component@latest/dist/index.js';
      script.onload = () => {
        setIsDescopeLoaded(true);
      };
      script.onerror = () => {
        setDescopeError("Failed to load authentication component");
      };
      document.head.appendChild(script);
    };

    loadDescopeScript();
  }, []);

  useEffect(() => {
    if (!isDescopeLoaded || !descopeRef.current || !projectId) return;

    const descopeElement = descopeRef.current;

    const handleSuccess = async (e) => {
      try {
        const { sessionToken } = e.detail;
        await login(sessionToken);
        navigate("/chat");
      } catch (error) {
        console.error("Login failed:", error);
        setDescopeError("Login failed. Please try again.");
      }
    };

    const handleError = (e) => {
      console.error("Descope error:", e.detail);
      setDescopeError("Authentication failed. Please try again.");
    };

    // Add event listeners
    descopeElement.addEventListener('success', handleSuccess);
    descopeElement.addEventListener('error', handleError);

    return () => {
      descopeElement.removeEventListener('success', handleSuccess);
      descopeElement.removeEventListener('error', handleError);
    };
  }, [isDescopeLoaded, login, navigate, projectId]);

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
        ) : isDescopeLoaded ? (
          <div className="descope-wrapper">
            <descope-wc
              ref={descopeRef}
              project-id={projectId}
              flow-id="sign-up-or-in"
            />
          </div>
        ) : (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading authentication...</p>
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

export default DescopeWebComponent;