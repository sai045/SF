const mongoose = require("mongoose");

const dailyActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true, index: true },
    steps: {
      count: { type: Number, default: 0 },
      goal: { type: Number, default: 8000 },
      expGained: { type: Number, default: 0 },
    },
    sleep: {
      duration: { type: Number, default: 0 },
      quality: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"] },
      expGained: { type: Number, default: 0 },
    },
    calorieBalance: {
      caloriesIn: { type: Number, default: 0 },
      caloriesOut: { type: Number, default: 0 },
      finalBalance: { type: Number, default: 0 },
      isFinalized: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "date"] }],
  }
);

module.exports = mongoose.model("DailyActivityLog", dailyActivityLogSchema);
