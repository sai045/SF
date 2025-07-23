const mongoose = require("mongoose");

const setLogSchema = new mongoose.Schema(
  {
    exerciseName: String,
    setNumber: Number,
    weight: Number,
    reps: Number,
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    // We will store the sets logged directly in the session document
    setsLogged: [setLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
