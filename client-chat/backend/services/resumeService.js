import geminiService from './geminiService.js';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

class ResumeService {
  constructor() {
    
    this.allowedFileTypes = ['.doc', '.docx', '.txt'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  async parseResume(filePath, originalName) {
    try {
      const fileExtension = path.extname(originalName).toLowerCase();
      
      if (!this.allowedFileTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      let resumeText = '';

      switch (fileExtension) {
        case '.pdf':
          throw new Error('PDF parsing temporarily unavailable. Please upload a Word document (.doc/.docx) or text file instead.');
          break;
        
        case '.doc':
        case '.docx':
          const docData = await mammoth.extractRawText({ buffer: fileBuffer });
          resumeText = docData.value;
          break;
        
        case '.txt':
          resumeText = fileBuffer.toString('utf8');
          break;
        
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      if (!resumeText.trim()) {
        throw new Error('Could not extract text from the file');
      }

      return {
        success: true,
        text: resumeText,
        metadata: {
          originalName,
          fileType: fileExtension,
          fileSize: fileBuffer.length,
          wordCount: resumeText.split(/\s+/).length,
          characterCount: resumeText.length
        }
      };

    } catch (error) {
      console.error('Resume parsing error:', error.message);
      throw error;
    }
  }

  async analyzeResume(resumeText, targetJobRole = 'Software Developer') {
    try {
      const prompt = `Analyze this resume for a ${targetJobRole} position:

${resumeText}

Provide a comprehensive analysis including:
1. Overall score (0-100)
2. Strengths (array of strings)
3. Weaknesses (array of strings)
4. Missing skills for the role (array of strings)
5. Specific improvement suggestions (array of strings)
6. Keyword optimization recommendations (array of strings)
7. ATS (Applicant Tracking System) compatibility score (0-100)
8. Section feedback (contact info, summary, experience, education, skills)

Format the response as JSON with these exact field names: score, strengths, weaknesses, missingSkills, improvements, keywords, atsScore, sectionFeedback.`;

      const result = await geminiService.generateResponse(prompt, 'resume_analysis', 'resume');
      
      if (result.success) {
        try {
          // Try to parse the AI response as JSON
          const cleanedResponse = result.response.replace(/```json\n?|\n?```/g, '').trim();
          const analysis = JSON.parse(cleanedResponse);
          
          return {
            success: true,
            analysis: {
              ...analysis,
              analyzedAt: new Date(),
              targetJobRole,
              textLength: resumeText.length,
              aiGenerated: true
            }
          };
        } catch (parseError) {
          console.warn('Failed to parse AI response as JSON, using text parsing');
          return this.parseAnalysisFromText(result.response, resumeText, targetJobRole);
        }
      }
      
      // Fallback to mock analysis
      return this.getMockAnalysis(resumeText, targetJobRole);

    } catch (error) {
      console.error('Resume analysis error:', error.message);
      return this.getMockAnalysis(resumeText, targetJobRole);
    }
  }

  parseAnalysisFromText(aiResponse, resumeText, targetJobRole) {
    // Extract key information from AI text response
    const scoreMatch = aiResponse.match(/score[^\d]*([\d]+)/i);
    const atsMatch = aiResponse.match(/ats[^\d]*([\d]+)/i);
    
    // Extract lists using patterns
    const strengthsSection = this.extractListFromText(aiResponse, 'strength');
    const weaknessesSection = this.extractListFromText(aiResponse, 'weakness');
    const improvementsSection = this.extractListFromText(aiResponse, 'improvement|suggestion');
    const keywordsSection = this.extractListFromText(aiResponse, 'keyword');
    const missingSkillsSection = this.extractListFromText(aiResponse, 'missing.*skill|skill.*gap');
    
    return {
      success: true,
      analysis: {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 75,
        strengths: strengthsSection.length > 0 ? strengthsSection : [
          'Resume shows relevant experience',
          'Clear professional background'
        ],
        weaknesses: weaknessesSection.length > 0 ? weaknessesSection : [
          'Could use more quantifiable achievements',
          'Some sections need better formatting'
        ],
        missingSkills: missingSkillsSection.length > 0 ? missingSkillsSection : [
          'Modern frameworks knowledge',
          'Cloud platform experience'
        ],
        improvements: improvementsSection.length > 0 ? improvementsSection : [
          'Add more specific achievements with metrics',
          'Optimize keywords for ATS compatibility',
          'Improve section organization'
        ],
        keywords: keywordsSection.length > 0 ? keywordsSection : [
          targetJobRole.toLowerCase(),
          'collaboration',
          'problem-solving',
          'project management'
        ],
        atsScore: atsMatch ? parseInt(atsMatch[1]) : 72,
        sectionFeedback: this.generateSectionFeedback(resumeText),
        analyzedAt: new Date(),
        targetJobRole,
        textLength: resumeText.length,
        aiGenerated: true
      }
    };
  }

  extractListFromText(text, pattern) {
    const regex = new RegExp(`${pattern}[\\s\\S]*?(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) return [];
    
    const section = match[0];
    const items = [];
    const lines = section.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[\d\-\*•]|^[a-zA-Z]/)) {
        const cleaned = trimmed.replace(/^[\d\-\*•\.\)\s]+/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 150) {
          items.push(cleaned);
        }
      }
    }
    
    return items.slice(0, 5); // Limit to 5 items
  }

  generateSectionFeedback(resumeText) {
    const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
    const hasExperience = /experience|worked|developed|managed|led/i.test(resumeText);
    const hasSkills = /skills|technologies|programming|languages/i.test(resumeText);
    const hasEducation = /education|degree|university|college/i.test(resumeText);
    
    return {
      contactInfo: hasContactInfo ? 
        'Contact information appears complete' : 
        'Missing or incomplete contact information',
      summary: 'Consider adding a compelling professional summary',
      experience: hasExperience ? 
        'Work experience is present but could be enhanced with more metrics' : 
        'Work experience section needs improvement',
      education: hasEducation ? 
        'Education section is included' : 
        'Education information should be added',
      skills: hasSkills ? 
        'Skills section is present - consider organizing by category' : 
        'Skills section needs to be added or improved',
      achievements: 'Add more quantifiable achievements and results'
    };
  }

  getMockAnalysis(resumeText, targetJobRole) {
    const wordCount = resumeText.split(/\s+/).length;
    const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
    const hasTechnicalSkills = /javascript|python|java|react|node|sql/i.test(resumeText);
    const hasExperience = /experience|worked|developed|managed|led/i.test(resumeText);
    
    let score = 65; // Base score
    if (hasContactInfo) score += 10;
    if (hasTechnicalSkills) score += 15;
    if (hasExperience) score += 10;
    if (wordCount > 200 && wordCount < 800) score += 10;

    return {
      success: true,
      analysis: {
        score: Math.min(score, 95),
        strengths: [
          'Clear professional experience outlined',
          'Technical skills are mentioned',
          'Good formatting and structure',
          hasContactInfo ? 'Complete contact information' : null
        ].filter(Boolean),
        weaknesses: [
          'Could use more specific achievements with metrics',
          'Missing some industry-relevant keywords',
          wordCount < 200 ? 'Resume appears too short' : null,
          wordCount > 1000 ? 'Resume may be too lengthy' : null,
          !hasContactInfo ? 'Missing complete contact information' : null
        ].filter(Boolean),
        missingSkills: [
          'Cloud platforms (AWS, Azure)',
          'Version control (Git)',
          'Testing frameworks',
          'Project management experience',
          'Leadership/mentoring experience'
        ],
        improvements: [
          'Add quantifiable achievements (e.g., "Increased performance by 40%")',
          'Include more action verbs at the start of bullet points',
          'Add a professional summary section',
          'Optimize for ATS with standard section headings',
          'Include relevant certifications if available'
        ],
        keywords: [
          targetJobRole.toLowerCase(),
          'agile',
          'scrum',
          'collaboration',
          'problem-solving',
          'full-stack',
          'API development',
          'database design'
        ],
        atsScore: 72,
        sectionFeedback: {
          contactInfo: hasContactInfo ? 'Good - Complete contact information provided' : 'Missing - Add email, phone, LinkedIn profile',
          summary: 'Consider adding a professional summary at the top',
          experience: hasExperience ? 'Present but could be more detailed with metrics' : 'Missing or unclear work experience',
          education: 'Education section could be more prominent',
          skills: hasTechnicalSkills ? 'Good technical skills listed' : 'Add more relevant technical skills',
          achievements: 'Add more quantifiable achievements and results'
        },
        analyzedAt: new Date(),
        targetJobRole,
        textLength: resumeText.length,
        mock: true
      }
    };
  }

  async generateImprovedResume(resumeText, analysisResult, targetJobRole) {
    try {
      const improvements = analysisResult.improvements?.join('\n- ') || '';
      const keywords = analysisResult.keywords?.join(', ') || '';

      const prompt = `Improve this resume for a ${targetJobRole} position based on the analysis:

Original Resume:
${resumeText}

Key improvements needed:
- ${improvements}

Keywords to incorporate: ${keywords}

Please rewrite the resume to:
1. Add a compelling professional summary
2. Improve bullet points with action verbs and quantifiable results
3. Better organize sections
4. Include relevant keywords naturally
5. Optimize for ATS scanning

Maintain the same factual information but present it more effectively.`;

      const result = await geminiService.generateResponse(prompt, 'resume_improvement', 'resume');
      
      if (result.success) {
        return {
          success: true,
          improvedResume: result.response,
          originalLength: resumeText.length,
          improvedLength: result.response.length,
          improvementsApplied: analysisResult.improvements,
          keywordsAdded: analysisResult.keywords,
          aiGenerated: true
        };
      }
      
      return {
        success: false,
        message: 'Unable to generate improved resume at this time. Please try again.'
      };

    } catch (error) {
      console.error('Resume improvement error:', error.message);
      throw error;
    }
  }

  async compareWithJobDescription(resumeText, jobDescription) {
    try {
      const prompt = `Compare this resume against the job description and provide matching analysis:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide analysis in JSON format with:
1. matchScore (0-100) - overall compatibility
2. matchingSkills (array) - skills that match the job requirements
3. missingSkills (array) - required skills not found in resume
4. matchingExperience (array) - relevant experience that matches
5. missingExperience (array) - experience gaps for the role
6. recommendations (array) - specific suggestions to improve match
7. keywordGaps (array) - important keywords missing from resume`;

      const result = await geminiService.generateResponse(prompt, 'job_comparison', 'resume');
      
      if (result.success) {
        try {
          const cleanedResponse = result.response.replace(/```json\n?|\n?```/g, '').trim();
          const comparison = JSON.parse(cleanedResponse);
          
          return {
            success: true,
            comparison: {
              ...comparison,
              analyzedAt: new Date(),
              aiGenerated: true
            }
          };
        } catch (parseError) {
          console.warn('Failed to parse job comparison JSON, using text parsing');
          return this.parseJobComparisonFromText(result.response, resumeText, jobDescription);
        }
      }
      
      return this.getMockJobComparison(resumeText, jobDescription);

    } catch (error) {
      console.error('Job comparison error:', error.message);
      return this.getMockJobComparison(resumeText, jobDescription);
    }
  }

  parseJobComparisonFromText(aiResponse, resumeText, jobDescription) {
    // Extract match score
    const scoreMatch = aiResponse.match(/match.*score[^\d]*([\d]+)/i);
    const matchScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    
    // Extract skills from both texts for comparison
    const resumeSkills = this.extractSkillsFromText(resumeText);
    const jobSkills = this.extractSkillsFromText(jobDescription);
    
    const matchingSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const missingSkills = jobSkills.filter(skill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase())
      )
    ).slice(0, 5);
    
    return {
      success: true,
      comparison: {
        matchScore,
        matchingSkills: matchingSkills.slice(0, 5),
        missingSkills,
        matchingExperience: [
          'Relevant work experience found',
          'Project experience aligns with requirements'
        ],
        missingExperience: [
          'Could benefit from more leadership experience',
          'Additional industry-specific experience would help'
        ],
        recommendations: [
          'Highlight relevant projects more prominently',
          'Add quantifiable achievements in key areas',
          'Include missing keywords naturally in descriptions'
        ],
        keywordGaps: missingSkills.slice(0, 5),
        analyzedAt: new Date(),
        aiGenerated: true
      }
    };
  }

  extractSkillsFromText(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL',
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Testing', 'Leadership', 'Management'
    ];
    
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    for (const skill of commonSkills) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  getMockJobComparison(resumeText, jobDescription) {
    return {
      success: true,
      comparison: {
        matchScore: 78,
        matchingSkills: ['JavaScript', 'React', 'Node.js', 'Problem Solving', 'Team Collaboration'],
        missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'Microservices'],
        matchingExperience: [
          'Frontend development with React',
          'API integration experience',
          'Team collaboration and code reviews'
        ],
        missingExperience: [
          'Cloud platform experience (AWS/Azure)',
          'DevOps and CI/CD pipeline experience',
          'Leadership or mentoring experience'
        ],
        recommendations: [
          'Add TypeScript experience or training',
          'Highlight any cloud platform exposure',
          'Emphasize scalability and performance optimization work',
          'Include metrics on team collaboration and project outcomes'
        ],
        keywordGaps: ['scalable', 'microservices', 'cloud-native', 'DevOps', 'CI/CD'],
        analyzedAt: new Date(),
        mock: true
      }
    };
  }

  async getResumeTemplates(category = 'tech') {
    const templates = {
      tech: [
        {
          id: 'modern-tech',
          name: 'Modern Tech Resume',
          description: 'Clean, ATS-friendly design optimized for software developers',
          features: ['Technical skills section', 'Project showcase', 'GitHub integration'],
          preview: '/templates/modern-tech-preview.png'
        },
        {
          id: 'senior-engineer',
          name: 'Senior Engineer',
          description: 'Leadership-focused template for senior technical roles',
          features: ['Leadership experience', 'Architecture decisions', 'Team management'],
          preview: '/templates/senior-engineer-preview.png'
        }
      ],
      general: [
        {
          id: 'professional',
          name: 'Professional',
          description: 'Traditional format suitable for most industries',
          features: ['Classic layout', 'Professional formatting', 'Versatile design'],
          preview: '/templates/professional-preview.png'
        },
        {
          id: 'creative',
          name: 'Creative',
          description: 'Eye-catching design for creative roles',
          features: ['Visual elements', 'Color accents', 'Creative sections'],
          preview: '/templates/creative-preview.png'
        }
      ]
    };

    return {
      success: true,
      category,
      templates: templates[category] || templates.general
    };
  }

  async getIndustryKeywords(industry = 'technology') {
    const keywords = {
      technology: {
        technical: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Git', 'API', 'Database', 'SQL', 'NoSQL', 'Microservices', 'DevOps', 'CI/CD'],
        soft: ['Problem-solving', 'Team collaboration', 'Agile', 'Scrum', 'Communication', 'Leadership', 'Mentoring', 'Innovation', 'Adaptability'],
        action: ['Developed', 'Implemented', 'Designed', 'Optimized', 'Scaled', 'Led', 'Mentored', 'Architected', 'Delivered', 'Improved']
      },
      marketing: {
        technical: ['SEO', 'SEM', 'Google Analytics', 'Social Media', 'CRM', 'Marketing Automation', 'A/B Testing', 'Conversion Optimization'],
        soft: ['Creative thinking', 'Brand management', 'Customer focus', 'Communication', 'Data analysis', 'Strategic planning'],
        action: ['Launched', 'Increased', 'Generated', 'Optimized', 'Managed', 'Analyzed', 'Created', 'Implemented']
      },
      finance: {
        technical: ['Financial modeling', 'Excel', 'SQL', 'Python', 'R', 'Risk management', 'Compliance', 'Audit', 'Investment analysis'],
        soft: ['Attention to detail', 'Analytical thinking', 'Risk assessment', 'Communication', 'Ethics', 'Decision making'],
        action: ['Analyzed', 'Managed', 'Assessed', 'Evaluated', 'Reduced', 'Improved', 'Implemented', 'Monitored']
      }
    };

    return {
      success: true,
      industry,
      keywords: keywords[industry] || keywords.technology
    };
  }
}

export default new ResumeService();