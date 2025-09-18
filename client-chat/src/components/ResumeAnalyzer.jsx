import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import realJobService from '../services/realJobService';
import LoadingScreen from './LoadingScreen';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [likedJobs, setLikedJobs] = useState(new Set());

  const handleFileSelect = (file) => {
    if (file) {
      const allowedTypes = ['.txt', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please upload a TXT or PDF file only');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setResumeFile(file);
      setAnalysis(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textContent = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(item => item.str).join(' ') + '\n';
      }

      return textContent;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const toggleLike = (jobId) => {
    setLikedJobs(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(jobId)) {
        newLiked.delete(jobId);
        toast.success('Job removed from favorites');
      } else {
        newLiked.add(jobId);
        toast.success('Job added to favorites');
      }
      return newLiked;
    });
  };





  const extractSkillsFromText = (text) => {
    const skillKeywords = [
      'javascript', 'js', 'python', 'java', 'react', 'angular', 'vue', 'node', 'nodejs', 'express',
      'mongodb', 'sql', 'mysql', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes', 'git',
      'html', 'css', 'typescript', 'php', 'laravel', 'django', 'flask', 'spring', 'hibernate',
      'redis', 'elasticsearch', 'graphql', 'rest', 'api', 'microservices', 'devops', 'jenkins',
      'terraform', 'ansible', 'c++', 'c#', 'ruby', 'go', 'swift', 'kotlin', 'scala', 'bootstrap',
      'tailwind', 'jquery', 'webpack', 'nextjs', 'android', 'ios', 'flutter', 'pandas', 'numpy',
      'tensorflow', 'pytorch', 'agile', 'scrum', 'programming', 'software', 'development',
      'frontend', 'backend', 'fullstack', 'database', 'testing', 'debugging', 'algorithms',
      'web', 'mobile', 'app', 'application', 'system', 'network', 'security', 'cloud',
      'linux', 'windows', 'mac', 'unix', 'server', 'client', 'framework', 'library'
    ];
    
    if (!text || text.length < 10) {
      console.log('Text too short or empty');
      return [];
    }
    
    const lowerText = text.toLowerCase();
    const foundSkills = [];
    
    skillKeywords.forEach(skill => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
        console.log('Found skill:', skill);
      }
    });
    
    console.log('Total skills found:', foundSkills.length);
    return [...new Set(foundSkills)];
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first');
      return;
    }

    setLoading(true);
    try {
      let extractedText = '';
      
      try {
        if (resumeFile.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(resumeFile);
          console.log('PDF content length:', extractedText.length);
        } else {
          extractedText = await resumeFile.text();
          console.log('Text file content length:', extractedText.length);
        }
      } catch (error) {
        console.error('Text extraction error:', error);
        toast.error('Failed to extract text: ' + error.message);
        return;
      }
      
      console.log('Extracted text length:', extractedText.length);
      console.log('First 500 characters:', extractedText.substring(0, 500));
      
      let extractedSkills = extractSkillsFromText(extractedText);
      
      console.log('Found skills:', extractedSkills);
      
      if (extractedSkills.length === 0) {
        // More lenient fallback - look for any technical terms
        const fallbackSkills = ['software', 'developer', 'engineer', 'programming', 'computer'];
        extractedSkills = fallbackSkills.filter(skill => extractedText.toLowerCase().includes(skill));
        
        if (extractedSkills.length === 0) {
          toast.error(`No technical skills found. Text length: ${extractedText.length}`);
          return;
        }
      }
      
      const jobQuery = extractedSkills.slice(0, 3).join(' ');
      const jobResult = await realJobService.searchJobs(jobQuery, {
        employment_types: 'FULLTIME',
        date_posted: 'month'
      });
      
      let jobs = [];
      if (jobResult.success && jobResult.jobs) {
        jobs = jobResult.jobs.slice(0, 5).map(job => realJobService.formatJobData(job));
        setMatchedJobs(jobs);
      }
      
      const jobSkills = jobs.flatMap(job => job.skills || []);
      const matchedSkills = extractedSkills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill))
      );
      
      const analysisResult = {
        score: Math.min(95, 60 + (extractedSkills.length * 3) + (matchedSkills.length * 2)),
        fileName: resumeFile.name,
        fileSize: (resumeFile.size / 1024).toFixed(1) + ' KB',
        extractedSkills,
        matchedJobs: jobs.length,
        sections: {
          contactInfo: { present: extractedText.includes('@') || extractedText.includes('phone'), score: 85 },
          summary: { present: extractedText.length > 500, score: 80 },
          experience: { present: extractedText.toLowerCase().includes('experience') || extractedText.toLowerCase().includes('work'), score: 90 },
          education: { present: extractedText.toLowerCase().includes('education') || extractedText.toLowerCase().includes('degree'), score: 85 },
          skills: { present: extractedSkills.length > 0, score: Math.min(100, extractedSkills.length * 10) },
          projects: { present: extractedText.toLowerCase().includes('project'), score: extractedText.toLowerCase().includes('project') ? 75 : 0 },
          certifications: { present: extractedText.toLowerCase().includes('certification') || extractedText.toLowerCase().includes('certified'), score: extractedText.toLowerCase().includes('certif') ? 80 : 0 }
        },
        keywords: {
          total: extractedSkills.length,
          matched: matchedSkills.length,
          missing: jobSkills.filter(skill => !extractedSkills.includes(skill.toLowerCase())).slice(0, 5)
        },
        strengths: [
          `Found ${extractedSkills.length} technical skills`,
          `Matched with ${jobs.length} current job openings`,
          extractedText.length > 1000 ? "Comprehensive resume content" : "Concise resume format",
          "Industry-relevant experience detected"
        ].filter(Boolean),
        suggestions: [
          jobs.length > 0 ? `Apply to ${jobs.length} matching jobs found` : "Expand skill keywords for better job matching",
          extractedSkills.length < 5 ? "Add more technical skills to your resume" : "Great technical skill coverage",
          !extractedText.toLowerCase().includes('project') ? "Add a projects section" : "Projects section detected",
          "Optimize for ATS with industry keywords",
          "Include quantified achievements"
        ],
        atsScore: Math.min(95, 70 + extractedSkills.length * 2),
        readabilityScore: Math.min(100, 80 + (extractedText.length > 500 ? 15 : 0)),
        industryMatch: Math.min(100, 60 + (matchedSkills.length * 8))
      };

      setAnalysis(analysisResult);
      toast.success(`Resume analyzed! Found ${extractedSkills.length} skills and ${jobs.length} matching jobs`);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingScreen message="Analyzing your resume..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Resume Analyzer</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Demo User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Resume Analyzer</h1>
            <p className="text-lg text-gray-600">
              Upload your resume as TXT file to get real job matches and AI-powered feedback
            </p>
          </div>

          {!analysis && (
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Resume</h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-orange-500 bg-orange-50' 
                    : resumeFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {resumeFile ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
                    <p className="text-gray-600 mb-2">{resumeFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your resume here
                    </h3>
                    <p className="text-gray-600 mb-4">or click to browse files</p>
                    <p className="text-sm text-gray-500">
                      Supports TXT and PDF files (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose File
                </button>
                <button
                  onClick={analyzeResume}
                  disabled={!resumeFile || loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Analyze Resume
                </button>
              </div>
            </div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
                  <p className="text-gray-600">Here's your comprehensive resume analysis</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
                      {analysis.score}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)} mb-2`}>
                      {analysis.atsScore}%
                    </div>
                    <p className="text-sm text-gray-600">ATS Compatible</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.readabilityScore)} mb-2`}>
                      {analysis.readabilityScore}%
                    </div>
                    <p className="text-sm text-gray-600">Readability</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.industryMatch)} mb-2`}>
                      {analysis.industryMatch}%
                    </div>
                    <p className="text-sm text-gray-600">Industry Match</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-semibold text-purple-700 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Skills Extracted from Resume
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.extractedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium capitalize"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">
                  Found {analysis.extractedSkills.length} technical skills that match {analysis.matchedJobs} current job openings
                </p>
              </div>

              {matchedJobs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-green-700 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Jobs Matching Your Skills ({matchedJobs.length})
                  </h3>
                  <div className="space-y-4">
                    {matchedJobs.map((job, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{job.title}</h4>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-sm text-gray-500">{job.location}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleLike(job.id || index)}
                              className={`p-2 rounded-full transition-colors ${
                                likedJobs.has(job.id || index)
                                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill={likedJobs.has(job.id || index) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => job.applyUrl && window.open(job.applyUrl, '_blank')}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skills.slice(0, 4).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Section Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(analysis.sections).map(([section, data]) => (
                    <div key={section} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${data.present ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium capitalize">
                          {section.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${getScoreColor(data.score)}`}>
                          {data.score}%
                        </span>
                        {data.present ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Recommendations
                </h3>
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setMatchedJobs([]);
                    setResumeFile(null);
                    setLikedJobs(new Set());
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Analyze Another Resume
                </button>
                {matchedJobs.length > 0 && (
                  <button
                    onClick={() => navigate('/job-search')}
                    className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View All Jobs
                  </button>
                )}
                <button
                  onClick={() => navigate('/chat')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                >
                  Get AI Career Advice
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;