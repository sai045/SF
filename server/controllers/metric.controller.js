const BodyMetric = require("../models/BodyMetric.model");
const User = require("../models/User.model");

// @desc    Log a new body metric entry for the current user
// @route   POST /api/metrics
// @access  Private
const logBodyMetric = async (req, res) => {
  try {
    const { weight_kg, bodyFatPercentage, waist_cm, arms_cm, chest_cm } =
      req.body;
    const userId = req.user.id;

    // Create the new metric log
    const newMetric = await BodyMetric.create({
      userId,
      weight_kg,
      bodyFatPercentage,
      waist_cm,
      arms_cm,
      chest_cm,
      date: new Date(),
    });

    // Also, update the user's primary weight on the User model for TDEE calculations
    if (weight_kg) {
      const user = await User.findById(userId);
      if (user.physicalMetrics) {
        user.physicalMetrics.weight_kg = weight_kg;
        // We should also recalculate BMR here if we have all the data
        // For now, just updating weight is fine.
        await user.save();
      }
    }

    res.status(201).json(newMetric);
  } catch (error) {
    console.error("Error logging body metric:", error);
    res
      .status(500)
      .json({
        message: "Server error logging body metric.",
        error: error.message,
      });
  }
};

// @desc    Get all historical body metric entries for the current user
// @route   GET /api/metrics
// @access  Private
const getBodyMetricsHistory = async (req, res) => {
  try {
    const metrics = await BodyMetric.find({ userId: req.user.id }).sort({
      date: "asc",
    });
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error fetching metric history:", error);
    res.status(500).json({
      message: "Server error fetching metric history.",
      error: error.message,
      });
  }
};

module.exports = {
  logBodyMetric,
  getBodyMetricsHistory,
};
