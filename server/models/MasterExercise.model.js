const mongoose = require("mongoose");

const masterExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  // MET value represents the intensity. Higher is more intense.
  metValue: {
    type: Number,
    required: true,
  },
  // The unit helps our calculator know how to use the MET value.
  unit: {
    type: String,
    enum: ["per_minute", "per_rep_and_rest"], // 'per_minute' for cardio/holds, 'per_rep_and_rest' for lifting
    required: true,
  },
  category: {
    type: String,
    enum: ["Warm-up", "Strength", "Core", "HIIT", "LISS", "Cool-down"],
    required: true,
  },
});

module.exports = mongoose.model("MasterExercise", masterExerciseSchema);
