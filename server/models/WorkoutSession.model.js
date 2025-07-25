const mongoose = require("mongoose");

// Sub-schema for a single exercise within the session
const sessionExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    rest: { type: Number },
  },
  { _id: false }
);

const setLogSchema = new mongoose.Schema(
  {
    exerciseName: String,
    setNumber: Number,
    weight: { type: mongoose.Schema.Types.Mixed, default: 0 },
    reps: String,
    exerciseIndex: { type: Number, required: true },
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

    exercises: [sessionExerciseSchema],

    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    setsLogged: [setLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
