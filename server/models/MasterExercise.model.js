const mongoose = require("mongoose");

const masterExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, index: true },
  metValue: { type: Number, required: true },
  unit: {
    type: String,
    enum: ["per_minute", "per_rep_and_rest"],
    required: true,
  },
  category: {
    type: String,
    enum: ["Warm-up", "Strength", "Core", "HIIT", "LISS", "Cool-down"],
    required: true,
  },
  youtubeLink: { type: String, trim: true }, 
  defaultSpeed_kmph: { type: Number },
  defaultIncline_percent: { type: Number },
});

module.exports = mongoose.model("MasterExercise", masterExerciseSchema);
