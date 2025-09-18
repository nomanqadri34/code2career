import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect, optional } from '../middleware/auth.js';
import careerService from '../services/careerService.js';

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

// @desc    Search career guidance videos
// @route   GET /api/career/videos/search
// @access  Public
router.get('/videos/search', [
  query('topic').optional().isString().isLength({ max: 200 }),
  query('maxResults').optional().isInt({ min: 1, max: 20 }),
  handleValidation
], optional, asyncHandler(async (req, res) => {
  const { topic = 'software developer career', maxResults = 10 } = req.query;

  const result = await careerService.searchCareerVideos(topic, parseInt(maxResults));

  res.json(result);
}));

// @desc    Get career guidance by category
// @route   GET /api/career/videos/category/:category
// @access  Public
router.get('/videos/category/:category', [
  query('category').optional().isIn([
    'interview-preparation', 
    'skill-development', 
    'career-growth', 
    'portfolio-building', 
    'job-search', 
    'work-life-balance'
  ]),
  handleValidation
], optional, asyncHandler(async (req, res) => {
  const { category = 'general' } = req.params;

  const result = await careerService.getCareerGuidanceByCategory(category);

  res.json(result);
}));

// @desc    Get personalized career content
// @route   POST /api/career/personalized
// @access  Private
router.post('/personalized', [
  body('skills').optional().isArray({ max: 20 }),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('interests').optional().isArray({ max: 10 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const userProfile = {
    skills: req.body.skills || req.user.skills || [],
    experienceLevel: req.body.experienceLevel || req.user.experienceLevel || 'entry',
    interests: req.body.interests || req.user.interests || []
  };

  const result = await careerService.getPersonalizedCareerContent(userProfile);

  res.json(result);
}));

// @desc    Get trending career topics
// @route   GET /api/career/trending
// @access  Public
router.get('/trending', optional, asyncHandler(async (req, res) => {
  const result = await careerService.getTrendingCareerTopics();

  res.json(result);
}));

// @desc    Get career mentors and influencers
// @route   GET /api/career/mentors
// @access  Public
router.get('/mentors', optional, asyncHandler(async (req, res) => {
  const result = await careerService.getCareerMentors();

  res.json(result);
}));

// @desc    Get upcoming career events
// @route   GET /api/career/events
// @access  Public
router.get('/events', optional, asyncHandler(async (req, res) => {
  const result = await careerService.getCareerEvents();

  res.json(result);
}));

// @desc    Get career resources (books, websites, podcasts)
// @route   GET /api/career/resources
// @access  Public
router.get('/resources', optional, asyncHandler(async (req, res) => {
  const result = await careerService.getCareerResources();

  res.json(result);
}));

// @desc    Get career roadmap for specific role
// @route   GET /api/career/roadmap
// @access  Private
router.get('/roadmap', [
  query('jobRole').optional().isString().isLength({ max: 100 }),
  query('currentLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobRole = 'Software Developer', currentLevel = 'beginner' } = req.query;

  const roadmaps = {
    'Software Developer': {
      beginner: {
        title: 'Software Developer Career Roadmap - Beginner',
        description: 'Your journey from complete beginner to junior developer',
        estimatedDuration: '6-12 months',
        phases: [
          {
            phase: 1,
            title: 'Programming Fundamentals',
            duration: '2-3 months',
            skills: ['Variables and data types', 'Control structures', 'Functions', 'Basic algorithms'],
            resources: ['FreeCodeCamp', 'Codecademy', 'YouTube tutorials'],
            projects: ['Calculator app', 'Todo list', 'Simple games']
          },
          {
            phase: 2,
            title: 'Web Development Basics',
            duration: '2-3 months',
            skills: ['HTML/CSS', 'JavaScript DOM', 'Responsive design', 'Git basics'],
            resources: ['MDN Web Docs', 'CSS-Tricks', 'Git tutorials'],
            projects: ['Personal website', 'Landing page', 'Interactive web app']
          },
          {
            phase: 3,
            title: 'Framework and Tools',
            duration: '2-3 months',
            skills: ['React/Vue/Angular', 'Package managers', 'Build tools', 'API integration'],
            resources: ['Official framework docs', 'YouTube channels', 'Udemy courses'],
            projects: ['Weather app', 'Shopping cart', 'Blog platform']
          },
          {
            phase: 4,
            title: 'Job Preparation',
            duration: '1-2 months',
            skills: ['Portfolio building', 'Interview preparation', 'Resume writing', 'Networking'],
            resources: ['LinkedIn', 'GitHub', 'LeetCode', 'Career guidance videos'],
            projects: ['Professional portfolio', 'Open source contributions', 'Technical blog']
          }
        ]
      },
      intermediate: {
        title: 'Software Developer Career Roadmap - Intermediate',
        description: 'Advance from junior to mid-level developer',
        estimatedDuration: '12-18 months',
        phases: [
          {
            phase: 1,
            title: 'Backend Development',
            duration: '3-4 months',
            skills: ['Server-side programming', 'Databases', 'RESTful APIs', 'Authentication'],
            resources: ['Node.js docs', 'Database tutorials', 'API design guides'],
            projects: ['Full-stack web app', 'RESTful API', 'Database-driven application']
          },
          {
            phase: 2,
            title: 'Advanced Frontend',
            duration: '3-4 months',
            skills: ['State management', 'Testing', 'Performance optimization', 'Advanced CSS'],
            resources: ['Redux documentation', 'Jest tutorials', 'Performance guides'],
            projects: ['Complex React app', 'Progressive Web App', 'Component library']
          },
          {
            phase: 3,
            title: 'DevOps and Deployment',
            duration: '3-4 months',
            skills: ['Cloud platforms', 'CI/CD', 'Containerization', 'Monitoring'],
            resources: ['AWS/Azure docs', 'Docker tutorials', 'CI/CD guides'],
            projects: ['Deployed applications', 'Automated pipelines', 'Microservices']
          },
          {
            phase: 4,
            title: 'Leadership and Soft Skills',
            duration: '3-4 months',
            skills: ['Code review', 'Mentoring', 'Technical communication', 'Project management'],
            resources: ['Leadership books', 'Communication courses', 'Management blogs'],
            projects: ['Team leadership', 'Technical presentations', 'Knowledge sharing']
          }
        ]
      }
    }
  };

  const roadmap = roadmaps[jobRole]?.[currentLevel] || roadmaps['Software Developer']['beginner'];

  res.json({
    success: true,
    roadmap: {
      ...roadmap,
      jobRole,
      currentLevel,
      generatedAt: new Date()
    }
  });
}));

// @desc    Get career advice based on specific situation
// @route   POST /api/career/advice
// @access  Private
router.post('/advice', [
  body('situation').notEmpty().isString().isLength({ max: 500 }),
  body('context').optional().isObject(),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { situation, context = {} } = req.body;

  // Simple advice matching based on keywords
  const adviceMap = {
    'job interview': {
      title: 'Job Interview Preparation',
      advice: [
        'Research the company thoroughly - their products, culture, recent news',
        'Practice common technical and behavioral interview questions',
        'Prepare specific examples using the STAR method',
        'Have thoughtful questions ready to ask the interviewer',
        'Test your technology setup if it\'s a virtual interview'
      ],
      resources: [
        'Glassdoor for company reviews and interview experiences',
        'LeetCode for technical practice',
        'YouTube interview preparation videos'
      ]
    },
    'career change': {
      title: 'Career Change to Tech',
      advice: [
        'Identify transferable skills from your current field',
        'Start with online courses and build projects',
        'Network with developers in your target field',
        'Consider bootcamps or formal education if needed',
        'Build a portfolio showcasing your new skills'
      ],
      resources: [
        'FreeCodeCamp for learning fundamentals',
        'GitHub for hosting your projects',
        'LinkedIn for professional networking'
      ]
    },
    'skill development': {
      title: 'Professional Skill Development',
      advice: [
        'Identify in-demand skills in your field',
        'Set aside regular time for learning (even 30 min/day)',
        'Build projects that apply new skills',
        'Share your learning journey publicly',
        'Seek feedback from experienced developers'
      ],
      resources: [
        'Online courses (Udemy, Coursera, Pluralsight)',
        'Documentation and official tutorials',
        'Developer communities and forums'
      ]
    },
    'promotion': {
      title: 'Getting Promoted in Tech',
      advice: [
        'Document your achievements and impact',
        'Seek additional responsibilities and leadership opportunities',
        'Improve technical and soft skills continuously',
        'Build relationships across the organization',
        'Have regular career discussions with your manager'
      ],
      resources: [
        'Career development books and blogs',
        'Internal mentorship programs',
        'Professional development courses'
      ]
    }
  };

  // Find matching advice based on keywords
  let matchedAdvice = null;
  const situationLower = situation.toLowerCase();
  
  for (const [key, advice] of Object.entries(adviceMap)) {
    if (situationLower.includes(key)) {
      matchedAdvice = advice;
      break;
    }
  }

  // Default advice if no specific match
  if (!matchedAdvice) {
    matchedAdvice = {
      title: 'General Career Guidance',
      advice: [
        'Clearly define your career goals and desired outcomes',
        'Break down large goals into smaller, actionable steps',
        'Seek advice from experienced professionals in your field',
        'Stay updated with industry trends and technologies',
        'Build and maintain your professional network'
      ],
      resources: [
        'Career guidance YouTube channels',
        'Professional networking events',
        'Industry blogs and newsletters'
      ]
    };
  }

  res.json({
    success: true,
    situation,
    guidance: {
      ...matchedAdvice,
      generatedAt: new Date(),
      personalized: !!context.experienceLevel
    }
  });
}));

// @desc    Track career content engagement
// @route   POST /api/career/engagement
// @access  Private
router.post('/engagement', [
  body('contentType').isIn(['video', 'article', 'resource', 'advice']),
  body('contentId').notEmpty().isString(),
  body('action').isIn(['view', 'like', 'save', 'share']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { contentType, contentId, action } = req.body;
  const userId = req.user.id;

  // In a real app, save engagement data to database for analytics
  res.json({
    success: true,
    message: 'Engagement tracked successfully',
    engagement: {
      userId,
      contentType,
      contentId,
      action,
      timestamp: new Date()
    }
  });
}));

export default router;