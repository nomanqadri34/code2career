import express from 'express';
import dashboardService from '../services/dashboardService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get AI-powered dashboard data
router.get('/data', protect, async (req, res, next) => {
  try {
    console.log('📊 Dashboard route - Handling request');
    const userId = req.user?.id || 'demo';
    const userProfile = {
      skills: req.user?.skills || ['JavaScript', 'React'],
      experienceLevel: req.user?.experienceLevel || 'mid',
      location: req.user?.location || 'Remote',
      industry: req.user?.industry || 'Technology',
      careerGoals: req.user?.careerGoals || 'Career advancement'
    };

    console.log('🔄 Calling dashboard service...');
    const result = await dashboardService.getUserDashboardData(userId, userProfile);
    console.log('✅ Dashboard service completed, sending response');
    
    res.json(result);

  } catch (error) {
    console.error('❌ Dashboard route error:', error.message);
    console.error('🔍 Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Track user activity
router.post('/activity', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo';
    const { activityType, details } = req.body;

    if (!activityType) {
      return res.status(400).json({
        success: false,
        message: 'Activity type is required'
      });
    }

    dashboardService.trackActivity(userId, activityType, details);

    res.json({
      success: true,
      message: 'Activity tracked successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo';
    const userProfile = {
      skills: req.user?.skills || ['JavaScript', 'React'],
      experienceLevel: req.user?.experienceLevel || 'mid',
      location: req.user?.location || 'Remote',
      industry: req.user?.industry || 'Technology'
    };

    const stats = await dashboardService.generateUserStats(userId, userProfile);
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    next(error);
  }
});

// Get AI insights
router.get('/insights', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo';
    const userProfile = {
      skills: req.user?.skills || ['JavaScript', 'React'],
      experienceLevel: req.user?.experienceLevel || 'mid',
      location: req.user?.location || 'Remote',
      industry: req.user?.industry || 'Technology'
    };

    const stats = await dashboardService.generateUserStats(userId, userProfile);
    const insights = await dashboardService.generateAIInsights(userProfile, stats);
    
    res.json({
      success: true,
      insights
    });

  } catch (error) {
    next(error);
  }
});

// Get personalized recommendations
router.get('/recommendations', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo';
    const userProfile = {
      skills: req.user?.skills || ['JavaScript', 'React'],
      experienceLevel: req.user?.experienceLevel || 'mid',
      location: req.user?.location || 'Remote',
      careerGoals: req.user?.careerGoals || 'Career advancement'
    };

    const recommendations = await dashboardService.generatePersonalizedRecommendations(userId, userProfile);
    
    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    next(error);
  }
});

// Get market insights
router.get('/market', protect, async (req, res, next) => {
  try {
    const userProfile = {
      skills: req.user?.skills || ['JavaScript', 'React'],
      experienceLevel: req.user?.experienceLevel || 'mid',
      location: req.user?.location || 'Remote',
      industry: req.user?.industry || 'Technology'
    };

    const marketInsights = await dashboardService.getMarketInsights(userProfile);
    
    res.json({
      success: true,
      marketInsights
    });

  } catch (error) {
    next(error);
  }
});

// Test endpoint for Gemini AI
router.get('/test-gemini', protect, async (req, res) => {
  try {
    console.log('🧪 Testing Gemini API...');
    const geminiService = (await import('../services/geminiService.js')).default;
    
    const testResult = await geminiService.generateResponse(
      'Hello, please respond with "Gemini AI is working!"',
      'test-user',
      'career'
    );
    
    console.log('📤 Test result:', testResult);
    
    res.json({
      success: true,
      message: 'Gemini API test completed',
      result: testResult
    });
  } catch (error) {
    console.error('❌ Gemini test error:', error);
    res.json({
      success: false,
      message: 'Gemini API test failed',
      error: error.message
    });
  }
});

export default router;
