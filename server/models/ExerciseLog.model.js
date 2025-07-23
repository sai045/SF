const mongoose = require("mongoose");

const exerciseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workoutLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutLog",
      required: true,
    },
    exerciseName: { type: String, required: true, index: true },
    setNumber: { type: Number, required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExerciseLog", exerciseLogSchema);
