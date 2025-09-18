class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    if (!this.apiKey) {
      console.error('VITE_GEMINI_API_KEY not found in environment variables');
    }
  }

  async sendMessage(message, context = 'career') {
    try {
      // Try Gemini API first if key is available
      if (this.apiKey && this.apiKey !== 'your-api-key-here') {
        try {
          const systemPrompt = this.getSystemPrompt(context);
          const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

          const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: fullPrompt
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
            return {
              success: true,
              message: text,
              timestamp: new Date().toISOString()
            };
          }
        } catch (apiError) {
          console.warn('Gemini API failed, using fallback:', apiError.message);
        }
      }

      // Fallback to intelligent career responses
      const response = this.generateCareerResponse(message, context);
      return {
        success: true,
        message: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Career assistant error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get career advice'
      };
    }
  }

  generateCareerResponse(message, context) {
    const messageLower = message.toLowerCase();
    
    // Job search responses
    if (messageLower.includes('job search') || messageLower.includes('find job') || messageLower.includes('job hunting')) {
      return `Here's a comprehensive job search strategy:

**1. Optimize Your Online Presence**
- Update your LinkedIn profile with relevant keywords
- Ensure your resume is ATS-friendly
- Create a professional portfolio if applicable

**2. Target Your Search**
- Use job boards like LinkedIn, Indeed, Glassdoor
- Research companies you want to work for
- Set up job alerts for relevant positions

**3. Network Effectively**
- Reach out to connections in your industry
- Attend virtual networking events
- Join professional associations

**4. Application Strategy**
- Tailor your resume for each application
- Write compelling cover letters
- Follow up professionally

What specific aspect of job searching would you like to focus on?`;
    }

    // Resume responses
    if (messageLower.includes('resume') || messageLower.includes('cv')) {
      return `Here are key resume optimization tips:

**Structure & Format**
- Use a clean, professional layout
- Keep it to 1-2 pages maximum
- Use consistent formatting and fonts

**Content Optimization**
- Start with a strong professional summary
- Use action verbs and quantify achievements
- Include relevant keywords from job descriptions
- Focus on results and impact, not just duties

**Key Sections**
- Contact information
- Professional summary
- Work experience (reverse chronological)
- Skills (technical and soft skills)
- Education and certifications

**ATS Optimization**
- Use standard section headings
- Avoid graphics, tables, or unusual formatting
- Save as both PDF and Word formats

Would you like specific advice for any section of your resume?`;
    }

    // Interview responses
    if (messageLower.includes('interview') || messageLower.includes('preparation')) {
      return `Complete interview preparation guide:

**Before the Interview**
- Research the company thoroughly
- Review the job description and requirements
- Prepare STAR method examples
- Practice common interview questions
- Prepare thoughtful questions to ask

**Common Question Categories**
- Tell me about yourself
- Why do you want this role/company?
- Describe a challenge you overcame
- Where do you see yourself in 5 years?
- What are your strengths/weaknesses?

**STAR Method Framework**
- **Situation**: Set the context
- **Task**: Describe your responsibility
- **Action**: Explain what you did
- **Result**: Share the outcome

**Day of Interview**
- Arrive 10-15 minutes early
- Bring multiple copies of your resume
- Dress appropriately for the company culture
- Follow up with a thank-you email within 24 hours

What type of interview are you preparing for?`;
    }

    // Career development responses
    if (messageLower.includes('career') || messageLower.includes('growth') || messageLower.includes('development')) {
      return `Strategic career development approach:

**Self-Assessment**
- Identify your strengths and interests
- Clarify your values and priorities
- Set short-term and long-term goals

**Skill Development**
- Stay current with industry trends
- Pursue relevant certifications
- Develop both technical and soft skills
- Seek feedback and act on it

**Professional Growth**
- Build a strong professional network
- Find mentors in your field
- Take on challenging projects
- Consider lateral moves for experience

**Career Planning**
- Create a 2-3 year career roadmap
- Regularly review and adjust your goals
- Document your achievements
- Build your personal brand

**Next Steps**
- Identify 2-3 specific skills to develop
- Set up informational interviews
- Join professional organizations
- Create a learning schedule

What specific area of career development interests you most?`;
    }

    // Salary negotiation
    if (messageLower.includes('salary') || messageLower.includes('negotiation') || messageLower.includes('compensation')) {
      return `Salary negotiation strategy:

**Research Phase**
- Use sites like Glassdoor, PayScale, Levels.fyi
- Consider location, experience, and company size
- Research total compensation (benefits, equity, etc.)

**Preparation**
- Know your worth and market value
- Prepare your accomplishments and value proposition
- Practice your negotiation conversation
- Consider non-salary benefits

**Negotiation Tips**
- Wait for the offer before discussing salary
- Express enthusiasm for the role first
- Present a range rather than a single number
- Be prepared to justify your request
- Consider the entire package, not just base salary

**What to Negotiate**
- Base salary
- Signing bonus
- Vacation time
- Flexible work arrangements
- Professional development budget
- Stock options or equity

**Follow-up**
- Get the final offer in writing
- Be gracious regardless of the outcome
- Maintain positive relationships

What specific aspect of compensation are you most interested in discussing?`;
    }

    // Networking responses
    if (messageLower.includes('network') || messageLower.includes('connections')) {
      return `Professional networking strategies:

**Online Networking**
- Optimize your LinkedIn profile
- Engage with industry content regularly
- Join relevant LinkedIn groups
- Share valuable insights and articles

**In-Person Networking**
- Attend industry conferences and meetups
- Join professional associations
- Participate in alumni events
- Volunteer for causes you care about

**Relationship Building**
- Focus on giving value, not just receiving
- Follow up within 48 hours of meeting someone
- Schedule regular check-ins with your network
- Offer help and introductions to others

**Networking Conversation Starters**
- "What trends are you seeing in our industry?"
- "What's the most exciting project you're working on?"
- "How did you get started in this field?"
- "What advice would you give someone in my position?"

**Maintaining Your Network**
- Send periodic updates on your career
- Congratulate connections on achievements
- Share relevant opportunities
- Express gratitude for help received

What networking challenge would you like help with?`;
    }

    // Default career advice
    return `I'm here to help with your career development! I can provide guidance on:

🎯 **Job Search Strategy** - Finding and applying for the right opportunities
📄 **Resume Optimization** - Making your resume stand out to employers
🎤 **Interview Preparation** - Mastering different types of interviews
🚀 **Career Development** - Planning your professional growth
💰 **Salary Negotiation** - Getting the compensation you deserve
🌐 **Professional Networking** - Building valuable connections

What specific career topic would you like to explore? Feel free to ask about:
- Job search techniques
- Resume writing tips
- Interview strategies
- Career planning
- Skill development
- Industry insights
- Work-life balance

I'm here to provide personalized, actionable advice for your career journey!`;
  }

  getSystemPrompt(context) {
    const basePrompt = `You are an expert AI Career Assistant specializing in job hunting, career development, and professional growth. You provide personalized, actionable advice to help users advance their careers.

Your expertise includes:
- Job search strategies and techniques
- Resume writing and optimization
- Interview preparation and practice
- Career planning and development
- Skill development recommendations
- Industry insights and trends
- Networking strategies
- Salary negotiation
- Professional branding
- Career transitions

Guidelines:
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Use examples and real-world scenarios
- Be encouraging and supportive
- Stay current with job market trends
- Tailor advice to the user's experience level
- Suggest concrete next steps
- Be concise but comprehensive`;

    const contextPrompts = {
      career: basePrompt,
      jobSearch: `${basePrompt}\n\nFocus specifically on job search strategies, application techniques, and finding the right opportunities.`,
      interview: `${basePrompt}\n\nSpecialize in interview preparation, common questions, behavioral interviews, and presentation skills.`,
      resume: `${basePrompt}\n\nExpertise in resume writing, formatting, keyword optimization, and tailoring resumes for specific roles.`,
      networking: `${basePrompt}\n\nFocus on professional networking, LinkedIn optimization, industry connections, and relationship building.`
    };

    return contextPrompts[context] || basePrompt;
  }

  async getCareerAdvice(situation, userProfile = {}) {
    try {
      const profileContext = userProfile ? 
        `User Profile: ${JSON.stringify(userProfile, null, 2)}\n\n` : '';
      
      const prompt = `${profileContext}Career Situation: ${situation}\n\nProvide specific career advice and actionable recommendations.`;
      
      return await this.sendMessage(prompt, 'career');
    } catch (error) {
      console.error('Career advice error:', error);
      throw error;
    }
  }

  async generateInterviewQuestions(jobTitle, experienceLevel = 'mid') {
    try {
      const prompt = `Generate 10 relevant interview questions for a ${jobTitle} position at ${experienceLevel} level. Include a mix of technical, behavioral, and situational questions. Format as a numbered list.`;
      
      return await this.sendMessage(prompt, 'interview');
    } catch (error) {
      console.error('Interview questions error:', error);
      throw error;
    }
  }

  async reviewResume(resumeText) {
    try {
      const prompt = `Please review this resume and provide specific feedback on:
1. Content and structure
2. Keywords and ATS optimization
3. Areas for improvement
4. Strengths to highlight
5. Formatting suggestions

Resume:
${resumeText}`;
      
      return await this.sendMessage(prompt, 'resume');
    } catch (error) {
      console.error('Resume review error:', error);
      throw error;
    }
  }

  async getJobSearchStrategy(targetRole, experience, location) {
    try {
      const prompt = `Create a comprehensive job search strategy for:
- Target Role: ${targetRole}
- Experience Level: ${experience}
- Location: ${location}

Include specific platforms, networking strategies, and timeline recommendations.`;
      
      return await this.sendMessage(prompt, 'jobSearch');
    } catch (error) {
      console.error('Job search strategy error:', error);
      throw error;
    }
  }
}

export default new GeminiService();