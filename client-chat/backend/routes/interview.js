import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import interviewService from '../services/interviewService.js';

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

// @desc    Generate interview questions
// @route   POST /api/interview/questions/generate
// @access  Private
router.post('/questions/generate', [
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('count').optional().isInt({ min: 5, max: 20 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobRole, experienceLevel, count = 10 } = req.body;

  const result = await interviewService.generateInterviewQuestions(jobRole, experienceLevel, count);

  res.json(result);
}));

// @desc    Start practice session
// @route   POST /api/interview/session/start
// @access  Private
router.post('/session/start', [
  body('sessionType').isIn(['quick', 'standard', 'comprehensive']),
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { sessionType, jobRole, experienceLevel } = req.body;

  const result = await interviewService.startPracticeSession(sessionType, jobRole, experienceLevel);

  res.json(result);
}));

// @desc    Submit answer for evaluation
// @route   POST /api/interview/answer/evaluate
// @access  Private
router.post('/answer/evaluate', [
  body('question').notEmpty().isString().isLength({ max: 1000 }),
  body('answer').notEmpty().isString().isLength({ max: 5000 }),
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { question, answer, jobRole } = req.body;

  const result = await interviewService.evaluateAnswer(question, answer, jobRole);

  res.json(result);
}));

// @desc    Get interview tips
// @route   GET /api/interview/tips
// @access  Private
router.get('/tips', [
  query('category').optional().isIn(['general', 'technical', 'behavioral']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { category = 'general' } = req.query;

  const result = await interviewService.getInterviewTips(category);

  res.json(result);
}));

// @desc    Get common interview mistakes
// @route   GET /api/interview/mistakes
// @access  Private
router.get('/mistakes', protect, asyncHandler(async (req, res) => {
  const result = await interviewService.getCommonMistakes();

  res.json(result);
}));

// @desc    Get user's interview history/progress
// @route   GET /api/interview/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // In a real app, fetch from database
  // For now, return mock history
  res.json({
    success: true,
    history: [
      {
        sessionId: 'session_1234567890',
        jobRole: 'Software Developer',
        experienceLevel: 'mid',
        completedAt: new Date(Date.now() - 86400000),
        questionsAnswered: 8,
        totalQuestions: 10,
        averageScore: 7.5,
        strengths: ['Technical Knowledge', 'Communication'],
        weaknesses: ['Behavioral Questions']
      },
      {
        sessionId: 'session_0987654321',
        jobRole: 'Frontend Developer',
        experienceLevel: 'mid',
        completedAt: new Date(Date.now() - 172800000),
        questionsAnswered: 10,
        totalQuestions: 10,
        averageScore: 8.2,
        strengths: ['Problem Solving', 'Technical Skills'],
        weaknesses: ['System Design']
      }
    ],
    stats: {
      totalSessions: 2,
      totalQuestionsAnswered: 18,
      averageScore: 7.85,
      improvementTrend: '+0.7',
      strongestCategory: 'Technical',
      weakestCategory: 'Behavioral'
    }
  });
}));

// @desc    Get practice session by ID
// @route   GET /api/interview/session/:sessionId
// @access  Private
router.get('/session/:sessionId', protect, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  // In a real app, fetch session from database and verify ownership
  res.json({
    success: true,
    session: {
      id: sessionId,
      userId,
      type: 'standard',
      jobRole: 'Software Developer',
      experienceLevel: 'mid',
      questions: [
        {
          question: "Tell me about yourself.",
          category: "behavioral",
          difficulty: "easy"
        }
      ],
      startedAt: new Date(),
      status: 'active',
      currentQuestionIndex: 0,
      answers: []
    }
  });
}));

