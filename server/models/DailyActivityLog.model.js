const mongoose = require("mongoose");

// This schema captures daily, non-workout related metrics like steps and sleep.
const dailyActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    steps: {
      count: { type: Number, default: 0 },
      goal: { type: Number, default: 8000 },
      expGained: { type: Number, default: 0 },
    },
    sleep: {
      duration: { type: Number, default: 0 }, // Duration in minutes for precision
      quality: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"] }, // Optional quality metric
      expGained: { type: Number, default: 0 },
    },
    // We can add other daily check-ins here later
  },
  {
    timestamps: true,
    // Create a compound index to ensure only one log per user per day
    indexes: [{ unique: true, fields: ["userId", "date"] }],
  }
);

module.exports = mongoose.model("DailyActivityLog", dailyActivityLogSchema);
