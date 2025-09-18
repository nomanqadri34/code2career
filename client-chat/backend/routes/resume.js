import express from 'express';
import multer from 'multer';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import resumeService from '../services/resumeService.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const fullPath = path.join(process.cwd(), 'backend', uploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user?.id || 'anonymous'}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed types: ${allowedTypes.join(', ')} (PDF support coming soon)`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

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

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private
router.post('/upload', protect, upload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    const parseResult = await resumeService.parseResume(req.file.path, req.file.originalname);
    
    // Save file info and parsed content to user profile (in real app, save to database)
    const resumeData = {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedAt: new Date(),
      ...parseResult
    };

    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: resumeData
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw error;
  }
}));

// @desc    Analyze resume
// @route   POST /api/resume/analyze
// @access  Private
router.post('/analyze', [
  body('resumeText').notEmpty().isString().isLength({ max: 10000 }),
  body('targetJobRole').optional().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { resumeText, targetJobRole = 'Software Developer' } = req.body;

  const result = await resumeService.analyzeResume(resumeText, targetJobRole);

  res.json(result);
}));

// @desc    Generate improved resume
// @route   POST /api/resume/improve
// @access  Private
router.post('/improve', [
  body('resumeText').notEmpty().isString().isLength({ max: 10000 }),
  body('analysisResult').notEmpty().isObject(),
  body('targetJobRole').optional().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { resumeText, analysisResult, targetJobRole = 'Software Developer' } = req.body;

  const result = await resumeService.generateImprovedResume(resumeText, analysisResult, targetJobRole);

  res.json(result);
}));

// @desc    Compare resume with job description
// @route   POST /api/resume/compare
// @access  Private
router.post('/compare', [
  body('resumeText').notEmpty().isString().isLength({ max: 10000 }),
  body('jobDescription').notEmpty().isString().isLength({ max: 5000 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  const result = await resumeService.compareWithJobDescription(resumeText, jobDescription);

  res.json(result);
}));

// @desc    Get resume templates
// @route   GET /api/resume/templates
// @access  Private
router.get('/templates', [
  query('category').optional().isIn(['tech', 'general', 'creative', 'executive']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { category = 'tech' } = req.query;

  const result = await resumeService.getResumeTemplates(category);

  res.json(result);
}));

// @desc    Get industry keywords
// @route   GET /api/resume/keywords
// @access  Private
router.get('/keywords', [
  query('industry').optional().isIn(['technology', 'marketing', 'finance', 'healthcare', 'education']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { industry = 'technology' } = req.query;

  const result = await resumeService.getIndustryKeywords(industry);

  res.json(result);
}));

// @desc    Get user's resume history
// @route   GET /api/resume/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // In a real app, fetch from database
  res.json({
    success: true,
    resumes: [
      {
        id: 'resume_1',
        originalName: 'John_Doe_Resume.pdf',
        uploadedAt: new Date(Date.now() - 86400000),
        lastAnalyzed: new Date(Date.now() - 3600000),
        analysisScore: 85,
        targetJobRole: 'Software Developer',
        status: 'analyzed'
      },
      {
        id: 'resume_2',
        originalName: 'Updated_Resume.docx',
        uploadedAt: new Date(Date.now() - 172800000),
        lastAnalyzed: new Date(Date.now() - 172800000),
        analysisScore: 78,
        targetJobRole: 'Frontend Developer',
        status: 'analyzed'
      }
    ],
    stats: {
      totalUploads: 2,
      averageScore: 81.5,
      bestScore: 85,
      improvementTrend: '+7'
    }
  });
}));

// @desc    Download resume file
// @route   GET /api/resume/download/:resumeId
// @access  Private
router.get('/download/:resumeId', protect, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  // In a real app, verify ownership and get file path from database
  const mockFilePath = path.join(process.cwd(), 'backend', 'uploads', `sample-resume.pdf`);
  
  if (!fs.existsSync(mockFilePath)) {
    return res.status(404).json({
      success: false,
      message: 'Resume file not found'
    });
  }

  res.download(mockFilePath, 'resume.pdf');
}));

// @desc    Delete resume
// @route   DELETE /api/resume/:resumeId
// @access  Private
router.delete('/:resumeId', protect, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;

  // In a real app, verify ownership, get file path from database, and delete file
  res.json({
    success: true,
    message: 'Resume deleted successfully',
    deletedResumeId: resumeId
  });
}));

