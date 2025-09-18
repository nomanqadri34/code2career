import React from 'react';
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Bookmark, 
  Star 
} from 'lucide-react';

const JobCard = ({ job, onSave, onApply }) => {
  const {
    id,
    title = job.job_title,
    company = job.employer_name,
    location = job.job_city || job.job_country,
    salary = job.job_salary,
    description = job.job_description,
    posted_date = job.job_posted_at,
    apply_link = job.job_apply_link,
    job_type = job.job_employment_type,
    ai_score = job.relevance_score
  } = job;

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    if (typeof salary === 'string') return salary;
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    return 'Competitive salary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently posted';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Recently posted';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-title-section">
          <h3 className="job-title">{title}</h3>
          {ai_score && (
            <div className="ai-score">
              <Star size={14} />
              <span>{Math.round(ai_score)}% match</span>
            </div>
          )}
        </div>
        
        <div className="company-info">
          <Building size={14} />
          <span>{company}</span>
        </div>
      </div>

      <div className="job-details">
        {location && (
          <div className="job-detail">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        )}
        
        <div className="job-detail">
          <DollarSign size={14} />
          <span>{formatSalary(salary)}</span>
        </div>
        
        {job_type && (
          <div className="job-detail">
            <Clock size={14} />
            <span>{job_type}</span>
          </div>
        )}
      </div>

      {description && (
        <div className="job-description">
          {truncateText(description)}
        </div>
      )}

      <div className="job-actions">
        <button 
          className="save-job-btn"
          onClick={() => onSave?.(job)}
          title="Save job"
        >
          <Bookmark size={14} />
          Save
        </button>
        
        <button 
          className="apply-job-btn"
          onClick={() => onApply?.(job)}
        >
          Apply Now
        </button>
        
        {apply_link && (
          <a 
            href={apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
            title="View on company website"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="job-posted">
        Posted: {formatDate(posted_date)}
      </div>
    </div>
  );
};

export default JobCard;