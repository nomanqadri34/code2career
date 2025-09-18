# Job Hunter - AI-Powered Job Search Platform

## 🎯 Overview

Job Hunter is a comprehensive AI-powered platform designed to help job seekers find opportunities, prepare for interviews, optimize resumes, and advance their careers. The platform integrates with multiple APIs and services to provide a complete job hunting experience.

## ✨ Features

### 🔍 Job Search & Discovery
- **RapidAPI Integration**: Search jobs from multiple sources
- **Smart Recommendations**: AI-powered job matching based on skills and experience
- **Job Tracking**: Save and track job applications
- **Advanced Filters**: Filter by location, salary, experience level, and more

### 🎤 Interview Preparation
- **AI-Generated Questions**: Custom interview questions based on role and experience
- **Practice Sessions**: Timed interview practice with scoring
- **Answer Evaluation**: AI feedback on interview responses
- **Interview Tips**: Comprehensive guidance for different interview types

### 📄 Resume Analysis & Optimization
- **File Upload**: Support for PDF, DOC, DOCX, and TXT formats
- **AI Analysis**: Comprehensive resume scoring and feedback
- **ATS Optimization**: Ensure your resume passes Applicant Tracking Systems
- **Improvement Suggestions**: Specific recommendations for resume enhancement
- **Job Matching**: Compare resume against specific job descriptions

### 🎓 Career Guidance
- **YouTube Integration**: Curated career guidance videos
- **Personalized Content**: Content based on your skills and experience level
- **Career Roadmaps**: Step-by-step career advancement plans
- **Industry Insights**: Latest trends and required skills
- **Mentor Directory**: Connect with industry professionals

### 👤 User Management
- **Google OAuth**: Secure authentication with Google
- **Profile Management**: Comprehensive user profiles
- **Dashboard Analytics**: Track your job search progress
- **Activity Feed**: Monitor your job search activities

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Google OAuth** for authentication
- **OpenAI** for AI-powered features
- **RapidAPI** for job search
- **YouTube API** for career content
- **Multer** for file uploads
- **JWT** for secure sessions

### Frontend
- **React** with Vite
- **Zustand** for state management
- **Axios** for API communication
- **React Router** for navigation
- **Lucide Icons** for UI elements

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (optional for development)
- Google OAuth credentials
- API keys (OpenAI, RapidAPI, YouTube)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
The backend will automatically create a `.env` template file. Update it with your actual credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Secrets
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
```

4. **Start the development server:**
```bash
npm run dev
# or
node start-dev.js
```

The backend server will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to project root:**
```bash
cd ..
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update frontend environment variables:**
Update `.env` file with your Google Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. **Start the frontend development server:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔑 API Key Setup Guide

### 1. Google OAuth Setup
1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:8000/auth/google/callback`
6. Copy Client ID and Client Secret

### 2. OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create account
3. Go to API Keys section
4. Create new API key
5. Copy the key (keep it secure!)

### 3. RapidAPI Key
1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up for free account
3. Go to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
4. Subscribe to free plan
5. Copy your API key from the dashboard

### 4. YouTube API Key
1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Enable YouTube Data API v3
3. Create API key credentials
4. Copy the API key

## 📚 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/:jobId` - Get job details
- `POST /api/jobs/recommendations` - Get personalized recommendations
- `POST /api/jobs/save` - Save job
- `GET /api/jobs/saved` - Get saved jobs

### Interview Preparation
- `POST /api/interview/questions/generate` - Generate interview questions
- `POST /api/interview/session/start` - Start practice session
- `POST /api/interview/answer/evaluate` - Evaluate answer
- `GET /api/interview/tips` - Get interview tips

### Resume
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/analyze` - Analyze resume
- `POST /api/resume/improve` - Generate improved resume
- `POST /api/resume/compare` - Compare with job description

### Career Guidance
- `GET /api/career/videos/search` - Search career videos
- `GET /api/career/trending` - Get trending topics
- `POST /api/career/personalized` - Get personalized content
- `GET /api/career/mentors` - Get career mentors

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Get dashboard stats

## 🔧 Development Features

- **Mock Data**: Fallback data when APIs are not available
- **Development Authentication**: Mock login for testing
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: API protection
- **File Validation**: Secure file upload with type checking
- **CORS Configuration**: Proper cross-origin setup

## 🚦 Running in Production

### Environment Variables
Update all placeholder values in `.env` files with production credentials.

### Database
Set up MongoDB instance and update `MONGODB_URI`.

### Security
- Use strong JWT and session secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up rate limiting
- Use environment-specific configuration

## 🛡 Security Features

- Google OAuth authentication
- JWT token validation
- Request rate limiting
- File upload validation
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**: Check if all environment variables are set
2. **Google Auth not working**: Verify OAuth credentials and redirect URIs
3. **File upload fails**: Check file size limits and upload directory permissions
4. **API errors**: Ensure all API keys are valid and have proper permissions

### Development Mode

The application is designed to work in development mode even without all API keys configured. It will use mock data and fallback authentication for testing purposes.

## 📞 Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.