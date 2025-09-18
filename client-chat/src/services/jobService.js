import axios from 'axios';

class JobService {
  constructor() {
    this.rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    this.rapidApiHost = 'jsearch.p.rapidapi.com';
    this.baseUrl = 'https://jsearch.p.rapidapi.com';
    
    if (!this.rapidApiKey) {
      console.error('VITE_RAPIDAPI_KEY not found in environment variables');
    }
  }

  async searchJobs(query, filters = {}) {
    try {
      if (!this.rapidApiKey) {
        throw new Error('RapidAPI key not configured');
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
      throw error;
    }
  }

  async getJobDetails(jobId) {
    try {
      if (!this.rapidApiKey) {
        throw new Error('RapidAPI key not configured');
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

      const query = skills.length > 0 ? skills.join(' ') : 'software developer';

      const filters = {
        location,
        num_pages: '1',
        date_posted: 'month'
      };

      if (experienceLevel === 'entry') {
        filters.job_requirements = 'under_3_years_experience';
      } else if (experienceLevel === 'mid') {
        filters.job_requirements = '3_years_experience';
      } else if (experienceLevel === 'senior') {
        filters.job_requirements = 'more_than_3_years_experience';
      }

      const result = await this.searchJobs(query, filters);
      
      if (result.success && result.jobs) {
        const scoredJobs = result.jobs.map(job => {
          let score = 0;
          const jobSkills = job.job_required_skills || [];
          
          skills.forEach(userSkill => {
            if (jobSkills.some(jobSkill => 
              jobSkill.toLowerCase().includes(userSkill.toLowerCase())
            )) {
              score += 10;
            }
          });

          return { ...job, relevanceScore: score };
        });

        scoredJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return {
          success: true,
          jobs: scoredJobs.slice(0, 10),
          count: scoredJobs.length
        };
      }

      return result;

    } catch (error) {
      console.error('Get job recommendations error:', error.message);
      throw error;
    }
  }

  async getJobsByLocation(location, query = 'software developer') {
    try {
      const filters = {
        location,
        num_pages: '1',
        date_posted: 'week'
      };

      return await this.searchJobs(query, filters);

    } catch (error) {
      console.error('Get jobs by location error:', error.message);
      throw error;
    }
  }

  async getTrendingJobs() {
    try {
      const trendingQueries = [
        'software engineer',
        'data scientist',
        'product manager',
        'frontend developer',
        'backend developer'
      ];

      const allJobs = [];

      for (const query of trendingQueries) {
        try {
          const result = await this.searchJobs(query, { 
            num_pages: '1',
            date_posted: 'week'
          });
          
          if (result.success && result.jobs) {
            allJobs.push(...result.jobs.slice(0, 2));
          }
        } catch (error) {
          console.warn(`Failed to fetch jobs for ${query}:`, error.message);
        }
      }

      const uniqueJobs = allJobs.filter((job, index, self) =>
        index === self.findIndex(j => j.job_id === job.job_id)
      );

      return {
        success: true,
        jobs: uniqueJobs.slice(0, 10),
        count: uniqueJobs.length
      };

    } catch (error) {
      console.error('Get trending jobs error:', error.message);
      throw error;
    }
  }
}

export default new JobService();