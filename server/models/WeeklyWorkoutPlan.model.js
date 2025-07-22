const mongoose = require("mongoose");

// This schema defines a structured workout plan for an entire week for a specific user.
const weeklyWorkoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
      index: true, // Indexing for faster lookups by user
    },
    planName: {
      type: String,
      default: "My Weekly Routine",
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    // Each day can link to a specific Workout document. 'null' signifies a rest day.
    days: {
      monday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      tuesday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      wednesday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      thursday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      friday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      saturday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
      sunday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        default: null,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyWorkoutPlan", weeklyWorkoutPlanSchema);
