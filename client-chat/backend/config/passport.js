import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "/auth/google/callback"
  },
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // User exists, update their info
      user.lastLogin = new Date();
      user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
      await user.save();
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      provider: 'google',
      isVerified: true, // Google accounts are pre-verified
      lastLogin: new Date(),
      profile: {
        headline: '',
        summary: '',
        location: '',
        experienceLevel: 'entry',
        skills: [],
        interests: []
      }
    });
    
    return done(null, user);
    
  } catch (error) {
    console.error('Google OAuth Strategy Error:', error);
    
    // In development mode, create a mock user if database is not available
    if (process.env.NODE_ENV === 'development' && error.message.includes('buffering timed out')) {
      console.warn('Database not available, creating mock user for development');
      
      const mockUser = {
        id: 'mock-' + profile.id,
        googleId: profile.id,
        name: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        provider: 'google',
        isVerified: true,
        lastLogin: new Date(),
        profile: {
          headline: '',
          summary: '',
          location: '',
          experienceLevel: 'entry',
          skills: [],
          interests: []
        }
      };
      
      return done(null, mockUser);
    }
    
    return done(error, null);
  }
}));
} else {
  console.warn('Google OAuth credentials not found. Google authentication will not be available.');
  console.warn('To enable Google Auth, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file');
}

passport.serializeUser((user, done) => {
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Handle mock users in development
    if (typeof id === 'string' && id.startsWith('mock-')) {
      const mockUser = {
        id: id,
        name: 'Developer User',
        email: 'dev@example.com',
        provider: 'google'
      };
      return done(null, mockUser);
    }
    
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});

export default passport;