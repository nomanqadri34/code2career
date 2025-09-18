import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  // In a real app, fetch full profile from database
  const userProfile = {
    ...req.user,
    profile: {
      headline: 'Software Developer',
      summary: 'Passionate developer with experience in web technologies',
      location: 'San Francisco, CA',
      experienceLevel: 'mid',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      interests: ['Web Development', 'Machine Learning', 'Open Source'],
      workExperience: [
        {
          company: 'Tech Corp',
          position: 'Software Developer',
          startDate: '2022-01-01',
          endDate: null,
          current: true,
          description: 'Developing web applications using React and Node.js'
        }
      ],
      education: [
        {
          institution: 'State University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2018-09-01',
          endDate: '2022-05-01',
          gpa: '3.7'
        }
      ]
    },
    preferences: {
      jobAlerts: true,
      emailNotifications: true,
      profileVisibility: 'public',
      jobTypes: ['full-time', 'remote'],
      preferredLocations: ['San Francisco', 'Remote']
    }
  };

  res.json({
    success: true,
    user: userProfile
  });
}));

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', [
  body('name').optional().isString().isLength({ max: 50 }),
  body('headline').optional().isString().isLength({ max: 100 }),
  body('summary').optional().isString().isLength({ max: 1000 }),
  body('location').optional().isString().isLength({ max: 100 }),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('skills').optional().isArray({ max: 50 }),
  body('interests').optional().isArray({ max: 20 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'headline', 'summary', 'location', 'experienceLevel', 
    'skills', 'interests', 'phone'
  ];
  
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // In a real app, update user in database
  const updatedUser = {
    ...req.user,
    ...updates,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
}));

// @desc    Update work experience
// @route   PUT /api/user/experience
// @access  Private
router.put('/experience', [
  body('workExperience').isArray({ max: 10 }),
  body('workExperience.*.company').notEmpty().isString().isLength({ max: 100 }),
  body('workExperience.*.position').notEmpty().isString().isLength({ max: 100 }),
  body('workExperience.*.startDate').notEmpty().isISO8601(),
  body('workExperience.*.endDate').optional().isISO8601(),
  body('workExperience.*.current').optional().isBoolean(),
  body('workExperience.*.description').optional().isString().isLength({ max: 1000 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { workExperience } = req.body;

  // Validate that if current is true, endDate should not be set
  const invalidEntries = workExperience.filter(exp => exp.current && exp.endDate);
  if (invalidEntries.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Current positions should not have an end date'
    });
  }

  // In a real app, update user experience in database
  res.json({
    success: true,
    message: 'Work experience updated successfully',
    workExperience
  });
}));

// @desc    Update education
// @route   PUT /api/user/education
// @access  Private
router.put('/education', [
  body('education').isArray({ max: 10 }),
  body('education.*.institution').notEmpty().isString().isLength({ max: 100 }),
  body('education.*.degree').notEmpty().isString().isLength({ max: 100 }),
  body('education.*.field').notEmpty().isString().isLength({ max: 100 }),
  body('education.*.startDate').notEmpty().isISO8601(),
  body('education.*.endDate').notEmpty().isISO8601(),
  body('education.*.gpa').optional().isString().isLength({ max: 10 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { education } = req.body;

  // In a real app, update user education in database
  res.json({
    success: true,
    message: 'Education updated successfully',
    education
  });
}));

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
router.put('/preferences', [
  body('jobAlerts').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('profileVisibility').optional().isIn(['public', 'private', 'recruiters']),
  body('jobTypes').optional().isArray(),
  body('preferredLocations').optional().isArray(),
  body('desiredSalaryRange.min').optional().isInt({ min: 0 }),
  body('desiredSalaryRange.max').optional().isInt({ min: 0 }),
  body('desiredSalaryRange.currency').optional().isString().isLength({ max: 3 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const allowedPreferences = [
    'jobAlerts', 'emailNotifications', 'profileVisibility', 
    'jobTypes', 'preferredLocations', 'desiredSalaryRange'
  ];
  
  const preferences = {};
  allowedPreferences.forEach(pref => {
    if (req.body[pref] !== undefined) {
      preferences[pref] = req.body[pref];
    }
  });

  // In a real app, update user preferences in database
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    preferences
  });
}));

