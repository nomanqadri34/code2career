import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Upload, User, Settings, LogOut, Briefcase } from 'lucide-react';
import ChatMessage from './ChatMessage';
import useAuthStore from '../../store/authStore';
import chatService from '../../services/chatService';
import jobService from '../../services/jobService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user, logout } = useAuthStore();

  useEffect(() => {
    // Initial welcome message
    setMessages([{
      id: 1,
      message: `👋 Hi ${user?.name || 'there'}! I'm your AI job search assistant. I can help you find perfect job opportunities, give career advice, and prepare for interviews. What can I help you with today?`,
      isUser: false,
      timestamp: new Date()
    }]);

    // Load user context for better AI responses
    loadUserContext();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserContext = async () => {
    try {
      // You can load user profile, preferences, etc. from backend
      // This is a simplified version
      const context = {
        skills: user?.skills || [],
        experienceLevel: user?.experienceLevel || 'Entry Level',
        location: user?.location || 'Remote',
        jobTypes: user?.jobPreferences || ['Full Time']
      };
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    const userMsgId = Date.now();
    setMessages(prev => [...prev, {
      id: userMsgId,
      message: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);

    try {
      // Get AI response
      const response = await chatService.processJobSearchMessage(userMessage, userContext);
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        id: userMsgId + 1,
        message: response.message,
        isUser: false,
        timestamp: new Date(),
        jobs: response.jobs,
        type: response.type
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: userMsgId + 1,
        message: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      await jobService.saveJob(job.id || job.job_id);
      // Show success feedback
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: `✅ Saved "${job.title || job.job_title}" to your bookmarks!`,
        isUser: false,
        timestamp: new Date(),
        type: 'success'
      }]);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApplyJob = (job) => {
    if (job.apply_link || job.job_apply_link) {
      window.open(job.apply_link || job.job_apply_link, '_blank');
    } else {
      // Show application form or redirect to company page
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: `I'll help you apply to "${job.title || job.job_title}". Let me know if you need help crafting your application!`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    "Find software developer jobs",
    "Show me remote positions",
    "Help me improve my resume",
    "Prepare for technical interviews",
    "What's trending in tech jobs?"
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <Briefcase size={24} />
          <h1>AI Job Hunter</h1>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <User size={18} />
            <span>{user?.name || 'User'}</span>
          </div>
          <button className="settings-btn" title="Settings">
            <Settings size={18} />
          </button>
          <button className="logout-btn" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <div className="messages">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.message}
              isUser={message.isUser}
              jobs={message.jobs}
              timestamp={message.timestamp}
              onSaveJob={handleSaveJob}
              onApplyJob={handleApplyJob}
            />
          ))}
          {isLoading && (
            <div className="loading-message">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="quick-actions">
          <div className="quick-actions-title">Quick Actions:</div>
          <div className="quick-actions-buttons">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-actions">
            <button type="button" className="input-action-btn" title="Upload resume">
              <Upload size={18} />
            </button>
            <button type="button" className="input-action-btn" title="Voice input">
              <Mic size={18} />
            </button>
          </div>
          
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about jobs, career advice, or interview prep..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            className="send-btn"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;