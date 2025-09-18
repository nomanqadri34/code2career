import api from './api';

class DashboardService {
  async getDashboardData() {
    try {
      // Return mock data since backend endpoints don't exist
      return {
        success: true,
        data: {
          stats: {
            jobsApplied: 0,
            interviewsScheduled: 0,
            profileViews: 0,
            responseRate: 0
          },
          recentActivity: [],
          recommendations: []
        }
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  async getAIInsights() {
    try {
      const response = await api.get('/dashboard/insights');
      return response.data;
    } catch (error) {
      console.error('Get AI insights error:', error);
      throw error;
    }
  }

  async getRecommendations() {
    try {
      const response = await api.get('/dashboard/recommendations');
      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }

  async getMarketInsights() {
    try {
      const response = await api.get('/dashboard/market');
      return response.data;
    } catch (error) {
      console.error('Get market insights error:', error);
      throw error;
    }
  }

  async trackActivity(activityType, details = {}) {
    try {
      // Return success without making API call
      return { success: true };
    } catch (error) {
      console.error('Track activity error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new DashboardService();