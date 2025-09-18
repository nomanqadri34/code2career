import geminiService from './geminiService.js';
import jobService from './jobService.js';
import resumeService from './resumeService.js';

class DashboardService {
  constructor() {
    // User activity cache to track behavior patterns
    this.userActivityCache = new Map();
    this.insightsCache = new Map();
  }

  async getUserDashboardData(userId, userProfile) {
    try {
      console.log('🔍 Dashboard service - Getting data for user:', userId);
      console.log('👤 User profile:', JSON.stringify(userProfile, null, 2));
      
      // Get cached insights if available and recent
      const cacheKey = `dashboard_${userId}`;
      const cached = this.insightsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < 30 * 60 * 1000)) { // 30 minutes
        console.log('📦 Using cached dashboard data');
        return cached.data;
      }

      // Generate AI-powered dashboard insights
      const [stats, recentActivity, recommendations, marketInsights] = await Promise.all([
        this.generateUserStats(userId, userProfile),
        this.getRecentUserActivity(userId),
        this.generatePersonalizedRecommendations(userId, userProfile),
        this.getMarketInsights(userProfile)
      ]);

      console.log('⚙️ Generating quick actions and AI insights...');
      const quickActions = await this.generateSmartQuickActions(userProfile);
      const aiInsights = await this.generateAIInsights(userProfile, stats);
      
      const dashboardData = {
        stats,
        recentActivity,
        recommendations,
        marketInsights,
        quickActions,
        aiInsights,
        generatedAt: new Date()
      };
      
      console.log('✅ Dashboard data compiled successfully');

