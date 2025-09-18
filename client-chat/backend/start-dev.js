import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'SESSION_SECRET'
];

function checkEnvironment() {
  const envFile = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envFile)) {
    console.log('⚠️  .env file not found. Creating from template...');
    
    const envTemplate = `# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/job-hunter

# Google OAuth (replace with your actual credentials)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret
SESSION_SECRET=your-session-secret-change-this-in-production

# APIs
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads`;
    
    fs.writeFileSync(envFile, envTemplate);
    console.log('✅ Created .env file from template');
  }
  
  // Load environment variables
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(varName => {
    return !envContent.includes(`${varName}=`) || 
           envContent.includes(`${varName}=your_`) ||
           envContent.includes(`${varName}={{`);
  });
  
  if (missingVars.length > 0) {
    console.log('\n⚠️  Warning: The following environment variables need to be configured:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n📝 Instructions:');
    console.log('1. Get Google OAuth credentials from: https://console.developers.google.com/');
    console.log('2. Generate JWT and Session secrets (use random strings)');
    console.log('3. Get API keys from OpenAI, RapidAPI, and YouTube (optional for development)');
    console.log('4. Update the .env file with your actual values\n');
    
    console.log('🔄 Starting in development mode with fallback authentication...\n');
  }
}

function startServer() {
  console.log('🚀 Starting Job Hunter Backend Server...\n');
  
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });
  
  server.on('close', (code) => {
    console.log(`\n🛑 Server stopped with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}

// Main execution
console.log('🔍 Checking environment configuration...');
checkEnvironment();
startServer();