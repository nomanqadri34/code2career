import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';

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

// @desc    Send message to AI assistant
// @route   POST /api/chat/message
// @access  Private
router.post('/message', [
  body('message').notEmpty().isString().isLength({ max: 2000 }),
  body('context').optional().isIn(['jobHunting', 'interview', 'resume', 'career']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { message, context = 'jobHunting' } = req.body;
  const userId = req.user.id;

  const response = await geminiService.generateResponse(message, userId, context);

  res.json(response);
}));

// @desc    Get conversation history
// @route   GET /api/chat/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const history = geminiService.getConversationHistory(userId);

  res.json({
    success: true,
    history,
    count: history.length
  });
}));

// @desc    Clear conversation history
// @route   DELETE /api/chat/history
// @access  Private
router.delete('/history', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  geminiService.clearConversation(userId);

  res.json({
    success: true,
    message: 'Conversation history cleared'
  });
}));

// @desc    Get AI job matching insights
// @route   POST /api/chat/job-insights
// @access  Private
router.post('/job-insights', [
  body('jobs').isArray({ max: 10 }),
  body('userProfile').optional().isObject(),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobs, userProfile } = req.body;
  const defaultProfile = {
    skills: req.user.skills || [],
    experienceLevel: req.user.experienceLevel || 'entry',
    location: req.user.location || 'Remote'
  };

  const profile = { ...defaultProfile, ...userProfile };
  const insights = await geminiService.generateJobMatchingInsights(profile, jobs);

  res.json(insights);
}));

// @desc    Generate AI interview questions
// @route   POST /api/chat/interview-questions
// @access  Private
router.post('/interview-questions', [
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('count').optional().isInt({ min: 5, max: 20 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobRole, experienceLevel, count = 10 } = req.body;

  const questions = await geminiService.generateInterviewQuestions(jobRole, experienceLevel, count);

  res.json(questions);
}));

// @desc    Evaluate interview answer
// @route   POST /api/chat/evaluate-answer
// @access  Private
router.post('/evaluate-answer', [
  body('question').notEmpty().isString().isLength({ max: 1000 }),
  body('answer').notEmpty().isString().isLength({ max: 3000 }),
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { question, answer, jobRole } = req.body;

  const evaluation = await geminiService.evaluateInterviewAnswer(question, answer, jobRole);

  res.json(evaluation);
}));

// @desc    Get AI career advice
// @route   POST /api/chat/career-advice
// @access  Private
router.post('/career-advice', [
  body('situation').notEmpty().isString().isLength({ max: 500 }),
  body('userProfile').optional().isObject(),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { situation, userProfile } = req.body;
  const userId = req.user.id;

  // Use career context for more targeted advice
  const response = await geminiService.generateResponse(
    `Career advice needed: ${situation}`, 
    userId, 
    'career'
  );

  res.json(response);
}));

// @desc    Start AI interview practice session
// @route   POST /api/chat/start-interview
// @access  Private
router.post('/start-interview', [
  body('jobRole').notEmpty().isString().isLength({ max: 100 }),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('interviewType').optional().isIn(['technical', 'behavioral', 'mixed']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobRole, experienceLevel, interviewType = 'mixed' } = req.body;
  const userId = req.user.id;

  // Generate initial questions for the practice session
  const questions = await geminiService.generateInterviewQuestions(jobRole, experienceLevel, 5);
  
  // Start the interview context
  const introMessage = `🎤 Welcome to your interview practice session for ${jobRole} (${experienceLevel} level)! 

I'll ask you ${questions.questions?.length || 5} questions covering ${interviewType === 'technical' ? 'technical concepts' : interviewType === 'behavioral' ? 'behavioral scenarios' : 'a mix of technical and behavioral topics'}.

Ready to start? Here's your first question:

**${questions.questions?.[0]?.question || 'Tell me about yourself and why you\'re interested in this role.'}**

Take your time to answer, and I'll provide feedback to help you improve! 💪`;

  // Store session data (in a real app, you'd use a database)
  const sessionData = {
    sessionId: `interview_${Date.now()}`,
    jobRole,
    experienceLevel,
    interviewType,
    questions: questions.questions || [],
    currentQuestionIndex: 0,
    startedAt: new Date(),
    userId
  };

  res.json({
    success: true,
    session: sessionData,
    message: introMessage,
    currentQuestion: questions.questions?.[0] || {
      question: 'Tell me about yourself and why you\'re interested in this role.',
      type: 'behavioral',
      difficulty: 'easy'
    }
  });
}));

