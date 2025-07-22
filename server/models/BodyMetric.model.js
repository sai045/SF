const mongoose = require("mongoose");

const bodyMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  weight: Number,
  bodyFatPercentage: Number,
  waist: Number,
  arms: Number,
  chest: Number,
  progressPhotoUrl: String,
});

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
