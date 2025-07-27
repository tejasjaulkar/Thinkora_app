import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getLearningAnalytics } from '../../../services/operations/aiAPI';
import { 
  FaChartLine, 
  FaGraduationCap, 
  FaPlay, 
  FaCheckCircle, 
  FaSpinner,
  FaTrophy,
  FaClock,
  FaBullseye
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AILearningAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getLearningAnalytics(token);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        <span className="ml-2 text-richblack-300">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <FaChartLine className="text-richblack-400 text-4xl mx-auto mb-4" />
        <p className="text-richblack-300">No analytics data available yet.</p>
      </div>
    );
  }

  const { learningPatterns, categoryStats, courseProgress } = analytics;

  // Chart data for learning progress
  const progressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Course Completion',
        data: [20, 35, 50, 75],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for category distribution
  const categoryData = {
    labels: Object.keys(categoryStats),
    datasets: [
      {
        data: Object.values(categoryStats),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
        borderWidth: 2,
        borderColor: '#1F2937',
      },
    ],
  };

  return (
    <div className="bg-richblack-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <FaChartLine className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-richblack-5 font-semibold text-xl">AI Learning Analytics</h2>
            <p className="text-richblack-300 text-sm">Insights into your learning journey</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-richblack-700 text-richblack-5 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <FaGraduationCap className="text-white" />
            </div>
            <div>
              <p className="text-richblack-300 text-sm">Total Courses</p>
              <p className="text-richblack-5 font-semibold text-xl">{learningPatterns.totalCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-white" />
            </div>
            <div>
              <p className="text-richblack-300 text-sm">Completed</p>
              <p className="text-richblack-5 font-semibold text-xl">{learningPatterns.completedCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <FaPlay className="text-white" />
            </div>
            <div>
              <p className="text-richblack-300 text-sm">Videos Watched</p>
              <p className="text-richblack-5 font-semibold text-xl">{learningPatterns.totalVideos}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <FaTrophy className="text-white" />
            </div>
            <div>
              <p className="text-richblack-300 text-sm">Completion Rate</p>
              <p className={`font-semibold text-xl ${getProgressColor(learningPatterns.completionRate)}`}>
                {learningPatterns.completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Learning Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <h3 className="text-richblack-5 font-medium mb-4">Learning Progress</h3>
          <div className="h-64">
            <Line 
              data={progressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#E5E7EB',
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#9CA3AF',
                    },
                    grid: {
                      color: '#374151',
                    },
                  },
                  y: {
                    ticks: {
                      color: '#9CA3AF',
                    },
                    grid: {
                      color: '#374151',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-richblack-700 rounded-lg p-4"
        >
          <h3 className="text-richblack-5 font-medium mb-4">Category Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#E5E7EB',
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-richblack-700 rounded-lg p-4"
      >
        <h3 className="text-richblack-5 font-medium mb-4">Recent Learning Activity</h3>
        <div className="space-y-3">
          {courseProgress.slice(0, 5).map((progress, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-richblack-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xs" />
                </div>
                <div>
                  <p className="text-richblack-5 font-medium">{progress.courseId.courseName}</p>
                  <p className="text-richblack-300 text-sm">{progress.courseId.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-richblack-5 font-medium">
                  {progress.completedVideos.length} videos
                </p>
                <div className="flex items-center gap-2 text-xs text-richblack-400">
                  <FaClock />
                  <span>Last active: {new Date(progress.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaBullseye className="text-blue-400 text-lg" />
          <h3 className="text-richblack-5 font-medium">AI Learning Insights</h3>
        </div>
        <div className="space-y-2 text-sm text-richblack-300">
          <p>• You're making great progress in {Object.keys(categoryStats)[0]} courses</p>
          <p>• Try to maintain a consistent study schedule for better retention</p>
          <p>• Consider exploring more advanced topics in your favorite categories</p>
          <p>• Your completion rate is above average - keep up the excellent work!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AILearningAnalytics; 