// @desc    Get user dashboard stats
// @route   GET /api/user/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  // In a real app, aggregate data from database
  const dashboardStats = {
    profile: {
      completeness: 85,
      views: 234,
      lastUpdated: new Date(Date.now() - 86400000)
    },
    jobs: {
      saved: 12,
      applied: 8,
      interviews: 3,
      offers: 1
    },
    interviews: {
      totalSessions: 5,
      averageScore: 7.8,
      lastSession: new Date(Date.now() - 172800000),
      improvementTrend: '+0.5'
    },
    resume: {
      uploaded: true,
      lastAnalyzed: new Date(Date.now() - 86400000),
      score: 82,
      views: 45
    },
    activity: {
      loginStreak: 7,
      lastLogin: new Date(Date.now() - 3600000),
      totalSessions: 23
    },
    achievements: [
      {
        id: 'first_job_application',
        title: 'First Job Application',
        description: 'Applied to your first job',
        unlockedAt: new Date(Date.now() - 604800000),
        icon: '🎯'
      },
      {
        id: 'interview_practice',
        title: 'Interview Practice',
        description: 'Completed 5 interview practice sessions',
        unlockedAt: new Date(Date.now() - 259200000),
        icon: '🎤'
      },
      {
        id: 'resume_optimizer',
        title: 'Resume Optimizer',
        description: 'Achieved 80+ resume score',
        unlockedAt: new Date(Date.now() - 172800000),
        icon: '📄'
      }
    ]
  };

  res.json({
    success: true,
    dashboard: dashboardStats
  });
}));

// @desc    Get user activity feed
// @route   GET /api/user/activity
// @access  Private
router.get('/activity', protect, asyncHandler(async (req, res) => {
  // In a real app, fetch recent user activities from database
  const activities = [
    {
      id: 'act_1',
      type: 'job_application',
      title: 'Applied to Software Developer at Tech Corp',
      description: 'Your application has been submitted successfully',
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
      metadata: {
        jobId: 'job_123',
        company: 'Tech Corp'
      }
    },
    {
      id: 'act_2',
      type: 'interview_practice',
      title: 'Completed Technical Interview Practice',
      description: 'Scored 8/10 in your latest practice session',
      timestamp: new Date(Date.now() - 86400000),
      status: 'completed',
      metadata: {
        score: 8,
        category: 'technical'
      }
    },
    {
      id: 'act_3',
      type: 'resume_analysis',
      title: 'Resume Analysis Completed',
      description: 'Your resume score improved to 82/100',
      timestamp: new Date(Date.now() - 172800000),
      status: 'completed',
      metadata: {
        score: 82,
        improvement: '+5'
      }
    },
    {
      id: 'act_4',
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'Added new skills and experience',
      timestamp: new Date(Date.now() - 259200000),
      status: 'completed',
      metadata: {
        fieldsUpdated: ['skills', 'experience']
      }
    }
  ];

  res.json({
    success: true,
    activities,
    count: activities.length
  });
}));

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
router.delete('/account', [
  body('confirmPassword').optional().isString(),
  body('reason').optional().isString().isLength({ max: 500 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const userId = req.user.id;

  // In a real app, soft delete user and associated data
  // Also send confirmation email and handle cleanup

  res.json({
    success: true,
    message: 'Account deletion initiated. You will receive a confirmation email.',
    deletionId: `del_${Date.now()}`,
    scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
}));

// @desc    Export user data
// @route   GET /api/user/export
// @access  Private
router.get('/export', protect, asyncHandler(async (req, res) => {
  // In a real app, generate comprehensive user data export
  const exportData = {
    user: req.user,
    profile: {
      // User profile data
    },
    jobs: {
      saved: [],
      applied: [],
      recommendations: []
    },
    interviews: {
      sessions: [],
      history: []
    },
    resumes: {
      uploaded: [],
      analyses: []
    },
    activities: [],
    generatedAt: new Date(),
    format: 'json'
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="job-hunter-data-${req.user.id}.json"`);
  res.json(exportData);
}));

export default router;