// @desc    Get resume tips and best practices
// @route   GET /api/resume/tips
// @access  Private
router.get('/tips', [
  query('category').optional().isIn(['general', 'technical', 'design', 'ats']),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { category = 'general' } = req.query;

  const tips = {
    general: [
      'Keep your resume to 1-2 pages maximum',
      'Use a professional email address',
      'Include your LinkedIn profile and portfolio links',
      'Use consistent formatting throughout',
      'Proofread carefully for spelling and grammar errors',
      'Tailor your resume for each job application',
      'Use action verbs to describe your achievements',
      'Quantify your accomplishments with numbers and metrics',
      'Include relevant keywords from the job description',
      'Save your resume as PDF to preserve formatting'
    ],
    technical: [
      'Create a dedicated technical skills section',
      'List programming languages, frameworks, and tools',
      'Include links to your GitHub, portfolio, and deployed projects',
      'Describe technical projects with specific technologies used',
      'Mention any open source contributions',
      'Include relevant certifications and courses',
      'Highlight problem-solving and debugging skills',
      'Mention experience with development methodologies (Agile, Scrum)',
      'Include database and cloud platform experience',
      'Show progression in technical complexity over time'
    ],
    design: [
      'Use clean, professional typography',
      'Maintain consistent spacing and alignment',
      'Use a simple color scheme (1-2 colors max)',
      'Ensure good contrast for readability',
      'Use white space effectively',
      'Keep design elements minimal and professional',
      'Make sure your resume is ATS-friendly',
      'Test how your resume looks when printed',
      'Use standard section headers',
      'Avoid using images, graphics, or complex formatting'
    ],
    ats: [
      'Use standard section headings (Experience, Education, Skills)',
      'Avoid headers, footers, and multi-column layouts',
      'Use standard fonts (Arial, Calibri, Times New Roman)',
      'Save as both PDF and Word document formats',
      'Include keywords from the job description',
      'Use bullet points instead of paragraphs',
      'Avoid tables, text boxes, and graphics',
      'Use simple formatting (bold, italic sparingly)',
      'Include your contact information in the main body',
      'Test your resume through ATS checkers online'
    ]
  };

  res.json({
    success: true,
    category,
    tips: tips[category] || tips.general
  });
}));

// @desc    Get ATS compatibility check
// @route   POST /api/resume/ats-check
// @access  Private
router.post('/ats-check', [
  body('resumeText').notEmpty().isString().isLength({ max: 10000 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { resumeText } = req.body;

  // Simple ATS compatibility analysis
  const checks = {
    standardHeadings: {
      test: /\b(experience|education|skills|summary|objective)\b/gi,
      weight: 15,
      description: 'Uses standard section headings'
    },
    contactInfo: {
      test: /\b(email|phone|linkedin)\b/gi,
      weight: 10,
      description: 'Contains complete contact information'
    },
    actionVerbs: {
      test: /\b(developed|managed|led|created|implemented|designed|improved|increased)\b/gi,
      weight: 15,
      description: 'Uses action verbs effectively'
    },
    quantifiableResults: {
      test: /\b(\d+%|\d+\+|increased|decreased|improved|reduced)\b/gi,
      weight: 20,
      description: 'Includes quantifiable achievements'
    },
    keywords: {
      test: /\b(javascript|python|react|node|aws|sql|agile|scrum)\b/gi,
      weight: 20,
      description: 'Contains relevant technical keywords'
    },
    formatting: {
      test: /.+/,
      weight: 20,
      description: 'Proper text formatting and structure'
    }
  };

  let totalScore = 0;
  const results = [];

  Object.entries(checks).forEach(([key, check]) => {
    const matches = resumeText.match(check.test);
    const matchCount = matches ? matches.length : 0;
    const passed = matchCount > 0;
    const score = passed ? check.weight : 0;
    
    totalScore += score;
    results.push({
      check: key,
      description: check.description,
      passed,
      matchCount,
      weight: check.weight,
      score
    });
  });

  const overallScore = Math.min(totalScore, 100);

  res.json({
    success: true,
    atsScore: overallScore,
    grade: overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Needs Improvement',
    checks: results,
    recommendations: results
      .filter(r => !r.passed)
      .map(r => `Improve: ${r.description}`)
  });
}));

export default router;