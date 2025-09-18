import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect, optional } from '../middleware/auth.js';
import jobService from '../services/jobService.js';

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

// @desc    Search for jobs
// @route   GET /api/jobs/search
// @access  Public
router.get('/search', [
  query('q').optional().isString().isLength({ max: 200 }),
  query('page').optional().isInt({ min: 1, max: 20 }),
  query('location').optional().isString().isLength({ max: 100 }),
  query('employment_types').optional().isString(),
  query('date_posted').optional().isIn(['all', 'today', '3days', 'week', 'month']),
  handleValidation
], optional, asyncHandler(async (req, res) => {
  const {
    q: query = '',
    page = '1',
    location = '',
    employment_types = '',
    date_posted = 'all',
    job_requirements = '',
    num_pages = '1'
  } = req.query;

  const filters = {
    page,
    location,
    employment_types,
    date_posted,
    job_requirements,
    num_pages
  };

  const result = await jobService.searchJobs(query, filters);

  res.json(result);
}));

// @desc    Get job details by ID
// @route   GET /api/jobs/:jobId
// @access  Public
router.get('/:jobId', [
  query('jobId').optional().isString().isLength({ max: 100 }),
  handleValidation
], optional, asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const result = await jobService.getJobDetails(jobId);

  res.json(result);
}));

// @desc    Get job recommendations for user
// @route   POST /api/jobs/recommendations
// @access  Private
router.post('/recommendations', [
  body('skills').optional().isArray({ max: 20 }),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']),
  body('location').optional().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const userProfile = {
    skills: req.body.skills || req.user.skills || [],
    experienceLevel: req.body.experienceLevel || req.user.experienceLevel || 'entry',
    location: req.body.location || req.user.location || 'US'
  };

  const result = await jobService.getJobRecommendations(userProfile);

  res.json(result);
}));

// @desc    Save a job
// @route   POST /api/jobs/save
// @access  Private
router.post('/save', [
  body('jobId').notEmpty().isString().isLength({ max: 100 }),
  body('platform').optional().isString().isLength({ max: 50 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobId, platform = 'rapid-api' } = req.body;
  const userId = req.user.id;

  // In a real app, save to database
  // For now, return success response
  res.json({
    success: true,
    message: 'Job saved successfully',
    savedJob: {
      userId,
      jobId,
      platform,
      savedAt: new Date()
    }
  });
}));

// @desc    Get saved jobs
// @route   GET /api/jobs/saved
// @access  Private
router.get('/saved', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // In a real app, fetch from database
  // For now, return mock saved jobs
  res.json({
    success: true,
    savedJobs: [
      {
        jobId: 'mock-1',
        platform: 'rapid-api',
        savedAt: new Date(Date.now() - 86400000),
        job: {
          job_id: 'mock-1',
          job_title: 'Senior React Developer',
          employer_name: 'Tech Corp',
          job_city: 'San Francisco',
          job_state: 'CA'
        }
      }
    ],
    count: 1
  });
}));

// @desc    Apply to a job
// @route   POST /api/jobs/apply
// @access  Private
router.post('/apply', [
  body('jobId').notEmpty().isString().isLength({ max: 100 }),
  body('coverLetter').optional().isString().isLength({ max: 2000 }),
  body('resumeUrl').optional().isURL(),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobId, coverLetter = '', resumeUrl = '' } = req.body;
  const userId = req.user.id;

  // In a real app, save application to database and potentially redirect to job site
  res.json({
    success: true,
    message: 'Application submitted successfully',
    application: {
      userId,
      jobId,
      coverLetter,
      resumeUrl,
      appliedAt: new Date(),
      status: 'applied'
    }
  });
}));

// @desc    Get applied jobs
// @route   GET /api/jobs/applied
// @access  Private
router.get('/applied', protect, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // In a real app, fetch from database
  res.json({
    success: true,
    appliedJobs: [
      {
        jobId: 'mock-2',
        platform: 'rapid-api',
        appliedAt: new Date(Date.now() - 172800000),
        status: 'applied',
        job: {
          job_id: 'mock-2',
          job_title: 'Full Stack Developer',
          employer_name: 'StartupXYZ',
          job_city: 'New York',
          job_state: 'NY'
        }
      }
    ],
    count: 1
  });
}));

// @desc    Get job categories
// @route   GET /api/jobs/categories
// @access  Public
router.get('/categories', optional, asyncHandler(async (req, res) => {
  const result = await jobService.getJobCategories();
  res.json(result);
}));

// @desc    Get job market statistics
// @route   GET /api/jobs/statistics
// @access  Public
router.get('/statistics', optional, asyncHandler(async (req, res) => {
  const result = await jobService.getJobStatistics();
  res.json(result);
}));

// @desc    Remove saved job
// @route   DELETE /api/jobs/saved/:jobId
// @access  Private
router.delete('/saved/:jobId', [
  query('jobId').optional().isString().isLength({ max: 100 }),
  handleValidation
], protect, asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  // In a real app, remove from database
  res.json({
    success: true,
    message: 'Job removed from saved list',
    removedJobId: jobId
  });
}));

export default router;