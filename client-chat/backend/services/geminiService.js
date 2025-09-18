import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    
    console.log('🔑 Checking Gemini API key...');
    console.log('🔍 API key exists:', !!this.apiKey);
    console.log('🔍 API key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('🔍 API key preview:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none');
    
    if (this.apiKey && this.apiKey !== '{{GEMINI_API_KEY}}') {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error.message);
        this.model = null;
      }
    } else {
      console.warn('⚠️  Gemini API key not available, using mock responses');
    }

    // Conversation history for each user
    this.conversations = new Map();
    
    // System prompts for different contexts
    this.systemPrompts = {
      jobHunting: `You are an expert AI career counselor and job search assistant named "JobBot". 
        Your expertise includes:
        - Job search strategies and techniques
        - Resume optimization and ATS compliance
        - Interview preparation and practice
        - Career development and growth planning
        - Salary negotiation and benefits
        - Industry trends and market insights
        - Networking and professional development
        
        Always be encouraging, professional, and provide actionable advice. 
        Ask follow-up questions to better understand the user's situation and goals.
        Keep responses concise but informative, and use emojis appropriately to make conversations engaging.`,
      
      interview: `You are an expert interview coach specializing in technical and behavioral interviews.
        You help candidates prepare for interviews by:
        - Providing practice questions tailored to their role and experience level
        - Giving feedback on interview answers using the STAR method
        - Teaching interview strategies and techniques
        - Helping with salary negotiation
        - Building confidence and reducing anxiety
        
        Be supportive, constructive, and specific in your feedback.`,
      
      resume: `You are a professional resume writer and ATS optimization expert.
        You help job seekers by:
        - Analyzing resume content and structure
        - Suggesting improvements for ATS compliance
        - Optimizing keywords for specific job descriptions
        - Improving formatting and presentation
        - Highlighting achievements and quantifiable results
        
        Provide specific, actionable suggestions for improvement.`,
      
      career: `You are a career development specialist helping professionals advance their careers.
        You provide guidance on:
        - Career path planning and goal setting
        - Skill development and learning roadmaps
        - Industry transitions and pivots
        - Professional networking strategies
        - Work-life balance and career satisfaction
        
        Be strategic, forward-thinking, and supportive in your advice.`
    };
  }

  async generateResponse(message, userId, context = 'jobHunting', conversationHistory = []) {
    try {
      console.log('🤖 Gemini AI - Generating response...');
      console.log('💬 Message preview:', message.substring(0, 100) + '...');
      console.log('🔍 Context:', context);
      console.log('🔍 Model available:', !!this.model);
      
      if (!this.model) {
        console.log('⚠️ No model available, using mock response');
        return this.getMockResponse(message, context);
      }

      // Get or create conversation history
      const userHistory = this.conversations.get(userId) || [];
      
      // Build conversation context
      const systemPrompt = this.systemPrompts[context];
      const fullContext = `${systemPrompt}\n\nConversation History:\n${userHistory.slice(-10).join('\n')}\n\nUser: ${message}\n\nAssistant:`;

      console.log('🚀 Making API call to Gemini...');
      const result = await this.model.generateContent(fullContext);
      console.log('✅ API call successful, processing response...');
      const response = result.response.text();
      console.log('📝 Response length:', response.length);

      // Update conversation history
      userHistory.push(`User: ${message}`);
      userHistory.push(`Assistant: ${response}`);
      this.conversations.set(userId, userHistory.slice(-20)); // Keep last 20 messages

      return {
        success: true,
        response,
        context,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      console.error('🔍 Error type:', error.constructor.name);
      console.error('🔍 Full error:', error);
      if (error.response) {
        console.error('🔍 Response status:', error.response.status);
        console.error('🔍 Response data:', error.response.data);
      }
      console.log('🛠️ Falling back to mock response');
      return this.getMockResponse(message, context);
    }
  }

  getMockResponse(message, context) {
    const mockResponses = {
      jobHunting: [
        "🎯 Great question! Let me help you with your job search strategy. What specific role or industry are you targeting?",
        "💼 I'd be happy to assist with your job hunting journey! Could you tell me more about your background and career goals?",
        "🚀 Job searching can be challenging, but with the right approach, you'll find success! What's your biggest concern right now?",
        "📝 Let's work on optimizing your job search approach. Are you looking for advice on applications, networking, or interview preparation?"
      ],
      interview: [
        "🎤 Interview preparation is key to success! What type of interview are you preparing for - technical, behavioral, or both?",
        "💡 Great question about interviews! Let me help you practice. What role and company are you interviewing with?",
        "🎯 I can help you ace that interview! Would you like to practice common questions or work on your STAR method responses?",
        "📚 Interview success comes from preparation. What specific areas would you like to focus on?"
      ],
      resume: [
        "📄 Resume optimization is crucial for getting past ATS systems! Would you like me to review your resume or provide specific tips?",
        "✨ Let's make your resume stand out! What industry and role are you targeting?",
        "🔍 A well-crafted resume opens doors! Are you looking for formatting advice, content suggestions, or ATS optimization?",
        "💪 Your resume is your first impression - let's make it count! What challenges are you facing with your current resume?"
      ],
      career: [
        "🎯 Career planning is essential for long-term success! What are your current career goals and challenges?",
        "🚀 I'm here to help you advance your career! What specific area would you like to focus on - skill development, networking, or career transitions?",
        "💡 Career growth requires strategy and planning. Where do you see yourself in the next 2-3 years?",
        "📈 Let's work on your career development plan! What's your current role and where would you like to go next?"
      ]
    };

    const responses = mockResponses[context] || mockResponses.jobHunting;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: randomResponse,
      context,
      timestamp: new Date(),
      mock: true
    };
  }

  async generateJobMatchingInsights(userProfile, jobs) {
    try {
      if (!this.model) {
        return this.getMockJobInsights(userProfile, jobs);
      }

      const prompt = `Analyze these job opportunities for a candidate and provide insights:

      Candidate Profile:
      - Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
      - Experience Level: ${userProfile.experienceLevel || 'Not specified'}
      - Location: ${userProfile.location || 'Not specified'}

      Job Opportunities:
      ${jobs.slice(0, 5).map(job => `
      - ${job.job_title} at ${job.employer_name}
      - Location: ${job.job_city}, ${job.job_state}
      - Required Skills: ${job.job_required_skills?.join(', ') || 'Not specified'}
      `).join('\n')}

      Provide:
      1. Match percentage for each job (0-100%)
      2. Key strengths that align with each role
      3. Skills gaps to address for each role
      4. Recommended next steps for application
      
      Format as JSON with jobId, matchPercentage, strengths, gaps, recommendations.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        success: true,
        insights: response,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Job matching insights error:', error.message);
      return this.getMockJobInsights(userProfile, jobs);
    }
  }

  getMockJobInsights(userProfile, jobs) {
    const insights = jobs.slice(0, 5).map(job => ({
      jobId: job.job_id,
      jobTitle: job.job_title,
      company: job.employer_name,
      matchPercentage: Math.floor(Math.random() * 40) + 60, // 60-100%
      strengths: [
        "Strong technical background aligns well",
        "Experience level matches requirements",
        "Location preference is compatible"
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      gaps: [
        "Could benefit from additional certifications",
        "Consider gaining experience in specific technologies",
        "Networking within the industry would help"
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      recommendations: [
        "Tailor your resume for this specific role",
        "Research the company culture and recent news",
        "Prepare examples demonstrating relevant skills",
        "Consider reaching out to current employees on LinkedIn"
      ]
    }));

    return {
      success: true,
      insights,
      timestamp: new Date(),
      mock: true
    };
  }

  async generateInterviewQuestions(jobRole, experienceLevel, count = 10) {
    try {
      if (!this.model) {
        return this.getMockInterviewQuestions(jobRole, experienceLevel, count);
      }

      const prompt = `Generate ${count} realistic interview questions for a ${experienceLevel} level ${jobRole} position. 
      
      Include a mix of:
      - Technical questions specific to the role
      - Behavioral questions using STAR method
      - Situational questions
      - Company culture fit questions
      
      For each question, provide:
      1. The question
      2. Question type (technical, behavioral, situational, cultural)
      3. Difficulty level (easy, medium, hard)
      4. Key points to address in answer
      5. Example answer framework
      
      Format as JSON array.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        success: true,
        questions: JSON.parse(response),
        jobRole,
        experienceLevel,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Interview questions generation error:', error.message);
      return this.getMockInterviewQuestions(jobRole, experienceLevel, count);
    }
  }

  getMockInterviewQuestions(jobRole, experienceLevel, count) {
    const questionBank = {
      technical: [
        {
          question: "Explain the difference between == and === in JavaScript",
          type: "technical",
          difficulty: "easy",
          keyPoints: ["Type coercion", "Strict equality", "Best practices"],
          framework: "Define both operators, explain type coercion, provide examples, state best practices"
        },
        {
          question: "How would you optimize a slow-performing database query?",
          type: "technical", 
          difficulty: "medium",
          keyPoints: ["Indexing", "Query analysis", "Performance metrics"],
          framework: "Identify bottlenecks, discuss indexing strategies, mention profiling tools"
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time when you had to work with a difficult team member",
          type: "behavioral",
          difficulty: "medium", 
          keyPoints: ["Conflict resolution", "Communication", "Team dynamics"],
          framework: "Use STAR method - describe situation, task, action taken, and result achieved"
        },
        {
          question: "Describe a challenging project you worked on and how you overcame obstacles",
          type: "behavioral",
          difficulty: "medium",
          keyPoints: ["Problem solving", "Persistence", "Learning"],
          framework: "Explain the challenge, your approach to solving it, and what you learned"
        }
      ],
      situational: [
        {
          question: "How would you handle a situation where you missed an important deadline?",
          type: "situational",
          difficulty: "medium",
          keyPoints: ["Accountability", "Communication", "Problem solving"],
          framework: "Take responsibility, explain how you'd communicate, discuss prevention strategies"
        }
      ]
    };

    const allQuestions = [...questionBank.technical, ...questionBank.behavioral, ...questionBank.situational];
    const selectedQuestions = allQuestions.slice(0, count);

    return {
      success: true,
      questions: selectedQuestions,
      jobRole,
      experienceLevel,
      timestamp: new Date(),
      mock: true
    };
  }

  async evaluateInterviewAnswer(question, answer, jobRole) {
    try {
      if (!this.model) {
        return this.getMockAnswerEvaluation(question, answer);
      }

      const prompt = `Evaluate this interview answer for a ${jobRole} position:

      Question: ${question}
      Answer: ${answer}
      
      Provide detailed feedback including:
      1. Overall score (0-10)
      2. Specific strengths in the answer
      3. Areas for improvement
      4. Missing key points
      5. Suggestions for better responses
      6. Overall assessment
      
      Be constructive and encouraging while being honest about areas needing work.
      Format as JSON with score, strengths, improvements, suggestions, assessment.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        success: true,
        evaluation: JSON.parse(response),
        question,
        answer,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Answer evaluation error:', error.message);
      return this.getMockAnswerEvaluation(question, answer);
    }
  }

  getMockAnswerEvaluation(question, answer) {
    const score = Math.floor(Math.random() * 3) + 7; // 7-10 range
    
    return {
      success: true,
      evaluation: {
        score,
        strengths: [
          "Clear and concise communication",
          "Relevant examples provided", 
          "Good structure to the answer"
        ],
        improvements: [
          "Could provide more specific details",
          "Consider using the STAR method for behavioral questions",
          "Add quantifiable results where possible"
        ],
        suggestions: [
          "Practice articulating your thoughts more clearly",
          "Prepare specific examples from your experience",
          "Research common questions for your target role"
        ],
        assessment: `Good foundation in your answer with a score of ${score}/10. Focus on providing more specific examples and quantifiable results to strengthen your responses.`
      },
      question,
      answer,
      timestamp: new Date(),
      mock: true
    };
  }

  clearConversation(userId) {
    this.conversations.delete(userId);
  }

  getConversationHistory(userId) {
    return this.conversations.get(userId) || [];
  }
}

export default new GeminiService();