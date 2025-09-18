import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';

export const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      messages: [],
      isTyping: false,
      context: 'jobHunting', // jobHunting, interview, resume, career
      currentSession: null,
      history: [],
      starters: {},
      insights: [],

      // Initialize chat
      initializeChat: async (userId) => {
        try {
          // Load conversation history
          try {
            const historyResponse = await chatService.getConversationHistory();
            if (historyResponse.success) {
              set({ history: historyResponse.history });
            }
          } catch (error) {
            console.warn('Could not load conversation history:', error);
          }

          // Load conversation starters
          try {
            const startersResponse = await chatService.getConversationStarters();
            if (startersResponse.success) {
              set({ starters: startersResponse.starters });
            }
          } catch (error) {
            console.warn('Could not load conversation starters:', error);
          }
        } catch (error) {
          console.error('Chat initialization error:', error);
        }
      },

      // Send message to AI
      sendMessage: async (message, context = null) => {
        const currentContext = context || get().context;
        const messageId = Date.now().toString();
        
        // Add user message
        const userMessage = {
          id: messageId,
          content: message,
          role: 'user',
          timestamp: new Date().toISOString(),
          context: currentContext
        };

        set(state => ({
          messages: [...state.messages, userMessage],
          isLoading: true
        }));

        try {
          // Call actual AI service
          const response = await chatService.sendMessage(message, currentContext);
          
          if (response.success) {
            const aiMessage = {
              id: messageId + '_ai',
              content: response.message || response.response,
              role: 'assistant',
              timestamp: new Date().toISOString(),
              context: currentContext
            };

            set(state => ({
              messages: [...state.messages, aiMessage],
              isLoading: false
            }));
          } else {
            throw new Error(response.error || 'Failed to get AI response');
          }


        } catch (error) {
          console.error('Send message error:', error);
          
          // Add error message
          const errorMessage = {
            id: messageId + '_error',
            content: 'Sorry, I encountered an error. Please try again.',
            role: 'assistant',
            timestamp: new Date().toISOString(),
            context: currentContext,
            error: true
          };

          set(state => ({
            messages: [...state.messages, errorMessage],
            isLoading: false
          }));

          toast.error('Failed to send message');
        }
      },

      // Start interview practice
      startInterviewPractice: async (jobRole, experienceLevel, interviewType = 'mixed') => {
        set({ isTyping: true });
        
        try {
          const response = await chatService.startInterview(jobRole, experienceLevel, interviewType);
          
          if (response.success) {
            const sessionMessage = {
              id: 'interview_start_' + Date.now(),
              text: response.message,
              sender: 'ai',
              timestamp: new Date(),
              context: 'interview',
              sessionData: response.session,
              currentQuestion: response.currentQuestion
            };

            set(state => ({
              messages: [...state.messages, sessionMessage],
              currentSession: response.session,
              context: 'interview',
              isTyping: false
            }));
          }
        } catch (error) {
          console.error('Start interview error:', error);
          set({ isTyping: false });
          toast.error('Failed to start interview practice');
        }
      },

      // Continue interview practice
      continueInterview: async (answer, questionIndex) => {
        const session = get().currentSession;
        if (!session) return;

        set({ isTyping: true });

        try {
          const response = await chatService.continueInterview(
            session.sessionId,
            answer,
            questionIndex
          );

          if (response.success) {
            const feedbackMessage = {
              id: 'interview_feedback_' + Date.now(),
              text: response.message,
              sender: 'ai',
              timestamp: new Date(),
              context: 'interview',
              evaluation: response.evaluation,
              sessionComplete: response.sessionComplete
            };

            set(state => ({
              messages: [...state.messages, feedbackMessage],
              isTyping: false,
              currentSession: response.sessionComplete ? null : session
            }));
          }
        } catch (error) {
          console.error('Continue interview error:', error);
          set({ isTyping: false });
          toast.error('Failed to process interview answer');
        }
      },

      // Get job insights
      getJobInsights: async (jobs, userProfile) => {
        try {
          const response = await chatService.getJobInsights(jobs, userProfile);
          
          if (response.success) {
            set({ insights: response.insights });
            return response.insights;
          }
        } catch (error) {
          console.error('Get job insights error:', error);
          toast.error('Failed to get job insights');
        }
      },

      // Evaluate interview answer
      evaluateAnswer: async (question, answer, jobRole) => {
        try {
          const response = await chatService.evaluateAnswer(question, answer, jobRole);
          return response;
        } catch (error) {
          console.error('Evaluate answer error:', error);
          toast.error('Failed to evaluate answer');
        }
      },

      // Generate interview questions
      generateQuestions: async (jobRole, experienceLevel, count = 10) => {
        try {
          const response = await chatService.generateQuestions(jobRole, experienceLevel, count);
          return response;
        } catch (error) {
          console.error('Generate questions error:', error);
          toast.error('Failed to generate questions');
        }
      },

      // Get career advice
      getCareerAdvice: async (situation, userProfile) => {
        set({ isTyping: true });
        
        try {
          const response = await chatService.getCareerAdvice(situation, userProfile);
          
          if (response.success) {
            const adviceMessage = {
              id: 'career_advice_' + Date.now(),
              text: response.response,
              sender: 'ai',
              timestamp: new Date(),
              context: 'career'
            };

            set(state => ({
              messages: [...state.messages, adviceMessage],
              isTyping: false
            }));
          }
        } catch (error) {
          console.error('Get career advice error:', error);
          set({ isTyping: false });
          toast.error('Failed to get career advice');
        }
      },

      // Switch context
      setContext: (newContext) => {
        set({ context: newContext });
        
        // Add context switch message
        const contextMessages = {
          jobHunting: "🎯 Switched to Job Hunting mode. I'm here to help you with job search strategies, applications, and career planning!",
          interview: "🎤 Switched to Interview Preparation mode. Let's practice interviews and improve your skills!",
          resume: "📄 Switched to Resume Optimization mode. I'll help you create and improve your resume!",
          career: "🚀 Switched to Career Guidance mode. Let's plan your career growth and development!"
        };

        const contextMessage = {
          id: 'context_' + Date.now(),
          text: contextMessages[newContext] || contextMessages.jobHunting,
          sender: 'ai',
          timestamp: new Date(),
          context: newContext,
          isContextSwitch: true
        };

        set(state => ({
          messages: [...state.messages, contextMessage]
        }));
      },

      // Clear conversation
      clearConversation: async () => {
        try {
          await chatService.clearHistory();
          set({ messages: [], currentSession: null });
          toast.success('Conversation cleared');
        } catch (error) {
          console.error('Clear conversation error:', error);
          // Clear locally even if server request fails
          set({ messages: [], currentSession: null });
          toast.success('Conversation cleared locally');
        }
      },

      // Remove message
      removeMessage: (messageId) => {
        set(state => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }));
      },

      // Add system message
      addSystemMessage: (text, context = null) => {
        const systemMessage = {
          id: 'system_' + Date.now(),
          text,
          sender: 'system',
          timestamp: new Date(),
          context: context || get().context
        };

        set(state => ({
          messages: [...state.messages, systemMessage]
        }));
      },

      // Get conversation starters for current context
      getContextStarters: () => {
        const { starters, context } = get();
        return starters[context] || [];
      },

      // Load more history
      loadHistory: async () => {
        try {
          const response = await chatService.getHistory();
          if (response.success) {
            set({ history: response.history });
          }
        } catch (error) {
          console.error('Load history error:', error);
        }
      },

      // Get conversation starters
      getConversationStarters: async () => {
        try {
          const starters = [
            {
              icon: '🎯',
              title: 'Job Search Strategy',
              description: 'Get personalized job search advice',
              text: 'Help me create an effective job search strategy for my career goals'
            },
            {
              icon: '📄',
              title: 'Resume Optimization',
              description: 'Improve your resume for better results',
              text: 'How can I optimize my resume to get more interviews?'
            },
            {
              icon: '🎤',
              title: 'Interview Preparation',
              description: 'Master your interview skills',
              text: 'Help me prepare for upcoming job interviews with practice questions'
            },
            {
              icon: '🚀',
              title: 'Career Development',
              description: 'Plan your professional growth',
              text: 'What steps should I take to advance my career in the next 2-3 years?'
            },
            {
              icon: '💰',
              title: 'Salary Negotiation',
              description: 'Learn to negotiate better compensation',
              text: 'How should I approach salary negotiation for my next role?'
            },
            {
              icon: '🌐',
              title: 'Professional Networking',
              description: 'Build valuable professional connections',
              text: 'What are the best strategies for professional networking in my industry?'
            }
          ];
          set({ conversationStarters: starters });
        } catch (error) {
          console.error('Get starters error:', error);
        }
      },

      // Clear messages
      clearMessages: () => {
        set({ messages: [], currentSession: null });
      },

      // Loading state
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Conversation starters
      conversationStarters: []
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        context: state.context,
      }),
    }
  )
);