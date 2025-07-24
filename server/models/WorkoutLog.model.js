const mongoose = require("mongoose");

const setLogSchema = new mongoose.Schema(
  {
    exerciseName: String,
    setNumber: Number,
    weight: { type: mongoose.Schema.Types.Mixed, default: 0 },
    reps: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },
    date: { type: Date, default: Date.now },
    totalVolume: Number,
    duration: Number,
    setsLogged: [setLogSchema],
    expGained: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);
