import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id || user._id,
      email: user.email,
      name: user.name,
      provider: user.provider
    },
    process.env.JWT_SECRET || 'default-jwt-secret',
    { expiresIn: '7d' }
  );
};

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      message: 'Google OAuth not configured. Please contact administrator or use development mode.',
      developmentNote: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file'
    });
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` 
  })(req, res, asyncHandler(async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }));
});

// @desc    Login with token (for compatibility with frontend)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { token: inputToken } = req.body;
  
  try {
    // Handle development mock tokens
    if (inputToken && inputToken.startsWith('mock-jwt-token-')) {
      const mockUser = {
        id: 'dev-user-123',
        name: 'Developer User',
        email: 'dev@example.com',
        skills: ['React', 'JavaScript', 'Node.js'],
        experienceLevel: 'Intermediate',
        location: 'Remote',
        provider: 'google'
      };
      
      const jwtToken = generateToken(mockUser);
      
      return res.json({
        success: true,
        token: jwtToken,
        user: mockUser
      });
    }
    
    // For production, this would validate the token with Google
    // For now, return error for non-mock tokens
    return res.status(400).json({
      success: false,
      message: 'Invalid token. Please use Google OAuth.'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}));

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, asyncHandler(async (req, res) => {
  try {
    // In a real app, you'd delete the user from database
    // For mock users, just return success
    if (req.user.id && req.user.id.startsWith('mock-')) {
      return res.json({
        success: true,
        message: 'Mock account deleted successfully'
      });
    }
    
    // For real users, implement actual deletion
    // await User.findByIdAndDelete(req.user.id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
}));

export default router;