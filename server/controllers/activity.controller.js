const DailyActivityLog = require("../models/DailyActivityLog.model");

// @desc    Update or create today's step count (manual entry)
// @route   POST /api/activity/steps
// @access  Private
const logSteps = async (req, res) => {
  const { stepCount } = req.body;
  const userId = req.user.id;

  // Normalize date to the beginning of the day (in UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    let dailyLog = await DailyActivityLog.findOne({ userId, date: today });

    if (dailyLog) {
      // Update existing log
      dailyLog.steps.count = stepCount;
    } else {
      // Create a new log for today
      dailyLog = new DailyActivityLog({
        userId,
        date: today,
        steps: { count: stepCount },
      });
    }

    await dailyLog.save();
    res.status(200).json(dailyLog);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error logging steps", error: err.message });
  }
};

module.exports = { logSteps };
