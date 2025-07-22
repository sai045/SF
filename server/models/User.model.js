const mongoose = require("mongoose");

const hunterRanks = ["E", "D", "C", "B", "A", "S", "SS"];

const userSchema = new mongoose.Schema(
  {
    // --- Auth & Profile ---
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "default_avatar.png" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // --- Gamification & RPG Layer ---
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    expToNextLevel: { type: Number, default: 100 },
    rank: { type: String, enum: hunterRanks, default: "E" },
    title: { type: String, default: "The Weakest Hunter" },
    prestigeLevel: { type: Number, default: 0 },
    completedAchievements: [String], // Field for tracking earned titles/badges

    // --- Core Stats & Streaks ---
    streaks: {
      workout: {
        count: { type: Number, default: 0 },
        lastDate: { type: Date },
      },
      meal: { count: { type: Number, default: 0 }, lastDate: { type: Date } },
      // sleep and step streaks will now be calculated from DailyActivityLog
    },

    // --- Goals & Preferences ---
    personalGoals: {
      weightGoal: Number,
      bodyFatGoal: Number,
      strengthGoal: String,
      dailyStepGoal: { type: Number, default: 8000 },
    },

    // --- Linked Data (Active Plans) ---
    customWorkouts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workout" }],

    // --- ADD/UPDATE THESE LINES ---
    activeWorkoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyWorkoutPlan",
    },
    activeMealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyMealPlan",
    },
    // --- END OF UPDATE ---
  },
  { timestamps: true }
);

// Note: I renamed weeklyMealPlan -> activeMealPlan and added activeWorkoutPlan for clarity and consistency.

module.exports = mongoose.model("User", userSchema);