// @desc    Update practice session (submit answer, move to next question)
// @route   PUT /api/interview/session/:sessionId
// @access  Private
router.put('/session/:sessionId', [
  body('action').isIn(['submit_answer', 'next_question', 'finish_session']),
  body('answer').optional().isString().isLength({ max: 5000 }),
  body('questionIndex').optional().isInt({ min: 0 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { action, answer, questionIndex } = req.body;
  const userId = req.user.id;

  // In a real app, update session in database
  let updatedSession = {
    id: sessionId,
    userId,
    action,
    updatedAt: new Date()
  };

  if (action === 'submit_answer' && answer) {
    updatedSession.lastAnswer = answer;
    updatedSession.currentQuestionIndex = (questionIndex || 0) + 1;
  }

  res.json({
    success: true,
    message: `Session ${action} successful`,
    session: updatedSession
  });
}));

// @desc    Get interview preparation roadmap
// @route   GET /api/interview/roadmap
// @access  Private
router.get('/roadmap', [
  query('jobRole').optional().isString().isLength({ max: 100 }),
  query('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobRole = 'Software Developer', experienceLevel = 'mid' } = req.query;

  const roadmap = {
    success: true,
    roadmap: {
      jobRole,
      experienceLevel,
      phases: [
        {
          phase: 1,
          title: 'Foundation',
          duration: '1-2 weeks',
          tasks: [
            'Review fundamental concepts',
            'Practice basic interview questions',
            'Prepare your elevator pitch',
            'Research target companies'
          ],
          resources: [
            'Company websites and recent news',
            'Glassdoor for interview experiences',
            'LinkedIn for company culture insights'
          ]
        },
        {
          phase: 2,
          title: 'Technical Preparation',
          duration: '2-3 weeks',
          tasks: [
            'Practice coding problems',
            'Review system design concepts',
            'Prepare technical project discussions',
            'Mock technical interviews'
          ],
          resources: [
            'LeetCode/HackerRank problems',
            'System design primers',
            'Technical interview prep books'
          ]
        },
        {
          phase: 3,
          title: 'Behavioral & Communication',
          duration: '1-2 weeks',
          tasks: [
            'Prepare STAR method examples',
            'Practice common behavioral questions',
            'Work on communication skills',
            'Prepare thoughtful questions to ask'
          ],
          resources: [
            'Behavioral interview guides',
            'Communication skills courses',
            'Industry-specific questions'
          ]
        },
        {
          phase: 4,
          title: 'Final Preparation',
          duration: '1 week',
          tasks: [
            'Mock interviews with feedback',
            'Review and refine all materials',
            'Prepare for specific company cultures',
            'Plan interview day logistics'
          ],
          resources: [
            'Interview simulation platforms',
            'Professional feedback services',
            'Company-specific preparation guides'
          ]
        }
      ],
      estimatedDuration: '5-8 weeks',
      keyMilestones: [
        'Complete technical skill assessment',
        'Prepare 5-7 strong STAR examples',
        'Conduct 3+ mock interviews',
        'Research 5+ target companies thoroughly'
      ]
    }
  };

  res.json(roadmap);
}));

// @desc    Generate personalized interview preparation plan
// @route   POST /api/interview/prep/personalized
// @access  Private
router.post('/prep/personalized', [
  body('targetRole').notEmpty().isString().isLength({ max: 100 }),
  body('companyName').optional().isString().isLength({ max: 100 }),
  body('companyIndustry').optional().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { targetRole, companyName, companyIndustry } = req.body;
  const userProfile = {
    id: req.user.id,
    skills: req.user.skills || ['JavaScript', 'React'],
    experienceLevel: req.user.experienceLevel || 'mid'
  };
  const companyInfo = { name: companyName, industry: companyIndustry };

  const result = await interviewService.generatePersonalizedInterviewPrep(userProfile, targetRole, companyInfo);

  res.json(result);
}));

// @desc    Generate company-specific interview questions
// @route   POST /api/interview/questions/company
// @access  Private
router.post('/questions/company', [
  body('companyName').notEmpty().isString().isLength({ max: 100 }),
  body('role').notEmpty().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { companyName, role } = req.body;

  const result = await interviewService.generateCompanySpecificQuestions(companyName, role);

  res.json(result);
}));

// @desc    Generate comprehensive session feedback
// @route   POST /api/interview/session/feedback
// @access  Private
router.post('/session/feedback', [
  body('sessionId').notEmpty().isString(),
  body('questions').isArray().notEmpty(),
  body('answers').isArray().notEmpty(),
  body('jobRole').notEmpty().isString(),
  body('overallPerformance').optional().isObject(),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { sessionId, questions, answers, jobRole, overallPerformance } = req.body;
  const sessionData = {
    userId: req.user.id,
    sessionId,
    questions,
    answers,
    jobRole,
    overallPerformance
  };

  const result = await interviewService.generateInterviewFeedback(sessionData);

  res.json(result);
}));

// @desc    Get AI-powered interview insights
// @route   GET /api/interview/insights
// @access  Private
router.get('/insights', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userProfile = {
    skills: req.user.skills || ['JavaScript', 'React'],
    experienceLevel: req.user.experienceLevel || 'mid',
    interviewHistory: [] // In real app, fetch from database
  };

  // Generate AI insights based on user profile and history
  const insights = {
    success: true,
    insights: {
      strengthAreas: [
        'Technical knowledge appears solid for your experience level',
        'Good communication skills based on previous practice sessions'
      ],
      improvementAreas: [
        'Practice more behavioral questions using STAR method',
        'Work on providing specific examples with quantifiable results'
      ],
      personalizedTips: [
        `As a ${userProfile.experienceLevel} level professional, focus on leadership examples`,
        'Prepare 5-7 strong STAR method stories from your experience',
        'Research companies thoroughly and prepare thoughtful questions'
      ],
      recommendedPractice: [
        'Schedule 2-3 mock interviews this week',
        'Practice coding problems daily for 30 minutes',
        'Record yourself answering behavioral questions'
      ],
      marketTrends: [
        'Companies are increasingly focusing on system design skills',
        'Remote work experience is becoming more valuable',
        'Cross-functional collaboration skills are in high demand'
      ],
      nextSteps: [
        'Complete a comprehensive interview practice session',
        'Get your resume reviewed for ATS optimization',
        'Research 5 target companies thoroughly'
      ],
      aiGenerated: true,
      generatedAt: new Date()
    }
  };

  res.json(insights);
}));

export default router;
