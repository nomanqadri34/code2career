# AI Job Hunter Chat Client

A modern, chat-based AI-powered job search interface built with React and Vercel AI SDK.

## 🚀 Features

- **Chat-Based Interface**: Natural language job search through conversational AI
- **AI-Powered Job Matching**: Uses OpenAI GPT models for intelligent job recommendations
- **Real-Time Job Search**: Integrates with existing backend API for live job data
- **Authentication**: Secure login with Descope authentication
- **Responsive Design**: Mobile-first design that works on all devices
- **Job Management**: Save jobs, apply directly, and track applications
- **Interactive Job Cards**: Rich job displays with AI match scores

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **AI**: Vercel AI SDK with OpenAI GPT-4o-mini
- **Authentication**: Descope React SDK
- **State Management**: Zustand
- **Styling**: Custom CSS with modern design system
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+
- Existing backend server running on port 8000
- OpenAI API key
- Descope project configured

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_DESCOPE_PROJECT_ID=your_descope_project_id
OPENAI_API_KEY=your_openai_api_key
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## 💬 Chat Features

### Natural Language Job Search

Users can search for jobs using natural language:

- "Find software developer jobs in New York"
- "Show me remote positions for React developers"
- "I'm looking for entry-level marketing jobs"

### AI Assistant Capabilities

- Job search and filtering
- Career advice and guidance
- Interview preparation tips
- Resume optimization suggestions
- Salary negotiation guidance

## 🔧 Backend Integration

The client integrates with the existing backend APIs:

- `/api/auth/*` - Authentication endpoints
- `/api/jobs/*` - Job search and management
- `/api/user/*` - User profile management
- `/api/resume/*` - Resume upload and analysis

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Vercel**: Automatic deployment with environment variables
- **Netlify**: Connect repo for continuous deployment  
- **AWS S3**: Static hosting with CloudFront CDN

---

**Happy Job Hunting with AI! 🎯🤖**
