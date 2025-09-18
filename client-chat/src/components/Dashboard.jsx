import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
// Removed dashboardService import to avoid backend dependency
import LoadingScreen from './LoadingScreen';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Memoize user to prevent unnecessary re-renders
  const currentUser = React.useMemo(() => user, [user?.id, user?.name]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setDashboardData({
      stats: {
        appliedJobs: 0,
        interviewsScheduled: 0,
        resumeScore: 0,
        profileViews: 0,
        conversionRate: 0,
        competitivenessRating: 0,
        skillAlignment: 0,
        weeklyTrend: 'stable',
        aiGenerated: false
      },
      recentApplications: [],
      quickActions: [
        {
          title: "AI Chat Assistant",
          description: "Get personalized career advice",
          icon: "chat",
          action: () => navigate('/chat'),
          color: "from-blue-500 to-blue-600"
        },
        {
          title: "Smart Job Search",
          description: "Find your next opportunity",
          icon: "search",
          action: () => navigate('/job-search'),
          color: "from-green-500 to-green-600"
        },
        {
          title: "AI Interview Coach",
          description: "Practice with AI coaching",
          icon: "interview",
          action: () => navigate('/interview-prep'),
          color: "from-purple-500 to-purple-600"
        },
        {
          title: "Resume Optimizer",
          description: "AI-powered resume analysis",
          icon: "resume",
          action: () => navigate('/resume-analyzer'),
          color: "from-orange-500 to-orange-600"
        }
      ],
      recommendations: [],
      marketInsights: {},
      aiInsights: []
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'interview scheduled':
        return 'bg-green-100 text-green-800';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderIcon = (iconType, className = "w-6 h-6") => {
    const icons = {
      chat: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      search: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      interview: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      resume: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };
    return icons[iconType] || icons.chat;
  };

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AI Job Hunter</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Demo User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Let's continue building your career. Here's your latest progress and opportunities.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: "Jobs Applied", 
              value: dashboardData.stats.appliedJobs, 
              color: "text-blue-600", 
              bg: "bg-blue-50",
              trend: dashboardData.stats.weeklyTrend,
              ai: dashboardData.stats.aiGenerated
            },
            { 
              label: "Interviews", 
              value: dashboardData.stats.interviewsScheduled, 
              color: "text-green-600", 
              bg: "bg-green-50",
              subtitle: `${dashboardData.stats.conversionRate || 0}% rate`
            },
            { 
              label: "Resume Score", 
              value: `${dashboardData.stats.resumeScore || 0}%`, 
              color: "text-purple-600", 
              bg: "bg-purple-50",
              subtitle: "AI Optimized"
            },
            { 
              label: "Market Position", 
              value: `${dashboardData.stats.competitivenessRating || 0}/100`, 
              color: "text-orange-600", 
              bg: "bg-orange-50",
              subtitle: "Competitiveness"
            }
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bg} rounded-lg mb-4`}>
                <span className={`text-xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toString().charAt(0) : stat.value.charAt(0)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {stat.ai && (
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI
                  </div>
                )}
              </div>
              <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              )}
              {stat.trend && (
                <div className={`text-xs mt-1 ${
                  stat.trend === 'increasing' ? 'text-green-600' : 
                  stat.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'increasing' ? '↗️ Trending up' : 
                   stat.trend === 'decreasing' ? '↘️ Trending down' : '➡️ Stable'}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* AI Insights Section */}
        {dashboardData.aiInsights && dashboardData.aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.aiInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`p-4 rounded-xl border-l-4 ${
                    insight.type === 'improvement' ? 'border-orange-500 bg-orange-50' :
                    insight.type === 'skill' ? 'border-purple-500 bg-purple-50' :
                    insight.type === 'opportunity' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{insight.message}</p>
                  {insight.action && insight.route && (
                    <button
                      onClick={() => navigate(insight.route)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {insight.action} →
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {dashboardData.quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white`}>
                      {renderIcon(action.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <button 
                onClick={() => navigate('/applications')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {dashboardData.recentApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{application.title}</h3>
                          {application.aiScore && (
                            <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              AI Score: {application.aiScore}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{application.company}</p>
                        {application.aiInsight && (
                          <p className="text-xs text-blue-600 mb-2 italic">
                            💡 {application.aiInsight}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Applied {application.appliedDate}</span>
                          <span className="font-medium text-gray-900">{application.salary}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;