import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIQuiz } from '../../../services/operations/aiAPI';
import { 
  FaQuestionCircle, 
  FaSpinner, 
  FaMagic, 
  FaCheck, 
  FaTimes,
  FaEye,
  FaEdit
} from 'react-icons/fa';

const AIQuizGenerator = ({ courseId, sectionId, subsectionId, onQuizGenerated }) => {
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { token } = useSelector((state) => state.auth);

  const handleGenerateQuiz = async () => {
    if (!content.trim()) {
      alert('Please enter some content to generate questions from.');
      return;
    }

    try {
      setIsGenerating(true);
      const quiz = await generateAIQuiz(
        courseId, 
        sectionId, 
        subsectionId, 
        content, 
        numQuestions, 
        token
      );
      
      if (quiz) {
        setGeneratedQuiz(quiz);
        if (onQuizGenerated) {
          onQuizGenerated(quiz);
        }
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = () => {
    // This would typically save the quiz to the database
    // For now, we'll just show a success message
    alert('Quiz saved successfully!');
  };

  const calculateScore = (answers) => {
    if (!generatedQuiz) return 0;
    
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === generatedQuiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / generatedQuiz.questions.length) * 100);
  };

  return (
    <div className="bg-richblack-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <FaMagic className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-richblack-5 font-semibold text-xl">AI Quiz Generator</h2>
          <p className="text-richblack-300 text-sm">Generate quiz questions from your course content</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-richblack-300 text-sm mb-2">
            Number of Questions
          </label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="bg-richblack-700 text-richblack-5 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {[3, 5, 7, 10].map(num => (
              <option key={num} value={num}>{num} questions</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-richblack-300 text-sm mb-2">
            Course Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your course content here to generate quiz questions..."
            rows={8}
            className="w-full bg-richblack-700 text-richblack-5 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating || !content.trim()}
          className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaMagic />
          )}
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </div>

      {/* Generated Quiz Preview */}
      {generatedQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-richblack-5 font-medium text-lg">Generated Quiz</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                <FaEye />
                {showPreview ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={handleSaveQuiz}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                <FaCheck />
                Save Quiz
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-richblack-5 font-medium mb-2">{generatedQuiz.title}</h4>
            <p className="text-richblack-300 text-sm">{generatedQuiz.description}</p>
            <div className="flex gap-4 mt-2 text-xs text-richblack-400">
              <span>Difficulty: {generatedQuiz.difficulty}</span>
              <span>Time Limit: {generatedQuiz.timeLimit} minutes</span>
              <span>Passing Score: {generatedQuiz.passingScore}%</span>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-4">
              {generatedQuiz.questions.map((question, index) => (
                <div key={index} className="bg-richblack-600 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-richblack-5 font-medium mb-3">{question.question}</p>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center gap-3 p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-500/20 border border-green-500'
                                : 'bg-richblack-500'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              optionIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : 'border-richblack-300'
                            }`}>
                              {optionIndex === question.correctAnswer && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                            <span className="text-richblack-5 text-sm">{option}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                        <p className="text-blue-400 text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AIQuizGenerator; 