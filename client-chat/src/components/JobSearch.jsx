import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import realJobService from '../services/realJobService';
import LoadingScreen from './LoadingScreen';
import toast from 'react-hot-toast';

const JobSearch = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salaryRange: '',
    remote: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState('recommendations'); // 'recommendations' or 'search'

  useEffect(() => {
    fetchJobRecommendations();
  }, []);

  const fetchJobRecommendations = async () => {
    setLoading(true);
    try {
      const userProfile = {
        skills: ['software', 'developer', 'engineer', 'javascript', 'react'],
        experienceLevel: 'mid',
        location: 'US'
      };
      
      const result = await realJobService.getJobRecommendations(userProfile);
      
      if (result.success && result.jobs) {
        const formattedJobs = result.jobs.map(job => realJobService.formatJobData(job));
        setJobs(formattedJobs);
        setSearchMode('jobs');
        toast.success(`Found ${formattedJobs.length} jobs`);
      } else {
        throw new Error('No jobs found');
      }
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      toast.error('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const result = await realJobService.getActiveInternships();
      
      if (result.success && result.internships) {
        const formattedInternships = result.internships.map(internship => ({
          id: internship.id || Math.random().toString(),
          title: internship.title || 'Internship Position',
          company: internship.company || 'Company',
          location: internship.location || 'Location not specified',
          type: 'Internship',
          remote: internship.remote || false,
          salary: internship.salary || 'Stipend varies',
          experience: 'Entry Level',
          skills: internship.skills || [],
          description: internship.description || 'Internship opportunity',
          requirements: internship.requirements || [],
          benefits: internship.benefits || [],
          posted: internship.posted || 'Recently',
          applyUrl: internship.apply_url || internship.url
        }));
        
        setJobs(formattedInternships);
        setSearchMode('internships');
        toast.success(`Found ${formattedInternships.length} internships`);
      } else {
        throw new Error('No internships found');
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const searchFilters = {
        location: filters.location,
        employment_types: filters.jobType ? filters.jobType.toUpperCase() : undefined,
        date_posted: 'month'
      };
      
      const result = await realJobService.searchJobs(searchQuery, searchFilters);
      
      if (result.success && result.jobs) {
        let formattedJobs = result.jobs.map(job => realJobService.formatJobData(job));
        
        // Apply additional filters
        if (filters.remote) {
          formattedJobs = formattedJobs.filter(job => job.remote);
        }
        
        setJobs(formattedJobs);
        setSearchMode('search');
        toast.success(`Found ${formattedJobs.length} jobs matching "${searchQuery}"`);
      } else {
        setJobs([]);
        toast.info('No jobs found for your search criteria');
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search jobs. Please try again.');
      setJobs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredJobs = [...jobs];

    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.jobType);
    }

    if (filters.remote) {
      filteredJobs = filteredJobs.filter(job => job.remote);
    }

    setJobs(filteredJobs);
    setShowFilters(false);
    toast.success(`Applied filters - ${filteredJobs.length} jobs found`);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      experience: '',
      salaryRange: '',
      remote: false
    });
    fetchJobRecommendations();
  };

  const handleApply = (job) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
      toast.success(`Opening application for ${job.title} at ${job.company}`);
    } else {
      toast.info('Application link not available for this job');
    }
  };

  const handleSave = (job) => {
    toast.success(`Saved ${job.title} to your favorites!`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return <LoadingScreen message="Finding perfect jobs for you..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-2 sm:mr-4 p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">Job Search</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs sm:text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {user?.name || 'Demo User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                {searchLoading ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span className="hidden xs:inline">Filters</span>
              </button>
              
              <button
                onClick={fetchJobRecommendations}
                className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Jobs
              </button>
              
              <button
                onClick={fetchInternships}
                className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
              >
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Internships
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      placeholder="City or State"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => setFilters({...filters, experience: e.target.value})}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any Level</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.remote}
                        onChange={(e) => setFilters({...filters, remote: e.target.checked})}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Remote Only</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={applyFilters}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            <span className="block sm:inline">
              {searchMode === 'jobs' ? 'Job Opportunities' : 
               searchMode === 'internships' ? 'Internship Opportunities' : 
               'Search Results'}
            </span>
            <span className="text-gray-500 font-normal text-sm sm:text-base ml-0 sm:ml-2 block sm:inline">
              ({jobs.length} {searchMode === 'internships' ? 'internships' : 'jobs'})
            </span>
          </h2>
        </div>

        {/* Job Cards */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium self-start">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-sm sm:text-lg text-gray-700 mb-1 sm:mb-2">{job.company}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-4">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      {job.remote && (
                        <span className="text-green-600 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                    <button
                      onClick={() => handleSave(job)}
                      className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Save job"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleApply(job)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                  {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                </p>

                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {job.skills.slice(0, 6).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 6 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium">
                      +{job.skills.length - 6} more
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                    <span className="font-medium text-gray-900">{job.salary}</span>
                    <span>{job.experience}</span>
                    {job.applicants && <span className="hidden sm:inline">{job.applicants} applicants</span>}
                  </div>
                  <span>Posted {job.posted}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {jobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;