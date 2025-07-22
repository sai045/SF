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
  bossName: String, // e.g., "Igris, the Blood-Red Commander"
  muscleGroups: [String],
  estimatedDuration: Number, // In minutes
  exercises: [exerciseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For admin or custom user routines
});

module.exports = mongoose.model("Workout", workoutSchema);
