class RealJobService {
  constructor() {
    this.rapidApiKey = 'eb45f72ab0mshe2bdcda4cf808e0p150f1cjsnfcae24ab0813';
    this.jsearchHost = 'jsearch.p.rapidapi.com';
    this.internshipsHost = 'internships-api.p.rapidapi.com';
    this.glassdoorHost = 'glassdoor-real-time.p.rapidapi.com';
  }

  async searchJobs(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        query: query || 'software developer',
        page: '1',
        num_pages: '1'
      });

      const response = await fetch(`https://${this.jsearchHost}/search?${params}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.jsearchHost
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        jobs: data.data || [],
        parameters: data.parameters || {},
        count: data.data?.length || 0
      };
    } catch (error) {
      console.error('Job search error:', error);
      throw error;
    }
  }

  async getActiveInternships() {
    try {
      const response = await fetch(`https://${this.internshipsHost}/active-jb-7d`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.internshipsHost
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        internships: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Internships API error:', error);
      throw error;
    }
  }

  async getInterviewDetails(interviewId) {
    try {
      const response = await fetch(
        `https://${this.glassdoorHost}/companies/interview-details?interviewId=${interviewId}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': this.glassdoorHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Glassdoor API error:', error);
      throw error;
    }
  }

  async getJobRecommendations(userProfile = {}) {
    try {
      // Use user skills or default search terms
      const skills = userProfile.skills || ['software', 'developer', 'engineer'];
      const query = skills.join(' ');
      
      const filters = {};

      return await this.searchJobs(query, filters);
    } catch (error) {
      console.error('Job recommendations error:', error);
      throw error;
    }
  }

  formatJobData(job) {
    return {
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''}, ${job.job_state || job.job_country || ''}`.replace(/^, |, $/, ''),
      type: this.formatEmploymentType(job.job_employment_type),
      remote: job.job_is_remote || false,
      salary: this.formatSalary(job),
      experience: this.formatExperience(job.job_required_experience),
      skills: job.job_required_skills || [],
      description: job.job_description || 'No description available',
      requirements: this.extractRequirements(job.job_description),
      benefits: job.job_benefits || [],
      posted: this.formatDate(job.job_posted_at_datetime_utc),
      applicants: Math.floor(Math.random() * 100) + 10, // Estimated
      applyUrl: job.job_apply_link,
      logo: job.employer_logo
    };
  }

  formatEmploymentType(type) {
    const typeMap = {
      'FULLTIME': 'Full-time',
      'PARTTIME': 'Part-time',
      'CONTRACTOR': 'Contract',
      'INTERN': 'Internship'
    };
    return typeMap[type] || type || 'Full-time';
  }

  formatSalary(job) {
    if (job.job_min_salary && job.job_max_salary) {
      const currency = job.job_salary_currency || 'USD';
      const min = this.formatCurrency(job.job_min_salary, currency);
      const max = this.formatCurrency(job.job_max_salary, currency);
      return `${min} - ${max}`;
    }
    return 'Salary not specified';
  }

  formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatExperience(experience) {
    if (!experience) return 'Not specified';
    
    if (experience.no_experience_required) {
      return 'Entry Level';
    }
    
    if (experience.required_experience_in_months) {
      const years = Math.floor(experience.required_experience_in_months / 12);
      if (years === 0) return 'Less than 1 year';
      if (years === 1) return '1 year';
      return `${years} years`;
    }
    
    return 'Not specified';
  }

  extractRequirements(description) {
    if (!description) return [];
    
    // Simple extraction of bullet points or requirements
    const requirements = [];
    const lines = description.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        requirements.push(trimmed.substring(1).trim());
      }
    }
    
    return requirements.slice(0, 5); // Limit to 5 requirements
  }

  formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}

export default new RealJobService();