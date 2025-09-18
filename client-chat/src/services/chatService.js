import api from './api';

class ChatService {
  // Send message to AI assistant
  async sendMessage(message, conversationType = 'general') {
    try {
      const response = await api.post('/api/chat/message', {
        message,
        conversationType
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error.response?.data || { error: 'Failed to send message' };
    }
  }

  // Get conversation history
  async getConversationHistory() {
    return { success: true, conversations: [] };
  }

  // Start interview session
  async startInterview(jobTitle, jobDescription, interviewType = 'general') {
    try {
      const response = await api.post('/api/chat/interview/start', {
        jobTitle,
        jobDescription,
        interviewType
      });
      return response.data;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error.response?.data || { error: 'Failed to start interview' };
    }
  }

  // Evaluate interview answer
  async evaluateAnswer(question, answer) {
    try {
      const response = await api.post('/api/chat/interview/evaluate', {
        question,
        answer
      });
      return response.data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw error.response?.data || { error: 'Failed to evaluate answer' };
    }
  }

  // Get career advice
  async getCareerAdvice(topic) {
    try {
      const response = await api.post('/api/chat/career-advice', {
        topic
      });
      return response.data;
    } catch (error) {
      console.error('Error getting career advice:', error);
      throw error.response?.data || { error: 'Failed to get career advice' };
    }
  }

  // Get conversation starters
  async getConversationStarters() {
    return {
      success: true,
      starters: [
        "Help me prepare for a technical interview",
        "Review my resume and suggest improvements",
        "Find jobs matching my skills",
        "Create a career development plan"
      ]
    };
  }

  // Upload and analyze resume
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error.response?.data || { error: 'Failed to upload resume' };
    }
  }

  // Get job recommendations
  async getJobRecommendations(preferences = {}) {
    try {
      const response = await api.post('/api/jobs/recommendations', preferences);
      return response.data;
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      throw error.response?.data || { error: 'Failed to fetch job recommendations' };
    }
  }

  // Search jobs
  async searchJobs(query, filters = {}) {
    try {
      const response = await api.post('/api/jobs/search', {
        query,
        ...filters
      });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error.response?.data || { error: 'Failed to search jobs' };
    }
  }

  // Apply to job
  async applyToJob(jobId, coverLetter) {
    try {
      const response = await api.post('/api/jobs/apply', {
        jobId,
        coverLetter
      });
      return response.data;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error.response?.data || { error: 'Failed to apply to job' };
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data || { error: 'Failed to fetch user profile' };
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const response = await api.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error.response?.data || { error: 'Failed to update user profile' };
    }
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await api.get('/api/user/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error.response?.data || { error: 'Failed to fetch dashboard data' };
    }
  }

  // Get job applications
  async getJobApplications() {
    try {
      const response = await api.get('/api/user/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error.response?.data || { error: 'Failed to fetch job applications' };
    }
  }
}

export default new ChatService();