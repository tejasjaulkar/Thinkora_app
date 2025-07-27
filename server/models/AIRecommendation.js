const mongoose = require("mongoose");

const aiRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recommendedCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },
      reason: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: false,
      },
    },
  ],
  userInterests: [
    {
      type: String,
      required: false,
    },
  ],
  completedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
  ],
  learningGoals: [
    {
      type: String,
      required: false,
    },
  ],
  skillLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
aiRecommendationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
aiRecommendationSchema.index({ user: 1, isActive: 1 });
aiRecommendationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AIRecommendation", aiRecommendationSchema); 