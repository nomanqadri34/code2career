import axios from 'axios';

class CareerService {
  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    this.youtubeApiUrl = 'https://www.googleapis.com/youtube/v3';
    
    // Mock career content for development
    this.mockCareerVideos = [
      {
        id: { videoId: 'mock-video-1' },
        snippet: {
          title: 'How to Ace Your Software Developer Interview',
          description: 'Learn the essential tips and tricks to succeed in your next software developer interview. Covers technical questions, behavioral interviews, and salary negotiation.',
          channelTitle: 'Tech Career Guide',
          publishedAt: '2024-01-15T10:00:00Z',
          thumbnails: {
            medium: { url: 'https://via.placeholder.com/320x180?text=Interview+Tips' }
          }
        },
        statistics: {
          viewCount: '125000',
          likeCount: '8500'
        }
      },
      {
        id: { videoId: 'mock-video-2' },
        snippet: {
          title: '10 Skills Every Developer Should Have in 2024',
          description: 'Stay ahead in your tech career with these essential skills. From cloud computing to AI/ML, discover what employers are looking for.',
          channelTitle: 'Developer Skills Hub',
          publishedAt: '2024-01-10T15:30:00Z',
          thumbnails: {
            medium: { url: 'https://via.placeholder.com/320x180?text=Developer+Skills' }
          }
        },
        statistics: {
          viewCount: '89000',
          likeCount: '6200'
        }
      },
      {
        id: { videoId: 'mock-video-3' },
        snippet: {
          title: 'Building Your Developer Portfolio: Complete Guide',
          description: 'Create an impressive developer portfolio that gets you hired. Learn what projects to include, how to showcase your work, and common mistakes to avoid.',
          channelTitle: 'Code Career Coach',
          publishedAt: '2024-01-05T12:00:00Z',
          thumbnails: {
            medium: { url: 'https://via.placeholder.com/320x180?text=Portfolio+Guide' }
          }
        },
        statistics: {
          viewCount: '156000',
          likeCount: '12500'
        }
      },
      {
        id: { videoId: 'mock-video-4' },
        snippet: {
          title: 'Remote Work Best Practices for Developers',
          description: 'Master remote work as a developer. Tips for productivity, communication, work-life balance, and building relationships with remote teams.',
          channelTitle: 'Remote Dev Life',
          publishedAt: '2024-01-01T09:00:00Z',
          thumbnails: {
            medium: { url: 'https://via.placeholder.com/320x180?text=Remote+Work' }
          }
        },
        statistics: {
          viewCount: '73000',
          likeCount: '4800'
        }
      },
      {
        id: { videoId: 'mock-video-5' },
        snippet: {
          title: 'Career Change to Software Development: A Complete Roadmap',
          description: 'Thinking of switching careers to software development? This comprehensive guide covers everything from learning to code to landing your first job.',
          channelTitle: 'Career Transition Guide',
          publishedAt: '2023-12-28T14:00:00Z',
          thumbnails: {
            medium: { url: 'https://via.placeholder.com/320x180?text=Career+Change' }
          }
        },
        statistics: {
          viewCount: '234000',
          likeCount: '18900'
        }
      }
    ];

