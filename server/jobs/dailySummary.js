const User = require("../models/User.model");
const DailyActivityLog = require("../models/DailyActivityLog.model");
const MealLog = require("../models/MealLog.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const {
  calculateWorkoutCalories,
  calculateStepCalories,
} = require("../utils/fitnessCalculator");

const finalizeDay = async (user, date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const mealLogs = await MealLog.find({
    userId: user._id,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
  const caloriesIn = mealLogs.reduce((acc, log) => acc + log.totalCalories, 0);

  let dailyActivity = await DailyActivityLog.findOne({
    userId: user._id,
    date: startOfDay,
  });
  if (!dailyActivity) {
    dailyActivity = new DailyActivityLog({
      userId: user._id,
      date: startOfDay,
    });
  }

  const workoutLogs = await WorkoutLog.find({
    userId: user._id,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).populate("workoutId");

  const bmr = user.physicalMetrics.bmr || 0;
  const stepCalories = calculateStepCalories(
    dailyActivity.steps.count,
    user.physicalMetrics.weight_kg
  );
  const workoutCalories = calculateWorkoutCalories(
    workoutLogs,
    user.physicalMetrics.weight_kg
  );
  const caloriesOut = bmr + stepCalories + workoutCalories;

  dailyActivity.calorieBalance = {
    caloriesIn,
    caloriesOut,
    finalBalance: caloriesIn - caloriesOut,
    isFinalized: true,
  };

  await dailyActivity.save();
  console.log(
    `[Job] Finalized daily summary for user ${user.username} for date ${
      startOfDay.toISOString().split("T")[0]
    }`
  );
};

const runDailySummaryJob = async () => {
  console.log("[Job] Starting daily summary job...");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const users = await User.find({ "physicalMetrics.age": { $ne: null } });

  for (const user of users) {
    await finalizeDay(user, yesterday);
  }
  console.log(`[Job] Daily summary job finished for ${users.length} users.`);
};

module.exports = { runDailySummaryJob };
