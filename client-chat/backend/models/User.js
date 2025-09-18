import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  headline: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    default: 'entry'
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    url: String
  }],
  portfolio: [{
    title: String,
    description: String,
    url: String,
    technologies: [String],
    images: [String]
  }]
});

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  firstName: {
    type: String,
    maxlength: [25, 'First name cannot be more than 25 characters']
  },
  lastName: {
    type: String,
    maxlength: [25, 'Last name cannot be more than 25 characters']
  },
  avatar: {
    type: String
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  provider: {
    type: String,
    enum: ['google', 'email'],
    default: 'google'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profile: profileSchema,
  preferences: {
    jobAlerts: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'recruiters'],
      default: 'public'
    },
    desiredSalaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']
    }],
    preferredLocations: [String]
  },
  resumeUrl: {
    type: String
  },
  resumeAnalysis: {
    score: Number,
    strengths: [String],
    improvements: [String],
    keywords: [String],
    lastAnalyzed: Date
  },
  savedJobs: [{
    jobId: String,
    platform: String,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  appliedJobs: [{
    jobId: String,
    platform: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied'
    }
  }],
  interviewPrep: {
    completedSessions: [{
      topic: String,
      score: Number,
      completedAt: Date
    }],
    weakAreas: [String],
    strongAreas: [String]
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'profile.experienceLevel': 1 });
userSchema.index({ 'profile.location': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);