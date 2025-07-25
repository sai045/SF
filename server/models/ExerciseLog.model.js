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

    weight: { type: mongoose.Schema.Types.Mixed, required: true },
    reps: { type: mongoose.Schema.Types.Mixed, required: true },

    date: { type: Date, default: Date.now },
    exerciseIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExerciseLog", exerciseLogSchema);
