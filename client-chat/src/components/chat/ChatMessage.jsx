import React from 'react';
import { User, Bot, Briefcase, ExternalLink, Bookmark } from 'lucide-react';
import JobCard from '../jobs/JobCard';

const ChatMessage = ({ message, isUser, jobs, onSaveJob, onApplyJob }) => {
  const formatMessage = (text) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? (
          <User size={20} />
        ) : (
          <Bot size={20} />
        )}
      </div>
      
      <div className="message-content">
        <div className="message-bubble">
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
          />
          
          {jobs && jobs.length > 0 && (
            <div className="job-results">
              <div className="job-results-header">
                <Briefcase size={16} />
                <span>{jobs.length} Jobs Found</span>
              </div>
              
              <div className="job-cards">
                {jobs.map((job, index) => (
                  <JobCard 
                    key={job.id || index}
                    job={job}
                    onSave={() => onSaveJob?.(job)}
                    onApply={() => onApplyJob?.(job)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="message-timestamp">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;