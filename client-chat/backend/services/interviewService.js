import geminiService from './geminiService.js';

class InterviewService {
  constructor() {
    
    // Common interview questions by category
    this.questionBank = {
      technical: [
        "Explain the difference between var, let, and const in JavaScript.",
        "What is the virtual DOM in React and how does it work?",
        "How does asynchronous programming work in JavaScript?",
        "What are the principles of object-oriented programming?",
        "Explain the concept of closures in JavaScript.",
        "What is the difference between SQL and NoSQL databases?",
        "How would you optimize a slow-performing database query?",
        "What are microservices and what are their advantages?",
        "Explain the concept of RESTful APIs.",
        "What is Git and how do you resolve merge conflicts?"
      ],
      behavioral: [
        "Tell me about yourself.",
        "Why are you interested in this position?",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "Tell me about a time when you had to work with a difficult team member.",
        "How do you handle tight deadlines and pressure?",
        "Describe a time when you had to learn a new technology quickly.",
        "Tell me about a mistake you made and how you handled it.",
        "Where do you see yourself in 5 years?",
        "Why are you leaving your current job?",
        "What motivates you at work?"
      ],
      situational: [
        "How would you handle a situation where you disagree with your manager's decision?",
        "What would you do if you discovered a security vulnerability in the system?",
        "How would you approach working on a project with unclear requirements?",
        "What would you do if a team member wasn't contributing to the project?",
        "How would you handle a situation where you missed an important deadline?",
        "What would you do if you had to work with a technology you've never used before?",
        "How would you prioritize multiple urgent tasks?",
        "What would you do if you found a bug in production code right before a major release?",
        "How would you handle client feedback that conflicts with technical best practices?",
        "What would you do if you realized you made an error that affected other team members?"
      ],
      company: [
        "What do you know about our company?",
        "Why do you want to work here?",
        "How do you think you can contribute to our team?",
        "What interests you most about our industry?",
        "How do you align with our company values?",
        "What do you think are the biggest challenges facing our industry?",
        "How would you improve our product/service?",
        "What questions do you have for us?",
        "What makes you a good fit for our company culture?",
        "How do you handle working in a fast-paced/startup environment?"
      ]
    };
  }

  async generateInterviewQuestions(jobRole, experienceLevel, count = 10) {
    try {
      // Use Gemini AI service for generating interview questions
      const result = await geminiService.generateInterviewQuestions(jobRole, experienceLevel, count);
      
      if (result.success) {
        return {
          success: true,
          questions: result.questions,
          jobRole,
          experienceLevel,
          count: result.questions.length,
          aiGenerated: !result.mock
        };
      }
      
      // Fallback to mock questions if Gemini fails
      return this.getMockQuestions(jobRole, experienceLevel, count);

    } catch (error) {
      console.error('Generate interview questions error:', error.message);
      return this.getMockQuestions(jobRole, experienceLevel, count);
    }
  }

  getMockQuestions(jobRole, experienceLevel, count) {
    const allQuestions = [...this.questionBank.technical, ...this.questionBank.behavioral, ...this.questionBank.situational];
    const selectedQuestions = [];

    // Select questions based on role and experience level
    const categories = ['technical', 'behavioral', 'situational'];
    const questionsPerCategory = Math.ceil(count / categories.length);

    categories.forEach(category => {
      const categoryQuestions = this.questionBank[category];
      const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, questionsPerCategory);
      
      selected.forEach(question => {
        selectedQuestions.push({
          question,
          category,
          difficulty: this.getDifficulty(experienceLevel),
          expectedAnswer: this.getExpectedAnswer(question, category)
        });
      });
    });