    // Career topics and related search terms
    this.careerTopics = {
      'interview-preparation': [
        'software developer interview',
        'coding interview tips',
        'technical interview preparation',
        'behavioral interview questions'
      ],
      'skill-development': [
        'programming skills 2024',
        'developer skills roadmap',
        'learning new technology',
        'upskilling for developers'
      ],
      'career-growth': [
        'software developer career path',
        'promotion tips developers',
        'senior developer skills',
        'tech leadership career'
      ],
      'portfolio-building': [
        'developer portfolio examples',
        'GitHub portfolio tips',
        'coding projects for resume',
        'showcase developer work'
      ],
      'job-search': [
        'developer job search tips',
        'tech job applications',
        'finding remote developer jobs',
        'tech recruiting process'
      ],
      'work-life-balance': [
        'developer work life balance',
        'remote work tips developers',
        'avoiding burnout programming',
        'healthy coding habits'
      ]
    };
  }

  async searchCareerVideos(topic = 'software developer career', maxResults = 10) {
    try {
      if (!this.youtubeApiKey || this.youtubeApiKey === '{{YOUTUBE_API_KEY}}') {
        console.warn('YouTube API key not available, returning mock data');
        return this.getMockVideos(topic, maxResults);
      }

      const searchParams = {
        part: 'snippet',
        q: topic,
        type: 'video',
        maxResults,
        order: 'relevance',
        videoDuration: 'medium', // 4-20 minutes
        key: this.youtubeApiKey
      };

      const response = await axios.get(`${this.youtubeApiUrl}/search`, {
        params: searchParams,
        timeout: 10000
      });

      if (response.data && response.data.items) {
        // Get video statistics for the found videos
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        const statsResponse = await axios.get(`${this.youtubeApiUrl}/videos`, {
          params: {
            part: 'statistics',
            id: videoIds,
            key: this.youtubeApiKey
          },
          timeout: 10000
        });

        const videos = response.data.items.map(video => {
          const stats = statsResponse.data.items.find(stat => stat.id === video.id.videoId);
          return {
            ...video,
            statistics: stats ? stats.statistics : {},
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
          };
        });

        return {
          success: true,
          videos,
          topic,
          count: videos.length,
          source: 'youtube-api'
        };
      }

      throw new Error('No videos found');

    } catch (error) {
      console.error('YouTube API error:', error.message);
      return this.getMockVideos(topic, maxResults);
    }
  }

  getMockVideos(topic, maxResults) {
    let videos = [...this.mockCareerVideos];
    
    // Filter based on topic keywords
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('interview')) {
      videos = videos.filter(v => v.snippet.title.toLowerCase().includes('interview'));
    } else if (topicLower.includes('skills')) {
      videos = videos.filter(v => v.snippet.title.toLowerCase().includes('skills'));
    } else if (topicLower.includes('portfolio')) {
      videos = videos.filter(v => v.snippet.title.toLowerCase().includes('portfolio'));
    } else if (topicLower.includes('remote')) {
      videos = videos.filter(v => v.snippet.title.toLowerCase().includes('remote'));
    } else if (topicLower.includes('career change')) {
      videos = videos.filter(v => v.snippet.title.toLowerCase().includes('career'));
    }

    // If no specific filter matches, return all videos
    if (videos.length === 0) {
      videos = this.mockCareerVideos;
    }

    // Add URL to mock videos
    videos = videos.map(video => ({
      ...video,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`
    }));

    return {
      success: true,
      videos: videos.slice(0, maxResults),
      topic,
      count: Math.min(videos.length, maxResults),
      source: 'mock-data'
    };
  }

  async getCareerGuidanceByCategory(category = 'general') {
    const categoryTopics = this.careerTopics[category] || ['software developer career'];
    const searchTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
    
    return await this.searchCareerVideos(searchTopic, 8);
  }

  async getPersonalizedCareerContent(userProfile) {
    const { skills = [], experienceLevel = 'entry', interests = [] } = userProfile;
    
    let searchTopics = [];
    
    // Generate search topics based on experience level
    if (experienceLevel === 'entry' || experienceLevel === 'junior') {
      searchTopics.push(
        'entry level developer tips',
        'junior developer career advice',
        'first programming job'
      );
    } else if (experienceLevel === 'mid') {
      searchTopics.push(
        'mid level developer career growth',
        'becoming senior developer',
        'developer leadership skills'
      );
    } else if (experienceLevel === 'senior' || experienceLevel === 'lead') {
      searchTopics.push(
        'senior developer career path',
        'tech leadership advice',
        'engineering management'
      );
    }

    // Add skill-specific topics
    skills.forEach(skill => {
      if (skill.toLowerCase().includes('react')) {
        searchTopics.push('react developer career');
      } else if (skill.toLowerCase().includes('python')) {
        searchTopics.push('python developer jobs');
      } else if (skill.toLowerCase().includes('node')) {
        searchTopics.push('nodejs developer career');
      }
    });

    // Add interest-based topics
    interests.forEach(interest => {
      searchTopics.push(`${interest} developer career`);
    });

    // If no specific topics, use general
    if (searchTopics.length === 0) {
      searchTopics.push('software developer career advice');
    }

    // Get videos for a random topic
    const selectedTopic = searchTopics[Math.floor(Math.random() * searchTopics.length)];
    const result = await this.searchCareerVideos(selectedTopic, 6);

    return {
      ...result,
      personalized: true,
      basedOn: {
        experienceLevel,
        skills,
        interests
      }
    };
  }

  async getTrendingCareerTopics() {
    return {
      success: true,
      trendingTopics: [
        {
          topic: 'AI and Machine Learning Careers',
          description: 'Breaking into AI/ML roles and required skills',
          searchTerm: 'artificial intelligence developer career',
          popularity: 95
        },
        {
          topic: 'Remote Work Best Practices',
          description: 'Succeeding in remote development roles',
          searchTerm: 'remote software developer tips',
          popularity: 88
        },
        {
          topic: 'Cloud Computing Skills',
          description: 'Essential cloud skills for modern developers',
          searchTerm: 'cloud developer skills AWS Azure',
          popularity: 82
        },
        {
          topic: 'DevOps Career Path',
          description: 'Transitioning to DevOps and infrastructure',
          searchTerm: 'devops engineer career transition',
          popularity: 78
        },
        {
          topic: 'Tech Interview Preparation',
          description: 'Latest trends in technical interviews',
          searchTerm: 'software engineer interview 2024',
          popularity: 92
        },
        {
          topic: 'Career Change to Tech',
          description: 'Successfully switching to a tech career',
          searchTerm: 'career change software development',
          popularity: 85
        },
        {
          topic: 'Freelance Development',
          description: 'Building a successful freelance career',
          searchTerm: 'freelance developer business tips',
          popularity: 72
        },
        {
          topic: 'Open Source Contributions',
          description: 'Using open source to advance your career',
          searchTerm: 'open source developer career benefits',
          popularity: 68
        }
      ]
    };
  }

  async getCareerMentors() {
    return {
      success: true,
      mentors: [
        {
          name: 'Tech Lead',
          channel: 'Tech Lead',
          description: 'Former Google, Facebook engineer sharing career insights',
          subscribers: '1.2M',
          expertise: ['Career Advice', 'Big Tech', 'Engineering Leadership'],
          avatar: 'https://via.placeholder.com/64x64?text=TL'
        },
        {
          name: 'Clement Mihailescu',
          channel: 'Clement Mihailescu',
          description: 'AlgoExpert founder, former Google engineer',
          subscribers: '150K',
          expertise: ['Interview Prep', 'Algorithms', 'Career Growth'],
          avatar: 'https://via.placeholder.com/64x64?text=CM'
        },
        {
          name: 'Mayuko',
          channel: 'mayuko',
          description: 'Software engineer sharing tech career experiences',
          subscribers: '450K',
          expertise: ['Work-Life Balance', 'Career Transitions', 'Tech Culture'],
          avatar: 'https://via.placeholder.com/64x64?text=MY'
        },
        {
          name: 'ForrestKnight',
          channel: 'ForrestKnight',
          description: 'Self-taught developer helping others learn to code',
          subscribers: '380K',
          expertise: ['Self-Learning', 'Web Development', 'Career Change'],
          avatar: 'https://via.placeholder.com/64x64?text=FK'
        },
        {
          name: 'SimpleProgrammer',
          channel: 'SimpleProgrammer',
          description: 'Programming career advice and soft skills',
          subscribers: '200K',
          expertise: ['Career Development', 'Soft Skills', 'Programming'],
          avatar: 'https://via.placeholder.com/64x64?text=SP'
        }
      ]
    };
  }

  async getCareerEvents() {
    return {
      success: true,
      events: [
        {
          title: 'Tech Career Fair 2024',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          type: 'Virtual',
          description: 'Connect with top tech companies and explore career opportunities',
          companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
          registrationUrl: 'https://example.com/tech-career-fair',
          tags: ['Career Fair', 'Networking', 'Job Search']
        },
        {
          title: 'Developer Networking Meetup',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          type: 'In-Person',
          location: 'San Francisco, CA',
          description: 'Monthly meetup for software developers to network and share experiences',
          registrationUrl: 'https://example.com/dev-meetup',
          tags: ['Networking', 'Community', 'Learning']
        },
        {
          title: 'Resume Review Workshop',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
          type: 'Virtual',
          description: 'Get your resume reviewed by industry professionals',
          registrationUrl: 'https://example.com/resume-workshop',
          tags: ['Resume', 'Workshop', 'Career Advice']
        }
      ]
    };
  }

  async getCareerResources() {
    return {
      success: true,
      resources: {
        books: [
          {
            title: 'Cracking the Coding Interview',
            author: 'Gayle McDowell',
            description: 'Essential guide for technical interview preparation',
            category: 'Interview Prep',
            rating: 4.5
          },
          {
            title: 'The Pragmatic Programmer',
            author: 'David Thomas, Andrew Hunt',
            description: 'From journeyman to master - essential software development practices',
            category: 'Professional Development',
            rating: 4.8
          },
          {
            title: 'Clean Code',
            author: 'Robert Martin',
            description: 'A handbook of agile software craftsmanship',
            category: 'Technical Skills',
            rating: 4.6
          }
        ],
        websites: [
          {
            name: 'LeetCode',
            url: 'https://leetcode.com',
            description: 'Practice coding problems and prepare for technical interviews',
            category: 'Interview Prep'
          },
          {
            name: 'Glassdoor',
            url: 'https://glassdoor.com',
            description: 'Company reviews, salaries, and interview experiences',
            category: 'Company Research'
          },
          {
            name: 'Stack Overflow',
            url: 'https://stackoverflow.com',
            description: 'Programming Q&A community and knowledge sharing',
            category: 'Technical Help'
          }
        ],
        podcasts: [
          {
            name: 'Software Engineering Daily',
            description: 'Daily podcast covering software engineering topics',
            category: 'Technical Learning'
          },
          {
            name: 'The Changelog',
            description: 'Conversations with developers about technology and career',
            category: 'Career Insights'
          },
          {
            name: 'Developer Tea',
            description: 'Short episodes designed for developers\' tea breaks',
            category: 'Professional Development'
          }
        ]
      }
    };
  }
}

export default new CareerService();