const mongoose = require("mongoose");

const weeklyWorkoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    planName: {
      type: String,
      default: "My Weekly Routine",
    },
    weekStartDate: {
      type: Date,
    },
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
