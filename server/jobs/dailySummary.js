const User = require("../models/User.model");
const DailyActivityLog = require("../models/DailyActivityLog.model");
// We no longer need MealLog here
const WorkoutLog = require("../models/WorkoutLog.model");
const Ingredient = require("../models/Ingredient.model"); // Need this for calculations
const {
  calculateWorkoutCalories,
  calculateStepCalories,
} = require("../utils/fitnessCalculator");

const finalizeDay = async (user, date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  let dailyActivity = await DailyActivityLog.findOne({
    userId: user._id,
    date: startOfDay,
  });

  // If no activity log exists for yesterday, there's nothing to finalize.
  if (!dailyActivity) {
    console.log(
      `[Job] No activity log found for user ${user.username} for date ${
        startOfDay.toISOString().split("T")[0]
      }. Skipping.`
    );
    return;
  }

  // --- THIS IS THE CRITICAL FIX ---
  // Instead of querying MealLog, we recalculate from the daily activity log itself.
  let caloriesIn = 0;
  if (dailyActivity.mealsLogged && dailyActivity.mealsLogged.length > 0) {
    const allIngredientIds = dailyActivity.mealsLogged.flatMap((meal) =>
      meal.ingredients.map((ing) => ing.ingredientId)
    );
    const uniqueIngredientIds = [...new Set(allIngredientIds)];
    const masterIngredients = await Ingredient.find({
      _id: { $in: uniqueIngredientIds },
    });
    const masterIngredientMap = new Map(
      masterIngredients.map((i) => [i._id.toString(), i])
    );

    for (const meal of dailyActivity.mealsLogged) {
      for (const loggedIng of meal.ingredients) {
        const masterIng = masterIngredientMap.get(
          loggedIng.ingredientId.toString()
        );
        if (masterIng) {
          const multiplier = loggedIng.weightInGrams / 100;
          caloriesIn += masterIng.calories_per_100g * multiplier;
        }
      }
    }
  }
  // --- END OF FIX ---

  const workoutLogs = await WorkoutLog.find({
    userId: user._id,
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay).setUTCHours(23, 59, 59, 999),
    },
  }).populate("workoutId");

  const bmr = user.physicalMetrics.bmr || 0;
  const stepCalories = calculateStepCalories(
    dailyActivity.steps.count,
    user.physicalMetrics.weight_kg
  );
  const workoutCalories = await calculateWorkoutCalories(
    workoutLogs,
    user.physicalMetrics.weight_kg
  );
  const caloriesOut = bmr + stepCalories + workoutCalories;

  dailyActivity.calorieBalance = {
    caloriesIn: Math.round(caloriesIn),
    caloriesOut: Math.round(caloriesOut),
    finalBalance: Math.round(caloriesIn - caloriesOut),
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
