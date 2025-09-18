import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-jwt-secret');

      // Set user from payload (for development mode with mock users)
      if (decoded.userId && decoded.userId.startsWith('mock-')) {
        req.user = {
          id: decoded.userId,
          email: decoded.email || 'dev@example.com',
          name: decoded.name || 'Developer User',
          provider: 'google'
        };
      } else {
        // In a real app, you'd fetch the user from database
        // For now, use the decoded token data
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          provider: decoded.provider || 'google'
        };
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
});

export const optional = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-jwt-secret');

      if (decoded.userId && decoded.userId.startsWith('mock-')) {
        req.user = {
          id: decoded.userId,
          email: decoded.email || 'dev@example.com',
          name: decoded.name || 'Developer User',
          provider: 'google'
        };
      } else {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          provider: decoded.provider || 'google'
        };
      }
    } catch (error) {
      console.error('Optional auth error:', error);
      // Continue without user for optional auth
    }
  }

  next();
});

// Alias for backward compatibility
export const authenticateToken = protect;
