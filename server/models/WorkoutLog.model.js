const mongoose = require("mongoose");

const setLogSchema = new mongoose.Schema({
  exerciseName: String,
  setNumber: Number,
  weight: Number,
  reps: Number,
  isPR: { type: Boolean, default: false }, // Personal Record
});

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
    totalVolume: Number, // Total weight lifted (sets * reps * weight)
    duration: Number, // In seconds
    setsLogged: [setLogSchema],
    expGained: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);
