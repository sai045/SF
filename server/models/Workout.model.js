const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true }, // "8-12", "AMRAP", etc.
  rest: { type: Number, default: 60 }, // In seconds
  isSupersetWithNext: { type: Boolean, default: false },
});

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["Normal", "Boss Battle", "Template"],
    default: "Template",
  },
  bossName: String,
  muscleGroups: [String],
  estimatedDuration: Number,
  exercises: [exerciseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Workout", workoutSchema);