    return {
      success: true,
      questions: selectedQuestions.slice(0, count),
      jobRole,
      experienceLevel,
      count: Math.min(selectedQuestions.length, count),
      mock: true
    };
  }

  getDifficulty(experienceLevel) {
    const difficultyMap = {
      'entry': 'easy',
      'junior': 'easy',
      'mid': 'medium',
      'senior': 'hard',
      'lead': 'hard',
      'executive': 'hard'
    };
    return difficultyMap[experienceLevel] || 'medium';
  }

  getExpectedAnswer(question, category) {
    // Simplified expected answer logic
    if (category === 'technical') {
      return 'Provide a clear technical explanation with examples if possible.';
    } else if (category === 'behavioral') {
      return 'Use the STAR method (Situation, Task, Action, Result) to structure your response.';
    } else {
      return 'Think through the scenario step-by-step and explain your reasoning.';
    }
  }

  async evaluateAnswer(question, answer, jobRole) {
    try {
      // Use Gemini AI service for evaluating interview answers
      const result = await geminiService.evaluateInterviewAnswer(question, answer, jobRole);
      
      if (result.success) {
        return {
          success: true,
          evaluation: {
            ...result.evaluation,
            question,
            answer,
            aiGenerated: !result.mock
          }
        };
      }
      
      // Fallback to mock evaluation if Gemini fails
      return this.getMockEvaluation(question, answer);

    } catch (error) {
      console.error('Evaluate answer error:', error.message);
      return this.getMockEvaluation(question, answer);
    }
  }

  getMockEvaluation(question, answer) {
    const score = Math.floor(Math.random() * 4) + 6; // Score between 6-10
    
    return {
      success: true,
      evaluation: {
        score,
        strengths: [
          'Good understanding of the topic',
          'Clear communication',
          'Relevant examples provided'
        ],
        improvements: [
          'Could provide more specific details',
          'Consider mentioning edge cases',
          'Structure answer more systematically'
        ],
        suggestions: [
          'Practice the STAR method for behavioral questions',
          'Research common technical concepts',
          'Prepare specific examples from your experience'
        ],
        question,
        answer
      },
      mock: true
    };
  }

  async startPracticeSession(sessionType, jobRole, experienceLevel) {
    const questionCount = sessionType === 'quick' ? 5 : sessionType === 'standard' ? 10 : 15;
    const questions = await this.generateInterviewQuestions(jobRole, experienceLevel, questionCount);
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      session: {
        id: sessionId,
        type: sessionType,
        jobRole,
        experienceLevel,
        questions: questions.questions,
        startedAt: new Date(),
        status: 'active',
        currentQuestionIndex: 0,
        answers: []
      }
    };
  }

  async getInterviewTips(category = 'general') {
    const tips = {
      general: [
        "Research the company thoroughly before the interview",
        "Practice your elevator pitch - a 30-second summary of who you are",
        "Prepare specific examples that demonstrate your skills and achievements",
        "Dress appropriately for the company culture",
        "Arrive 10-15 minutes early",
        "Bring multiple copies of your resume",
        "Prepare thoughtful questions to ask the interviewer",
        "Practice good body language - maintain eye contact and sit up straight",
        "Follow up with a thank-you note within 24 hours"
      ],
      technical: [
        "Review fundamental concepts in your field",
        "Practice coding problems on platforms like LeetCode or HackerRank",
        "Be prepared to explain your thought process out loud",
        "Know how to analyze time and space complexity",
        "Review system design concepts for senior positions",
        "Practice writing code on a whiteboard or paper",
        "Be familiar with the company's tech stack",
        "Prepare to discuss your past projects in detail"
      ],
      behavioral: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Prepare examples that show leadership, problem-solving, and teamwork",
        "Be honest about challenges and what you learned from them",
        "Show enthusiasm and passion for the role",
        "Demonstrate cultural fit with the company",
        "Be prepared to discuss career goals",
        "Practice active listening during the interview",
        "Show curiosity about the role and company"
      ]
    };

    return {
      success: true,
      category,
      tips: tips[category] || tips.general
    };
  }

  async generatePersonalizedInterviewPrep(userProfile, targetRole, companyInfo = {}) {
    try {
      const prompt = `Create a personalized interview preparation plan for this candidate:

Candidate Profile:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Entry level'}
- Target Role: ${targetRole}
- Company: ${companyInfo.name || 'General tech company'}
- Company Industry: ${companyInfo.industry || 'Technology'}

Generate a comprehensive interview prep plan including:
1. Key areas to focus on based on their background
2. Specific technical topics to review
3. Behavioral questions they should prepare for
4. Company-specific research recommendations
5. Common mistakes to avoid for their experience level
6. Timeline for preparation (1-2 weeks)

Make it actionable and specific to their profile.`;

      const result = await geminiService.generateResponse(prompt, userProfile.id || 'anonymous', 'interview');
      
      if (result.success) {
        return {
          success: true,
          prepPlan: {
            content: result.response,
            targetRole,
            userProfile: {
              experienceLevel: userProfile.experienceLevel,
              skills: userProfile.skills
            },
            companyInfo,
            generatedAt: new Date(),
            aiGenerated: true
          }
        };
      }
      
      return this.getMockPrepPlan(userProfile, targetRole, companyInfo);

    } catch (error) {
      console.error('Generate personalized prep error:', error.message);
      return this.getMockPrepPlan(userProfile, targetRole, companyInfo);
    }
  }

  getMockPrepPlan(userProfile, targetRole, companyInfo) {
    const experienceLevel = userProfile.experienceLevel || 'entry';
    
    return {
      success: true,
      prepPlan: {
        content: `Personalized Interview Preparation Plan for ${targetRole}\n\nBased on your ${experienceLevel} level experience, here's your preparation roadmap:\n\n1. Technical Focus Areas:\n- Review core concepts in your skill areas: ${userProfile.skills?.join(', ') || 'fundamental programming concepts'}\n- Practice coding problems appropriate for ${experienceLevel} level\n- Prepare to discuss your project experience in detail\n\n2. Behavioral Preparation:\n- Practice STAR method responses\n- Prepare examples of challenges you've overcome\n- Think about times you've learned new technologies quickly\n\n3. Company Research:\n- Research ${companyInfo.name || 'the company'}'s mission and values\n- Understand their products and recent developments\n- Prepare thoughtful questions about the role and team\n\n4. Timeline:\n- Week 1: Technical review and practice problems\n- Week 2: Behavioral prep and company research\n- Final days: Mock interviews and final review`,
        targetRole,
        userProfile,
        companyInfo,
        generatedAt: new Date(),
        mock: true
      }
    };
  }

  async generateCompanySpecificQuestions(companyName, role) {
    try {
      const prompt = `Generate 8-10 company-specific interview questions that ${companyName} might ask for a ${role} position. Include:

1. Questions about the company's mission and values
2. Questions about their products/services
3. Industry-specific challenges they might ask about
4. Role-specific questions related to their needs
5. Culture-fit questions

Make them realistic and based on what tech companies typically ask.`;

      const result = await geminiService.generateResponse(prompt, `${companyName}_${role}`, 'interview');
      
      if (result.success) {
        // Try to parse structured questions from the response
        const questions = this.parseQuestionsFromText(result.response, 'company');
        
        return {
          success: true,
          questions,
          companyName,
          role,
          aiGenerated: true
        };
      }
      
      return this.getMockCompanyQuestions(companyName, role);

    } catch (error) {
      console.error('Generate company questions error:', error.message);
      return this.getMockCompanyQuestions(companyName, role);
    }
  }

  parseQuestionsFromText(text, category) {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    
    for (const line of lines) {
      // Look for lines that look like questions (contain ? or start with numbers)
      if (line.includes('?') || /^\d+\./.test(line.trim())) {
        const cleanQuestion = line.replace(/^\d+\.\s*/, '').trim();
        if (cleanQuestion.length > 10) {
          questions.push({
            question: cleanQuestion,
            category,
            difficulty: 'medium',
            expectedAnswer: 'Research the company and role thoroughly to provide a thoughtful, specific response.'
          });
        }
      }
    }
    
    return questions.slice(0, 10); // Limit to 10 questions
  }

  getMockCompanyQuestions(companyName, role) {
    const questions = [
      {
        question: `Why do you want to work at ${companyName} specifically?`,
        category: 'company',
        difficulty: 'medium',
        expectedAnswer: 'Research the company\'s mission, values, and recent achievements. Show genuine interest.'
      },
      {
        question: `How would you contribute to ${companyName}'s mission?`,
        category: 'company',
        difficulty: 'medium',
        expectedAnswer: 'Connect your skills and experience to their goals and challenges.'
      },
      {
        question: `What do you know about ${companyName}'s products/services?`,
        category: 'company',
        difficulty: 'easy',
        expectedAnswer: 'Demonstrate knowledge of their main offerings and recent developments.'
      },
      {
        question: `How do you see the ${role} role evolving at ${companyName}?`,
        category: 'company',
        difficulty: 'hard',
        expectedAnswer: 'Show understanding of industry trends and how they might impact the role.'
      },
      {
        question: `What challenges do you think ${companyName} faces in the current market?`,
        category: 'company',
        difficulty: 'hard',
        expectedAnswer: 'Show industry knowledge and analytical thinking about business challenges.'
      }
    ];

    return {
      success: true,
      questions,
      companyName,
      role,
      mock: true
    };
  }

  async generateInterviewFeedback(sessionData) {
    try {
      const { questions, answers, jobRole, overallPerformance } = sessionData;
      
      const prompt = `Analyze this interview practice session and provide comprehensive feedback:

Job Role: ${jobRole}
Questions Asked: ${questions.length}
Answers Provided: ${answers.length}

Session Summary:
${answers.map((answer, index) => `Q${index + 1}: ${questions[index]?.question || 'Question'}\nA${index + 1}: ${answer.text || 'No answer provided'}\n`).join('\n')}

Provide detailed feedback including:
1. Overall performance assessment
2. Strengths demonstrated
3. Areas needing improvement
4. Specific recommendations for each weak area
5. Next steps for improvement
6. Practice recommendations

Be constructive and specific.`;

      const result = await geminiService.generateResponse(prompt, sessionData.userId || 'anonymous', 'interview');
      
      if (result.success) {
        return {
          success: true,
          feedback: {
            overall: result.response,
            sessionData,
            improvementPlan: this.generateImprovementPlan(answers, questions),
            nextSteps: this.generateNextSteps(overallPerformance),
            generatedAt: new Date(),
            aiGenerated: true
          }
        };
      }
      
      return this.getMockSessionFeedback(sessionData);

    } catch (error) {
      console.error('Generate interview feedback error:', error.message);
      return this.getMockSessionFeedback(sessionData);
    }
  }

  generateImprovementPlan(answers, questions) {
    const plan = [];
    const weakAreas = ['technical communication', 'specific examples', 'confidence'];
    
    weakAreas.forEach(area => {
      plan.push({
        area,
        recommendation: `Practice ${area} through mock interviews and preparation exercises`,
        priority: 'medium',
        timeframe: '1-2 weeks'
      });
    });
    
    return plan;
  }

  generateNextSteps(performance) {
    const score = performance?.averageScore || 7;
    
    if (score >= 8) {
      return [
        'Continue practicing with company-specific questions',
        'Focus on advanced technical topics',
        'Prepare thoughtful questions for interviewers'
      ];
    } else if (score >= 6) {
      return [
        'Practice more behavioral questions using STAR method',
        'Review technical fundamentals',
        'Work on providing more specific examples'
      ];
    } else {
      return [
        'Focus on basic interview skills and confidence building',
        'Practice common questions daily',
        'Consider doing more mock interviews'
      ];
    }
  }

  getMockSessionFeedback(sessionData) {
    return {
      success: true,
      feedback: {
        overall: `Good interview practice session! You answered ${sessionData.answers?.length || 0} questions. Focus on providing more specific examples and improving technical communication. Keep practicing to build confidence.`,
        sessionData,
        improvementPlan: this.generateImprovementPlan([]),
        nextSteps: this.generateNextSteps({ averageScore: 7 }),
        generatedAt: new Date(),
        mock: true
      }
    };
  }

  async getCommonMistakes() {
    return {
      success: true,
      mistakes: [
        {
          mistake: "Not researching the company",
          impact: "Shows lack of interest and preparation",
          solution: "Spend at least 30 minutes researching the company, its products, and recent news"
        },
        {
          mistake: "Speaking negatively about previous employers",
          impact: "Creates concern about professionalism",
          solution: "Focus on what you learned and how you grew from past experiences"
        },
        {
          mistake: "Not preparing questions to ask",
          impact: "Appears disinterested in the role",
          solution: "Prepare 3-5 thoughtful questions about the role, team, and company"
        },
        {
          mistake: "Being too vague in answers",
          impact: "Doesn't demonstrate real experience or skills",
          solution: "Use specific examples with measurable results when possible"
        },
        {
          mistake: "Not following up after the interview",
          impact: "Missed opportunity to reinforce interest",
          solution: "Send a personalized thank-you email within 24 hours"
        },
        {
          mistake: "Arriving unprepared for technical questions",
          impact: "Appears incompetent for the role",
          solution: "Practice relevant technical concepts and coding problems"
        },
        {
          mistake: "Poor body language",
          impact: "Conveys nervousness or disinterest",
          solution: "Practice maintaining eye contact, good posture, and confident gestures"
        },
        {
          mistake: "Not asking for clarification on unclear questions",
          impact: "May answer the wrong question",
          solution: "It's okay to ask for clarification or a moment to think"
        }
      ]
    };
  }
}

export default new InterviewService();