      // Cache the results
      this.insightsCache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      });

      return {
        success: true,
        dashboardData
      };

    } catch (error) {
      console.error('❌ Dashboard service error:', error.message);
      console.error('🔍 Stack trace:', error.stack);
      console.log('🛠️ Falling back to mock data');
      return this.getFallbackDashboard(userProfile);
    }
  }

  async generateUserStats(userId, userProfile) {
    try {
      // Simulate user activity data (in real app, this would come from database)
      const activity = this.getUserActivity(userId);
      
      // Use AI to analyze user behavior and generate insights
      const prompt = `Analyze this user's career hunting activity and generate meaningful statistics:

User Profile:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Industry: ${userProfile.industry || 'Technology'}

Recent Activity:
- Profile views: ${activity.profileViews}
- Job searches performed: ${activity.jobSearches}
- Applications submitted: ${activity.applications}
- Interview preparations: ${activity.interviewPreps}
- Resume updates: ${activity.resumeUpdates}

Generate statistics that would be meaningful for career progress tracking. Include:
1. Applications to interview conversion rate
2. Profile optimization score
3. Job market competitiveness rating
4. Skill alignment score with target roles
5. Weekly activity trends

Format as JSON with: appliedJobs, interviewsScheduled, resumeScore, profileViews, conversionRate, competitivenessRating, skillAlignment, weeklyTrend.`;

      const aiResponse = await geminiService.generateResponse(prompt, userId, 'career');
      
      if (aiResponse.success) {
        try {
          // Try to parse AI response as JSON
          const stats = JSON.parse(aiResponse.response.replace(/```json\n?|\n?```/g, ''));
          return {
            ...stats,
            aiGenerated: true
          };
        } catch {
          // If parsing fails, use the text response to generate stats
          return this.parseStatsFromText(aiResponse.response, activity);
        }
      }

      return this.generateMockStats(activity);

    } catch (error) {
      console.error('Generate user stats error:', error.message);
      return this.generateMockStats(this.getUserActivity(userId));
    }
  }

  parseStatsFromText(aiText, activity) {
    // Extract numbers and insights from AI text response
    const appliedJobs = this.extractNumber(aiText, 'applied|applications') || activity.applications;
    const interviews = this.extractNumber(aiText, 'interview') || Math.floor(activity.applications * 0.3);
    const resumeScore = this.extractNumber(aiText, 'resume.*score|score.*resume') || (75 + Math.random() * 20);
    
    return {
      appliedJobs,
      interviewsScheduled: interviews,
      resumeScore: Math.round(resumeScore),
      profileViews: activity.profileViews,
      conversionRate: appliedJobs > 0 ? Math.round((interviews / appliedJobs) * 100) : 0,
      competitivenessRating: Math.round(70 + Math.random() * 25),
      skillAlignment: Math.round(65 + Math.random() * 30),
      weeklyTrend: Math.random() > 0.5 ? 'increasing' : 'stable',
      aiGenerated: true
    };
  }

  extractNumber(text, pattern) {
    const regex = new RegExp(`${pattern}[^\\d]*([\\d\\.]+)`, 'i');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  }

  getUserActivity(userId) {
    // Simulate user activity (in real app, fetch from database)
    const baseActivity = {
      profileViews: Math.floor(50 + Math.random() * 200),
      jobSearches: Math.floor(10 + Math.random() * 40),
      applications: Math.floor(5 + Math.random() * 25),
      interviewPreps: Math.floor(2 + Math.random() * 10),
      resumeUpdates: Math.floor(1 + Math.random() * 5)
    };

    // Cache activity for consistency
    if (!this.userActivityCache.has(userId)) {
      this.userActivityCache.set(userId, baseActivity);
    }
    
    return this.userActivityCache.get(userId);
  }

  async getRecentUserActivity(userId) {
    try {
      // Simulate recent activity data
      const activities = [
        {
          id: 1,
          type: 'application',
          title: 'Applied to Senior Developer at TechCorp',
          status: 'pending',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          aiScore: Math.round(75 + Math.random() * 20)
        },
        {
          id: 2,
          type: 'interview',
          title: 'Interview scheduled with StartupXYZ',
          status: 'scheduled',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          aiScore: Math.round(80 + Math.random() * 15)
        },
        {
          id: 3,
          type: 'resume',
          title: 'Resume updated with AI suggestions',
          status: 'completed',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          aiScore: Math.round(85 + Math.random() * 10)
        }
      ];

      return activities.map(activity => ({
        ...activity,
        aiInsight: this.generateActivityInsight(activity)
      }));

    } catch (error) {
      console.error('Get recent activity error:', error.message);
      return [];
    }
  }

  generateActivityInsight(activity) {
    const insights = {
      application: [
        'Strong keyword match with job requirements',
        'Resume optimized for ATS scanning',
        'Application timing is optimal',
        'Company culture alignment detected'
      ],
      interview: [
        'Practice sessions recommended for technical questions',
        'Company research completed and up-to-date',
        'Behavioral questions preparation suggested',
        'Mock interview scheduled'
      ],
      resume: [
        'ATS compatibility improved by 15%',
        'Keywords optimization successful',
        'Achievement metrics added',
        'Format standardization completed'
      ]
    };

    const categoryInsights = insights[activity.type] || insights.application;
    return categoryInsights[Math.floor(Math.random() * categoryInsights.length)];
  }

  async generatePersonalizedRecommendations(userId, userProfile) {
    try {
      const prompt = `Based on this user profile, generate 5 personalized career recommendations:

User Profile:
- Skills: ${userProfile.skills?.join(', ') || 'General'}
- Experience: ${userProfile.experienceLevel || 'Entry level'}
- Location: ${userProfile.location || 'Remote'}
- Goals: ${userProfile.careerGoals || 'Career advancement'}

Generate specific, actionable recommendations that would help advance their career. Each recommendation should include:
- Title (action-oriented)
- Description (why it's important)
- Priority (high/medium/low)
- Timeline (this week/this month/next quarter)

Focus on skill development, networking, job search strategies, and career growth opportunities.`;

      const aiResponse = await geminiService.generateResponse(prompt, userId, 'career');
      
      if (aiResponse.success) {
        return this.parseRecommendationsFromText(aiResponse.response);
      }

      return this.getFallbackRecommendations(userProfile);

    } catch (error) {
      console.error('Generate recommendations error:', error.message);
      return this.getFallbackRecommendations(userProfile);
    }
  }

  parseRecommendationsFromText(aiText) {
    const recommendations = [];
    const lines = aiText.split('\n').filter(line => line.trim());
    
    let currentRec = {};
    for (const line of lines) {
      if (line.includes(':') && !currentRec.title) {
        currentRec.title = line.split(':')[0].replace(/^\d+\.?\s*/, '').trim();
        currentRec.description = line.split(':').slice(1).join(':').trim();
      } else if (line.toLowerCase().includes('priority')) {
        currentRec.priority = this.extractPriority(line);
      } else if (line.toLowerCase().includes('timeline')) {
        currentRec.timeline = this.extractTimeline(line);
        recommendations.push(currentRec);
        currentRec = {};
      }
    }

    // Fill in missing recommendations
    while (recommendations.length < 5) {
      recommendations.push(this.getRandomRecommendation());
    }

    return recommendations.slice(0, 5);
  }

  extractPriority(text) {
    const priorities = ['high', 'medium', 'low'];
    for (const priority of priorities) {
      if (text.toLowerCase().includes(priority)) {
        return priority;
      }
    }
    return 'medium';
  }

  extractTimeline(text) {
    const timelines = ['this week', 'this month', 'next quarter'];
    for (const timeline of timelines) {
      if (text.toLowerCase().includes(timeline)) {
        return timeline;
      }
    }
    return 'this month';
  }

  getRandomRecommendation() {
    const recommendations = [
      {
        title: 'Update LinkedIn Profile',
        description: 'Optimize your LinkedIn profile with recent achievements and skills',
        priority: 'high',
        timeline: 'this week'
      },
      {
        title: 'Practice Technical Interviews',
        description: 'Schedule mock interviews to improve your technical communication',
        priority: 'high',
        timeline: 'this month'
      },
      {
        title: 'Learn Trending Technology',
        description: 'Add a new in-demand skill to your toolkit',
        priority: 'medium',
        timeline: 'next quarter'
      },
      {
        title: 'Network with Industry Professionals',
        description: 'Connect with professionals in your target companies',
        priority: 'medium',
        timeline: 'this month'
      },
      {
        title: 'Contribute to Open Source',
        description: 'Build your portfolio with meaningful open source contributions',
        priority: 'low',
        timeline: 'next quarter'
      }
    ];

    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  async getMarketInsights(userProfile) {
    try {
      const prompt = `Provide current job market insights for someone with this profile:

Skills: ${userProfile.skills?.join(', ') || 'Technology'}
Experience: ${userProfile.experienceLevel || 'Entry level'}
Industry: ${userProfile.industry || 'Technology'}
Location: ${userProfile.location || 'Remote'}

Include:
1. Market demand for their skills (scale 1-10)
2. Salary trends in their area
3. Emerging opportunities
4. Skills that are gaining importance
5. Geographic hotspots for opportunities

Keep it concise and actionable.`;

      const aiResponse = await geminiService.generateResponse(prompt, 'market_insights', 'career');
      
      if (aiResponse.success) {
        return {
          summary: aiResponse.response,
          marketDemand: Math.floor(6 + Math.random() * 4), // 6-10 scale
          salaryTrend: Math.random() > 0.3 ? 'increasing' : 'stable',
          hotSkills: this.extractSkillsFromText(aiResponse.response, userProfile.skills),
          locations: ['Remote', 'San Francisco', 'New York', 'Austin', 'Seattle']
        };
      }

      return this.getFallbackMarketInsights(userProfile);

    } catch (error) {
      console.error('Market insights error:', error.message);
      return this.getFallbackMarketInsights(userProfile);
    }
  }

  extractSkillsFromText(text, userSkills = []) {
    const commonTechSkills = ['React', 'Node.js', 'Python', 'AWS', 'Kubernetes', 'TypeScript', 'GraphQL', 'Docker'];
    const foundSkills = [];
    
    for (const skill of commonTechSkills) {
      if (text.includes(skill) && !userSkills.includes(skill)) {
        foundSkills.push(skill);
      }
    }

    return foundSkills.slice(0, 3);
  }

  async generateSmartQuickActions(userProfile) {
    const baseActions = [
      {
        title: "AI Career Assistant",
        description: "Get personalized career advice tailored to your profile",
        icon: "chat",
        route: "/chat",
        color: "from-blue-500 to-blue-600",
        priority: "high"
      },
      {
        title: "Smart Job Search",
        description: "Find opportunities matched to your skills and goals",
        icon: "search",
        route: "/jobs",
        color: "from-green-500 to-green-600",
        priority: "high"
      },
      {
        title: "AI Interview Coach",
        description: "Practice with personalized questions and feedback",
        icon: "interview",
        route: "/interview-prep",
        color: "from-purple-500 to-purple-600",
        priority: "medium"
      },
      {
        title: "Resume Optimizer",
        description: "AI-powered resume analysis and improvement",
        icon: "resume",
        route: "/resume",
        color: "from-orange-500 to-orange-600",
        priority: "medium"
      }
    ];

    // Sort by priority and user profile relevance
    return baseActions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async generateAIInsights(userProfile, stats) {
    const insights = [];

    // Performance insights
    if (stats.conversionRate < 20) {
      insights.push({
        type: 'improvement',
        title: 'Boost Application Success',
        message: 'Your application-to-interview rate could be improved. Consider tailoring your resume more specifically to each job.',
        action: 'Optimize Resume',
        route: '/resume'
      });
    }

    // Skill gap insights
    if (stats.skillAlignment < 80) {
      insights.push({
        type: 'skill',
        title: 'Skill Enhancement Opportunity',
        message: 'Adding trending skills could increase your job match rate significantly.',
        action: 'View Skill Recommendations',
        route: '/profile'
      });
    }

    // Market opportunity insights
    insights.push({
      type: 'opportunity',
      title: 'Market Timing',
      message: 'Current market conditions are favorable for your skill set. Consider applying to 2-3 additional positions this week.',
      action: 'Search Jobs',
      route: '/jobs'
    });

    return insights.slice(0, 3); // Limit to top 3 insights
  }

  generateMockStats(activity) {
    return {
      appliedJobs: activity.applications,
      interviewsScheduled: Math.floor(activity.applications * 0.3),
      resumeScore: Math.round(75 + Math.random() * 20),
      profileViews: activity.profileViews,
      conversionRate: activity.applications > 0 ? Math.round((Math.floor(activity.applications * 0.3) / activity.applications) * 100) : 0,
      competitivenessRating: Math.round(70 + Math.random() * 25),
      skillAlignment: Math.round(65 + Math.random() * 30),
      weeklyTrend: 'stable',
      mock: true
    };
  }

  getFallbackRecommendations(userProfile) {
    return [
      {
        title: 'Optimize Your Resume',
        description: 'Use AI to enhance your resume for better ATS compatibility',
        priority: 'high',
        timeline: 'this week'
      },
      {
        title: 'Practice Interview Skills',
        description: 'Improve your interview performance with AI coaching',
        priority: 'high',
        timeline: 'this week'
      },
      {
        title: 'Expand Professional Network',
        description: 'Connect with professionals in your target industry',
        priority: 'medium',
        timeline: 'this month'
      },
      {
        title: 'Learn New Technologies',
        description: 'Stay current with industry trends and technologies',
        priority: 'medium',
        timeline: 'next quarter'
      },
      {
        title: 'Update Online Presence',
        description: 'Ensure your LinkedIn and portfolio are current',
        priority: 'low',
        timeline: 'this month'
      }
    ];
  }

  getFallbackMarketInsights(userProfile) {
    return {
      summary: 'The job market for technology professionals remains strong with growing demand for cloud, AI, and full-stack development skills.',
      marketDemand: 8,
      salaryTrend: 'increasing',
      hotSkills: ['React', 'AWS', 'Python'],
      locations: ['Remote', 'San Francisco', 'Seattle', 'Austin', 'New York']
    };
  }

  async getFallbackDashboard(userProfile) {
    const activity = this.getUserActivity('default');
    return {
      success: true,
      dashboardData: {
        stats: this.generateMockStats(activity),
        recentActivity: [],
        recommendations: this.getFallbackRecommendations(userProfile),
        marketInsights: this.getFallbackMarketInsights(userProfile),
        quickActions: await this.generateSmartQuickActions(userProfile),
        aiInsights: [
          {
            type: 'info',
            title: 'Getting Started',
            message: 'Complete your profile to receive personalized AI insights.',
            action: 'Update Profile',
            route: '/profile'
          }
        ],
        generatedAt: new Date(),
        fallback: true
      }
    };
  }

  // Method to track user activity
  trackActivity(userId, activityType, details = {}) {
    const activity = this.getUserActivity(userId);
    
    switch (activityType) {
      case 'job_search':
        activity.jobSearches++;
        break;
      case 'application':
        activity.applications++;
        break;
      case 'interview_prep':
        activity.interviewPreps++;
        break;
      case 'resume_update':
        activity.resumeUpdates++;
        break;
      case 'profile_view':
        activity.profileViews++;
        break;
    }

    this.userActivityCache.set(userId, activity);
    
    // Invalidate insights cache to trigger regeneration
    this.insightsCache.delete(`dashboard_${userId}`);
  }
}

export default new DashboardService();