// @desc    Continue interview practice session
// @route   POST /api/chat/continue-interview
// @access  Private
router.post('/continue-interview', [
  body('sessionId').notEmpty().isString(),
  body('answer').notEmpty().isString().isLength({ max: 3000 }),
  body('questionIndex').isInt({ min: 0 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { sessionId, answer, questionIndex } = req.body;
  const userId = req.user.id;

  // In a real app, you'd fetch session from database
  // For now, we'll simulate the flow
  
  // Evaluate the current answer
  const evaluation = await geminiService.evaluateInterviewAnswer(
    `Interview question #${questionIndex + 1}`,
    answer,
    'Software Developer' // This would come from session data
  );

  // Generate next question or end session
  const isLastQuestion = questionIndex >= 4; // Assuming 5 questions total
  
  let responseMessage = `Great answer! Here's my feedback:\n\n`;
  responseMessage += `**Score: ${evaluation.evaluation?.score || 8}/10** ⭐\n\n`;
  responseMessage += `**Strengths:**\n`;
  evaluation.evaluation?.strengths?.forEach(strength => {
    responseMessage += `✅ ${strength}\n`;
  });
  responseMessage += `\n**Areas for improvement:**\n`;
  evaluation.evaluation?.improvements?.forEach(improvement => {
    responseMessage += `💡 ${improvement}\n`;
  });

  if (isLastQuestion) {
    responseMessage += `\n🎉 **Interview practice session complete!**\n\n`;
    responseMessage += `You've shown great potential! Keep practicing and you'll do amazing in real interviews. Good luck! 🚀`;
  } else {
    responseMessage += `\n**Next Question:**\n`;
    responseMessage += `How would you handle a situation where you had to learn a new technology quickly for a project?`;
  }

  res.json({
    success: true,
    evaluation: evaluation.evaluation,
    message: responseMessage,
    sessionComplete: isLastQuestion,
    nextQuestionIndex: questionIndex + 1
  });
}));

// @desc    Get AI conversation starters
// @route   GET /api/chat/starters
// @access  Private
router.get('/starters', protect, asyncHandler(async (req, res) => {
  const starters = {
    jobHunting: [
      "🎯 Help me create a job search strategy",
      "💼 I need advice on changing careers",
      "📝 How can I improve my job applications?",
      "🌐 What are the best job search websites?",
      "💰 Help me with salary negotiation tips"
    ],
    interview: [
      "🎤 I have an interview tomorrow, help me prepare",
      "❓ Practice common interview questions with me",
      "⭐ Teach me the STAR method for behavioral questions",
      "😰 I'm nervous about interviews, any tips?",
      "💡 How do I research a company before an interview?"
    ],
    resume: [
      "📄 Review my resume and suggest improvements",
      "🔍 Help me optimize my resume for ATS systems",
      "✨ What skills should I highlight for [job role]?",
      "📊 How do I quantify my achievements?",
      "🎨 What's the best resume format for my industry?"
    ],
    career: [
      "🚀 Create a career development plan for me",
      "📈 What skills should I learn to advance my career?",
      "🔄 I want to transition to a different field",
      "🎓 Should I pursue additional certifications?",
      "⚖️ Help me achieve better work-life balance"
    ]
  };

  res.json({
    success: true,
    starters
  });
}));

export default router;