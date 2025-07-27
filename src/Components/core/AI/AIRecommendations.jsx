import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateAIRecommendations, 
  getUserAIRecommendations 
} from '../../../services/operations/aiAPI';
import { 
  FaLightbulb, 
  FaGraduationCap, 
  FaStar, 
  FaSpinner,
  FaSync,
  FaBookmark
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInterests, setUserInterests] = useState([]);
  const [skillLevel, setSkillLevel] = useState('beginner');
  
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const commonInterests = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'Artificial Intelligence', 'UI/UX Design', 'Digital Marketing', 'Business',
    'Photography', 'Music', 'Cooking', 'Fitness', 'Language Learning',
    'Programming', 'Cybersecurity', 'Cloud Computing', 'DevOps'
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await getUserAIRecommendations(token);
      if (data) {
        setRecommendations(data.recommendedCourses || []);
        setUserInterests(data.userInterests || []);
        setSkillLevel(data.skillLevel || 'beginner');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setIsGenerating(true);
      const data = await generateAIRecommendations(userInterests, skillLevel, token);
      if (data) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInterest = (interest) => {
    setUserInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        <span className="ml-2 text-richblack-300">Loading recommendations...</span>
      </div>
    );
  }

  return (
    <div className="bg-richblack-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <FaLightbulb className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-richblack-5 font-semibold text-xl">AI Course Recommendations</h2>
            <p className="text-richblack-300 text-sm">Personalized suggestions based on your interests</p>
          </div>
        </div>
        <button
          onClick={handleGenerateRecommendations}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaSync />
          )}
          {isGenerating ? 'Generating...' : 'Refresh'}
        </button>
      </div>

      {/* Settings Section */}
      <div className="mb-6 p-4 bg-richblack-700 rounded-lg">
        <h3 className="text-richblack-5 font-medium mb-3">Customize Your Preferences</h3>
        
        {/* Skill Level */}
        <div className="mb-4">
          <label className="block text-richblack-300 text-sm mb-2">Skill Level</label>
          <div className="flex gap-2">
            {skillLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSkillLevel(level.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  skillLevel === level.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-richblack-600 text-richblack-300 hover:bg-richblack-500'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-richblack-300 text-sm mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  userInterests.includes(interest)
                    ? 'bg-green-500 text-white'
                    : 'bg-richblack-600 text-richblack-300 hover:bg-richblack-500'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-richblack-5 font-medium mb-4">Recommended Courses</h3>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <FaGraduationCap className="text-richblack-400 text-4xl mx-auto mb-4" />
            <p className="text-richblack-300">No recommendations yet. Update your preferences and generate new recommendations.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCourseClick(rec.course._id)}
                  className="bg-richblack-700 rounded-lg p-4 cursor-pointer hover:bg-richblack-600 transition-colors border border-richblack-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-richblack-5 font-medium mb-2">
                        {rec.course.courseName}
                      </h4>
                      <p className="text-richblack-300 text-sm mb-3">
                        {rec.course.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-richblack-400">
                        <span className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          {rec.score.toFixed(1)} match
                        </span>
                        {rec.category && (
                          <span className="bg-richblack-600 px-2 py-1 rounded">
                            {rec.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaBookmark className="text-white" />
                      </div>
                    </div>
                  </div>
                  {rec.reason && (
                    <p className="text-blue-400 text-xs mt-3 italic">
                      "{rec.reason}"
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations; 