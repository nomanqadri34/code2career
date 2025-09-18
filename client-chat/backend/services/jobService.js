import axios from 'axios';

class JobService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.rapidApiHost = 'jsearch.p.rapidapi.com';
    
    // Mock job data for development when API is not available
    this.mockJobs = [
      {
        job_id: 'mock-1',
        job_title: 'Senior React Developer',
        employer_name: 'Tech Corp',
        employer_logo: 'https://via.placeholder.com/100',
        job_employment_type: 'FULLTIME',
        job_city: 'San Francisco',
        job_state: 'CA',
        job_country: 'US',
        job_posted_at_datetime_utc: new Date().toISOString(),
        job_description: 'We are looking for a Senior React Developer to join our team. You will be responsible for developing and maintaining web applications using React, Redux, and other modern technologies.',
        job_apply_link: 'https://example.com/apply/mock-1',
        job_salary_currency: 'USD',
        job_min_salary: 120000,
        job_max_salary: 180000,
        job_benefits: ['Health Insurance', '401k', 'Remote Work'],
        job_required_experience: {
          no_experience_required: false,
          required_experience_in_months: 60
        },
        job_required_skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'CSS'],
        job_required_education: {
          postgraduate_degree: false,
          professional_certification: false,
          high_school: false,
          associates_degree: false,
          bachelors_degree: true,
          degree_mentioned: true
        }
      },
      {
        job_id: 'mock-2',
        job_title: 'Full Stack Developer',
        employer_name: 'StartupXYZ',
        employer_logo: 'https://via.placeholder.com/100',
        job_employment_type: 'FULLTIME',
        job_city: 'New York',
        job_state: 'NY',
        job_country: 'US',
        job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
        job_description: 'Join our dynamic startup as a Full Stack Developer. Work with cutting-edge technologies including Node.js, React, and cloud services.',
        job_apply_link: 'https://example.com/apply/mock-2',
        job_salary_currency: 'USD',
        job_min_salary: 90000,
        job_max_salary: 140000,
        job_benefits: ['Equity', 'Health Insurance', 'Flexible Hours'],
        job_required_experience: {
          no_experience_required: false,
          required_experience_in_months: 36
        },
        job_required_skills: ['Node.js', 'React', 'MongoDB', 'Express', 'AWS'],
        job_required_education: {
          postgraduate_degree: false,
          professional_certification: false,
          high_school: false,
          associates_degree: false,
          bachelors_degree: true,
          degree_mentioned: true
        }
      },
      {
        job_id: 'mock-3',
        job_title: 'Frontend Developer',
        employer_name: 'Design Agency',
        employer_logo: 'https://via.placeholder.com/100',
        job_employment_type: 'CONTRACT',
        job_city: 'Austin',
        job_state: 'TX',
        job_country: 'US',
        job_posted_at_datetime_utc: new Date(Date.now() - 172800000).toISOString(),
        job_description: 'We need a talented Frontend Developer to work on exciting client projects. Must have strong skills in modern CSS, JavaScript, and React.',
        job_apply_link: 'https://example.com/apply/mock-3',
        job_salary_currency: 'USD',
        job_min_salary: 70,
        job_max_salary: 100,
        job_benefits: ['Remote Work', 'Flexible Schedule'],
        job_required_experience: {
          no_experience_required: false,
          required_experience_in_months: 24
        },
        job_required_skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
        job_required_education: {
          postgraduate_degree: false,
          professional_certification: false,
          high_school: false,
          associates_degree: true,
          bachelors_degree: false,
          degree_mentioned: true
        }
      }
    ];
  }

  async searchJobs(query, filters = {}) {
    try {
      if (!this.rapidApiKey || this.rapidApiKey === '{{RAPIDAPI_KEY}}') {
        console.warn('RapidAPI key not available, returning mock data');
        return this.getMockJobs(query, filters);
      }

      const params = {
        query: query,
        page: filters.page || '1',
        num_pages: filters.num_pages || '1',
        date_posted: filters.date_posted || 'all',
        job_requirements: filters.job_requirements || '',
        employment_types: filters.employment_types || '',
        job_titles: filters.job_titles || '',
        company_types: filters.company_types || '',
        employer: filters.employer || '',
        radius: filters.radius || '25',
        country: filters.country || 'US'
      };

      const response = await axios.get(`https://${this.rapidApiHost}/search`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        },
        params,
        timeout: 10000
      });

      if (response.data && response.data.data) {
        return {
          success: true,
          jobs: response.data.data,
          parameters: response.data.parameters || {},
          count: response.data.data.length
        };
      }

      throw new Error('Invalid response from job API');

    } catch (error) {
      console.error('Job search error:', error.message);
      
      // Fallback to mock data on error
      console.warn('Falling back to mock job data');
      return this.getMockJobs(query, filters);
    }
  }

  getMockJobs(query = '', filters = {}) {
    let jobs = [...this.mockJobs];

    // Simple filtering based on query
    if (query) {
      const queryLower = query.toLowerCase();
      jobs = jobs.filter(job => 
        job.job_title.toLowerCase().includes(queryLower) ||
        job.job_description.toLowerCase().includes(queryLower) ||
        job.employer_name.toLowerCase().includes(queryLower) ||
        job.job_required_skills.some(skill => skill.toLowerCase().includes(queryLower))
      );
    }

    // Filter by employment type
    if (filters.employment_types) {
      const types = filters.employment_types.split(',');
      jobs = jobs.filter(job => 
        types.some(type => job.job_employment_type.toLowerCase().includes(type.toLowerCase()))
      );
    }

    // Filter by location
    if (filters.location) {
      const location = filters.location.toLowerCase();
      jobs = jobs.filter(job => 
        job.job_city.toLowerCase().includes(location) ||
        job.job_state.toLowerCase().includes(location) ||
        job.job_country.toLowerCase().includes(location)
      );
    }

    return {
      success: true,
      jobs,
      parameters: { query, ...filters },
      count: jobs.length,
      mock: true
    };
  }

  async getJobDetails(jobId) {
    try {
      // Check if it's a mock job
      if (jobId.startsWith('mock-')) {
        const job = this.mockJobs.find(j => j.job_id === jobId);
        if (job) {
          return {
            success: true,
            job,
            mock: true
          };
        }
        throw new Error('Mock job not found');
      }

      if (!this.rapidApiKey || this.rapidApiKey === '{{RAPIDAPI_KEY}}') {
        throw new Error('RapidAPI key not available');
      }

      const response = await axios.get(`https://${this.rapidApiHost}/job-details`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        },
        params: {
          job_id: jobId
        },
        timeout: 10000
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          job: response.data.data[0]
        };
      }

      throw new Error('Job not found');

    } catch (error) {
      console.error('Get job details error:', error.message);
      throw error;
    }
  }

  async getJobRecommendations(userProfile) {
    try {
      const skills = userProfile.skills || [];
      const experienceLevel = userProfile.experienceLevel || 'entry';
      const location = userProfile.location || 'US';

      // Build query based on user profile
      const query = skills.length > 0 ? skills.join(' ') : 'software developer';

      const filters = {
        location,
        num_pages: '1',
        date_posted: 'month'
      };

      // Map experience level to job requirements
      if (experienceLevel === 'entry') {
        filters.job_requirements = 'under_3_years_experience';
      } else if (experienceLevel === 'mid') {
        filters.job_requirements = '3_years_experience';
      } else if (experienceLevel === 'senior') {
        filters.job_requirements = 'more_than_3_years_experience';
      }

      const result = await this.searchJobs(query, filters);
      
      // Sort by relevance (simple scoring based on matching skills)
      if (result.success && result.jobs) {
        const scoredJobs = result.jobs.map(job => {
          let score = 0;
          const jobSkills = job.job_required_skills || [];
          
          // Score based on skill matches
          skills.forEach(userSkill => {
            if (jobSkills.some(jobSkill => 
              jobSkill.toLowerCase().includes(userSkill.toLowerCase())
            )) {
              score += 10;
            }
          });

          // Bonus for location match
          if (job.job_city && location.toLowerCase().includes(job.job_city.toLowerCase())) {
            score += 5;
          }

          return { ...job, relevance_score: score };
        });

        // Sort by score and take top recommendations
        scoredJobs.sort((a, b) => b.relevance_score - a.relevance_score);

        return {
          success: true,
          jobs: scoredJobs.slice(0, 10), // Top 10 recommendations
          userProfile: {
            skills,
            experienceLevel,
            location
          }
        };
      }

      return result;

    } catch (error) {
      console.error('Get job recommendations error:', error.message);
      throw error;
    }
  }

  async getJobCategories() {
    // Return popular job categories
    return {
      success: true,
      categories: [
        'Software Development',
        'Data Science',
        'Product Management',
        'Design',
        'Marketing',
        'Sales',
        'Human Resources',
        'Finance',
        'Operations',
        'Customer Service',
        'Engineering',
        'Healthcare'
      ]
    };
  }

  async getJobStatistics() {
    // Return mock statistics
    return {
      success: true,
      statistics: {
        totalJobs: 150000,
        newJobsToday: 1250,
        companiesHiring: 8500,
        averageSalary: 95000,
        topLocations: [
          { location: 'San Francisco, CA', count: 15000 },
          { location: 'New York, NY', count: 12000 },
          { location: 'Seattle, WA', count: 9500 },
          { location: 'Austin, TX', count: 7800 },
          { location: 'Remote', count: 25000 }
        ],
        topSkills: [
          { skill: 'JavaScript', demand: 85 },
          { skill: 'Python', demand: 78 },
          { skill: 'React', demand: 72 },
          { skill: 'Node.js', demand: 65 },
          { skill: 'AWS', demand: 68 }
        ]
      }
    };
  }
}

export default new JobService();