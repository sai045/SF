const mongoose = require("mongoose");

const bodyMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  weight_kg: Number,
  bodyFatPercentage: Number,
  waist_cm: Number,
  arms_cm: Number,
  chest_cm: Number,
  progressPhotoUrl: String,
});

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
