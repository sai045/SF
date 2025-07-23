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

// @desc    Get or create the full activity log for today
// @route   GET /api/activity/today
const getTodaysActivityLog = async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    let dailyLog = await DailyActivityLog.findOne({
      userId,
      date: today,
    }).populate("mealsLogged.ingredients.ingredientId"); // Populate for details

    if (!dailyLog) {
      dailyLog = new DailyActivityLog({ userId, date: today });
      await dailyLog.save();
    }
    res.json(dailyLog);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error getting today's log", error: err.message });
  }
};

// @desc    Update a specific meal within today's activity log
// @route   POST /api/activity/meals
const updateMealInLog = async (req, res) => {
  const { mealType, ingredients } = req.body; // ingredients is an array of { ingredientId, weightInGrams }
  const userId = req.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    let dailyLog = await DailyActivityLog.findOne({ userId, date: today });
    if (!dailyLog) {
      dailyLog = new DailyActivityLog({ userId, date: today });
    }

    const mealIndex = dailyLog.mealsLogged.findIndex(
      (m) => m.mealType === mealType
    );

    if (mealIndex > -1) {
      // Update existing meal
      dailyLog.mealsLogged[mealIndex].ingredients = ingredients;
    } else {
      // Add new meal
      dailyLog.mealsLogged.push({ mealType, ingredients });
    }

    await dailyLog.save();
    const populatedLog = await DailyActivityLog.findById(dailyLog._id).populate(
      "mealsLogged.ingredients.ingredientId"
    );

    res.json(populatedLog);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating meal log", error: err.message });
  }
};

module.exports = { logSteps, getTodaysActivityLog, updateMealInLog };
