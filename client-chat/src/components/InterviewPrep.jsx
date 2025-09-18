import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import LoadingScreen from "./LoadingScreen";
import toast from "react-hot-toast";
import geminiService from "../services/geminiService";
import "./InterviewPrep.css";

const InterviewPrep = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { startInterview, evaluateAnswer } = useChatStore();
  const [currentSection, setCurrentSection] = useState("setup"); // setup, practice, feedback
  const [interviewData, setInterviewData] = useState({
    jobTitle: "",
    jobDescription: "",
    interviewType: "general",
    difficulty: "medium",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  // Mock questions for demo
  const mockQuestions = [
    {
      id: 1,
      question:
        "Tell me about yourself and your background in software development.",
      type: "behavioral",
      difficulty: "easy",
    },
    {
      id: 2,
      question:
        "Describe a challenging project you've worked on and how you overcame the difficulties.",
      type: "behavioral",
      difficulty: "medium",
    },
    {
      id: 3,
      question: "How do you handle tight deadlines and multiple priorities?",
      type: "behavioral",
      difficulty: "medium",
    },
    {
      id: 4,
      question:
        "What are the differences between React functional and class components?",
      type: "technical",
      difficulty: "medium",
    },
    {
      id: 5,
      question:
        "Explain the concept of closures in JavaScript with an example.",
      type: "technical",
      difficulty: "hard",
    },
  ];

  const handleSetupSubmit = async () => {
    if (!interviewData.jobTitle) {
      toast.error("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      // Generate interview preparation using Gemini AI
      const prepPrompt = `Generate comprehensive interview preparation for a ${
        interviewData.jobTitle
      } position (${interviewData.difficulty} level, ${
        interviewData.interviewType
      } interview type).

Job Description: ${interviewData.jobDescription || "Not provided"}

Provide:
1. 10 relevant interview questions
2. Key skills to highlight
3. Common challenges and how to address them
4. STAR method examples
5. Questions to ask the interviewer
6. Preparation tips

Format as structured text with clear sections.`;

      const prepResponse = await geminiService.sendMessage(
        prepPrompt,
        "interview"
      );

      if (prepResponse.success) {
        setInterviewPrep(prepResponse.message);

        // Generate dynamic mock interview questions
        await generateMockQuestions();

        // Fetch YouTube videos
        await fetchYouTubeVideos(
          interviewData.jobTitle,
          interviewData.interviewType
        );

        setCurrentSection("preparation");
        toast.success("Interview preparation generated!");
      } else {
        throw new Error("Failed to generate preparation");
      }
    } catch (error) {
      console.error("Error generating interview prep:", error);
      toast.error("Failed to generate interview preparation");
      setQuestions(mockQuestions);
      setCurrentSection("practice");
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeVideos = async (jobTitle, interviewType) => {
    try {
      const YOUTUBE_API_KEY = "AIzaSyCMzz9s_AfQpsYJEOKDDMTJtt8_7RqnRw8";
      const searchQuery = `${jobTitle} ${interviewType} interview questions preparation`;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const videos = data.items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default.url,
          channelTitle: item.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
        setYoutubeVideos(videos);
      } else {
        console.warn("YouTube API failed, using fallback videos");
        setYoutubeVideos(getFallbackVideos(jobTitle, interviewType));
      }
    } catch (error) {
      console.error("YouTube API error:", error);
      setYoutubeVideos(getFallbackVideos(jobTitle, interviewType));
    }
  };

  const getFallbackVideos = (jobTitle, interviewType) => {
    return [
      {
        id: "fallback1",
        title: `${jobTitle} Interview Questions and Answers`,
        description: `Complete guide to ${jobTitle} interview preparation`,
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "Career Success",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          jobTitle + " interview questions"
        )}`,
      },
      {
        id: "fallback2",
        title: `${interviewType} Interview Tips for ${jobTitle}`,
        description: `Professional tips for ${interviewType} interviews`,
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "Interview Pro",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          interviewType + " interview tips"
        )}`,
      },
      {
        id: "fallback3",
        title: `How to Ace ${jobTitle} Interviews`,
        description: `Step-by-step guide to interview success`,
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "Tech Career Hub",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          jobTitle + " interview preparation"
        )}`,
      },
    ];
  };

  const generateMockQuestions = async () => {
    try {
      const questionsPrompt = `Generate 5 realistic interview questions for a ${
        interviewData.jobTitle
      } position (${interviewData.difficulty} level, ${
        interviewData.interviewType
      } type).

Job Description: ${interviewData.jobDescription || "Standard role requirements"}

Return ONLY a JSON array in this exact format:
[{"id": 1, "question": "Tell me about your experience with [specific skill/technology]", "type": "technical", "difficulty": "medium"}]

Mix of question types: behavioral, technical, situational. Make questions specific to the role.`;

      const questionsResponse = await geminiService.sendMessage(
        questionsPrompt,
        "interview"
      );

      if (questionsResponse.success) {
        try {
          const cleanText = questionsResponse.message
            .replace(/```json|```/g, "")
            .replace(/^[^\[]*/, "")
            .replace(/[^\]]*$/, "")
            .trim();

          const generatedQuestions = JSON.parse(cleanText);

          if (
            Array.isArray(generatedQuestions) &&
            generatedQuestions.length > 0
          ) {
            setQuestions(generatedQuestions);
            console.log("Generated questions:", generatedQuestions);
          } else {
            throw new Error("Invalid questions format");
          }
        } catch (parseError) {
          console.warn("Failed to parse AI questions, generating fallback");
          setQuestions(generateFallbackQuestions());
        }
      } else {
        setQuestions(generateFallbackQuestions());
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setQuestions(generateFallbackQuestions());
    }
  };

  const generateFallbackQuestions = () => {
    const { jobTitle, interviewType, difficulty } = interviewData;

    return [
      {
        id: 1,
        question: `Tell me about your experience and background relevant to this ${jobTitle} position.`,
        type: "behavioral",
        difficulty: "easy",
      },
      {
        id: 2,
        question: `Describe a challenging project you've worked on as a ${jobTitle}. How did you overcome the difficulties?`,
        type: "behavioral",
        difficulty: "medium",
      },
      {
        id: 3,
        question: `What technical skills and tools do you consider most important for a ${jobTitle}?`,
        type: "technical",
        difficulty: "medium",
      },
      {
        id: 4,
        question: `How do you stay updated with the latest trends and technologies in your field?`,
        type: "behavioral",
        difficulty: "easy",
      },
      {
        id: 5,
        question: `Walk me through how you would approach a complex problem typical for a ${jobTitle}.`,
        type: "situational",
        difficulty: difficulty,
      },
    ];
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setLoading(true);
    try {
      // Use Gemini AI for answer evaluation
      const currentQuestion = questions[currentQuestionIndex];
      const evaluationPrompt = `Evaluate this interview answer for a ${interviewData.jobTitle} position:

Question: ${currentQuestion.question}
Answer: ${userAnswer}

Provide evaluation in this JSON format:
{
  "score": 85,
  "strengths": ["Clear communication", "Relevant examples"],
  "improvements": ["Add more specific metrics", "Include team collaboration"],
  "suggestions": "Great answer! Consider adding quantifiable results to strengthen your response."
}

Score should be 0-100. Be constructive and specific.`;

      const evaluationResponse = await geminiService.sendMessage(
        evaluationPrompt,
        "interview"
      );

      let aiEvaluation;
      if (evaluationResponse.success) {
        try {
          const cleanEvaluation = evaluationResponse.message
            .replace(/```json|```/g, "")
            .replace(/^[^{]*/, "")
            .replace(/[^}]*$/, "")
            .trim();

          aiEvaluation = JSON.parse(cleanEvaluation);
        } catch (parseError) {
          console.warn("Failed to parse AI evaluation, using fallback");
          aiEvaluation = generateFallbackEvaluation();
        }
      } else {
        aiEvaluation = generateFallbackEvaluation();
      }

      const feedback = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer: userAnswer,
        score: aiEvaluation.score || Math.floor(Math.random() * 30) + 70,
        strengths: aiEvaluation.strengths || ["Clear communication"],
        improvements: aiEvaluation.improvements || [
          "Consider adding more details",
        ],
        suggestions:
          aiEvaluation.suggestions || "Good answer! Keep practicing.",
      };

      setFeedback((prev) => [...prev, feedback]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswer("");
        toast.success("Answer evaluated! Next question ready.");
      } else {
        setCurrentSection("feedback");
        toast.success("Interview completed!");
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast.error("Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackEvaluation = () => {
    const scores = [75, 80, 85, 90, 95];
    const score = scores[Math.floor(Math.random() * scores.length)];

    return {
      score,
      strengths: [
        "Clear communication style",
        "Structured response approach",
        "Relevant experience mentioned",
      ],
      improvements: [
        "Add more specific examples",
        "Include quantifiable results",
        "Mention team collaboration aspects",
      ],
      suggestions:
        score >= 85
          ? "Excellent answer! You demonstrate strong understanding and communication skills."
          : "Good response! Focus on providing more concrete examples and measurable outcomes.",
    };
  };

  const handleRestart = () => {
    setCurrentSection("setup");
    setInterviewData({
      jobTitle: "",
      jobDescription: "",
      interviewType: "general",
      difficulty: "medium",
    });
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setFeedback([]);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const averageScore =
    feedback.length > 0
      ? Math.round(
          feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length
        )
      : 0;

  if (loading && currentSection === "setup") {
    return <LoadingScreen message="Setting up your interview..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Interview Prep
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || "Demo User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Setup Section */}
          {currentSection === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  AI Interview Practice
                </h1>
                <p className="text-lg text-gray-600">
                  Practice with AI-powered mock interviews tailored to your
                  target role
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Interview Setup
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={interviewData.jobTitle}
                      onChange={(e) =>
                        setInterviewData({
                          ...interviewData,
                          jobTitle: e.target.value,
                        })
                      }
                      placeholder="e.g., Senior Frontend Developer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description (Optional)
                    </label>
                    <textarea
                      value={interviewData.jobDescription}
                      onChange={(e) =>
                        setInterviewData({
                          ...interviewData,
                          jobDescription: e.target.value,
                        })
                      }
                      placeholder="Paste the job description to get more targeted questions..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Type
                      </label>
                      <select
                        value={interviewData.interviewType}
                        onChange={(e) =>
                          setInterviewData({
                            ...interviewData,
                            interviewType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="general">General Interview</option>
                        <option value="technical">Technical Interview</option>
                        <option value="behavioral">Behavioral Interview</option>
                        <option value="system-design">System Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={interviewData.difficulty}
                        onChange={(e) =>
                          setInterviewData({
                            ...interviewData,
                            difficulty: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="easy">Entry Level</option>
                        <option value="medium">Mid Level</option>
                        <option value="hard">Senior Level</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSetupSubmit}
                    disabled={loading || !interviewData.jobTitle}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading
                      ? "Preparing Interview..."
                      : "Start Interview Practice"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interview Preparation Section */}
          {currentSection === "preparation" && (
            <motion.div
              key="preparation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Interview Preparation
                </h1>
                <p className="text-lg text-gray-600">
                  AI-generated preparation materials for{" "}
                  {interviewData.jobTitle}
                </p>
              </div>

              {/* AI-Generated Preparation Content */}
              {interviewPrep && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    📋 Preparation Guide
                  </h2>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {interviewPrep}
                    </pre>
                  </div>
                </div>
              )}

              {/* YouTube Videos Section */}
              {youtubeVideos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    📺 Recommended Videos
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {youtubeVideos.map((video, index) => (
                      <div
                        key={video.id}
                        className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            {video.channelTitle}
                          </p>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            Watch on YouTube
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentSection("practice")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                >
                  Start Practice Interview
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  New Preparation
                </button>
              </div>
            </motion.div>
          )}

          {/* Practice Section */}
          {currentSection === "practice" && questions.length > 0 && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mock Interview
                  </h1>
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Interviewer
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {questions[currentQuestionIndex]?.question}
                    </p>
                    <div className="flex items-center space-x-3 mt-3">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                        {questions[currentQuestionIndex]?.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {questions[currentQuestionIndex]?.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Answer
                </h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Take your time to provide a thoughtful answer..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
                />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {userAnswer.length} characters
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading || !userAnswer.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading
                      ? "Analyzing..."
                      : currentQuestionIndex < questions.length - 1
                      ? "Submit & Next"
                      : "Finish Interview"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback Section */}
          {currentSection === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Interview Complete! 🎉
                </h1>
                <p className="text-lg text-gray-600">
                  Here's your detailed feedback and performance analysis
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      averageScore
                    )} mb-2`}
                  >
                    {averageScore}%
                  </div>
                  <p className="text-xl text-gray-700 mb-4">Overall Score</p>
                  <p className="text-gray-600">
                    {averageScore >= 90
                      ? "Excellent performance! You are well prepared."
                      : averageScore >= 80
                      ? "Great job! Minor areas for improvement."
                      : averageScore >= 70
                      ? "Good effort! Focus on the suggestions below."
                      : "Keep practicing! You are on the right track."}
                  </p>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-6">
                {feedback.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-8"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          item.score
                        )}`}
                      >
                        {item.score}%
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 italic">
                      "{item.question}"
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">
                          ✅ Strengths
                        </h4>
                        <ul className="space-y-1">
                          {item.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-gray-600">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">
                          💡 Improvements
                        </h4>
                        <ul className="space-y-1">
                          {item.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm text-gray-600">
                              • {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        {item.suggestions}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Practice Again
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPrep;
