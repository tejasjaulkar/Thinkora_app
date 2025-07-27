const natural = require('natural');
const nlp = require('compromise');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI configured successfully");
} else {
    console.log("⚠️  OpenAI API key not found. AI features will be disabled.");
}

// Initialize natural language processing tools
const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// AI Service Configuration
const aiConfig = {
    // OpenAI Configuration
    openai: {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
    },
    
    // Content Analysis Configuration
    contentAnalysis: {
        minKeywords: 3,
        maxKeywords: 10,
        summaryLength: 150,
    },
    
    // Recommendation Configuration
    recommendation: {
        minSimilarityScore: 0.3,
        maxRecommendations: 5,
    },
    
    // Quiz Generation Configuration
    quiz: {
        maxQuestions: 10,
        questionTypes: ['multiple-choice', 'true-false', 'short-answer'],
    }
};

// Helper functions for AI operations
const aiHelpers = {
    // Extract keywords from text
    extractKeywords: (text) => {
        const tokens = tokenizer.tokenize(text.toLowerCase());
        const filteredTokens = tokens.filter(token => 
            token.length > 3 && !natural.stopwords.includes(token)
        );
        
        tfidf.addDocument(filteredTokens);
        const keywords = tfidf.listTerms(0).slice(0, 5).map(item => item.term);
        return keywords;
    },

    // Calculate text similarity
    calculateSimilarity: (text1, text2) => {
        const tokens1 = new Set(tokenizer.tokenize(text1.toLowerCase()));
        const tokens2 = new Set(tokenizer.tokenize(text2.toLowerCase()));
        
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        
        return intersection.size / union.size;
    },

    // Extract entities from text
    extractEntities: (text) => {
        const doc = nlp(text);
        return {
            people: doc.people().out('array'),
            places: doc.places().out('array'),
            organizations: doc.organizations().out('array'),
            topics: doc.topics().out('array'),
        };
    },

    // Generate content summary
    generateSummary: async (content) => {
        if (!openai) {
            return "AI summary generation is not available. Please configure OpenAI API key.";
        }
        
        try {
            const response = await openai.chat.completions.create({
                model: aiConfig.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise summaries of educational content. Focus on key concepts and learning objectives.'
                    },
                    {
                        role: 'user',
                        content: `Please create a brief summary (${aiConfig.contentAnalysis.summaryLength} words max) of the following content:\n\n${content}`
                    }
                ],
                max_tokens: aiConfig.openai.maxTokens,
                temperature: aiConfig.openai.temperature,
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating summary:', error);
            return "Unable to generate summary at this time.";
        }
    },

    // Generate quiz questions
    generateQuizQuestions: async (content, numQuestions = 5) => {
        if (!openai) {
            return [{
                question: "AI quiz generation is not available. Please configure OpenAI API key.",
                options: ["Feature disabled"],
                correctAnswer: 0,
                explanation: "Enable OpenAI API key to use this feature."
            }];
        }
        
        try {
            const response = await openai.chat.completions.create({
                model: aiConfig.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational expert. Generate quiz questions based on the provided content. Return the response as a JSON array with objects containing: question, options (array), correctAnswer (index), explanation.'
                    },
                    {
                        role: 'user',
                        content: `Generate ${numQuestions} multiple-choice questions based on this content:\n\n${content}`
                    }
                ],
                max_tokens: aiConfig.openai.maxTokens * 2,
                temperature: aiConfig.openai.temperature,
            });
            
            const questions = JSON.parse(response.choices[0].message.content);
            return questions;
        } catch (error) {
            console.error('Error generating quiz questions:', error);
            return [{
                question: "Unable to generate quiz questions at this time.",
                options: ["Please try again later"],
                correctAnswer: 0,
                explanation: "There was an error generating the quiz."
            }];
        }
    },

    // Generate course recommendations
    generateRecommendations: async (userInterests, completedCourses, availableCourses) => {
        if (!openai) {
            return "AI recommendations are not available. Please configure OpenAI API key.";
        }
        
        try {
            const response = await openai.chat.completions.create({
                model: aiConfig.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a course recommendation expert. Based on user interests and completed courses, recommend the most suitable courses from the available options.'
                    },
                    {
                        role: 'user',
                        content: `User interests: ${userInterests.join(', ')}\nCompleted courses: ${completedCourses.join(', ')}\nAvailable courses: ${availableCourses.join(', ')}\n\nRecommend the top 3 most suitable courses with brief explanations.`
                    }
                ],
                max_tokens: aiConfig.openai.maxTokens,
                temperature: aiConfig.openai.temperature,
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return "Unable to generate recommendations at this time.";
        }
    },

    // AI Learning Assistant
    learningAssistant: async (question, context = '') => {
        if (!openai) {
            return "I apologize, but the AI assistant is currently not available. Please configure the OpenAI API key to enable this feature.";
        }
        
        try {
            const response = await openai.chat.completions.create({
                model: aiConfig.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI learning assistant for an educational platform. Provide helpful, accurate, and educational responses. If you don\'t know something, say so.'
                    },
                    {
                        role: 'user',
                        content: `Context: ${context}\n\nQuestion: ${question}`
                    }
                ],
                max_tokens: aiConfig.openai.maxTokens,
                temperature: aiConfig.openai.temperature,
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error with learning assistant:', error);
            return 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
        }
    }
};

module.exports = {
    openai,
    aiConfig,
    aiHelpers,
}; 