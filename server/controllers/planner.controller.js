const User = require("../models/User.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const Ingredient = require("../models/Ingredient.model");
const DailyActivityLog = require("../models/DailyActivityLog.model");
const WorkoutSession = require("../models/WorkoutSession.model"); // Important import
const {
  calculateWorkoutCalories,
  calculateStepCalories,
} = require("../utils/fitnessCalculator");

// This function is now legacy, as getDashboardData is more comprehensive.
// It can be removed or kept for other purposes.
const getTodaysPlan = async (req, res) => {
  res
    .status(404)
    .json({ message: "Please use the /api/planner/dashboard endpoint." });
};

// @desc    Get all combined data for the main dashboard view
// @route   GET /api/planner/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // --- 1. LIVE CALORIE & ACTIVITY CALCULATION ---
    let caloriesIn = 0;
    const dailyLog = await DailyActivityLog.findOne({
      userId: user._id,
      date: startOfDay,
    });

    if (dailyLog && dailyLog.mealsLogged && dailyLog.mealsLogged.length > 0) {
      const allIngredientIds = dailyLog.mealsLogged.flatMap((meal) =>
        meal.ingredients.map((ing) => ing.ingredientId)
      );
      const uniqueIngredientIds = [...new Set(allIngredientIds)];
      const masterIngredients = await Ingredient.find({
        _id: { $in: uniqueIngredientIds },
      });
      const masterIngredientMap = new Map(
        masterIngredients.map((i) => [i._id.toString(), i])
      );

      for (const meal of dailyLog.mealsLogged) {
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

    const activityLog = await DailyActivityLog.findOne({
      userId: user._id,
      date: startOfDay,
    });
    // NOTE: Historical workout logs are ONLY for calculating TDEE, NOT for quest status.
    const historicalWorkoutLogs = await WorkoutLog.find({
      userId: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("workoutId");

    // Ensure physical metrics exist before calculating
    if (!user.physicalMetrics || !user.physicalMetrics.weight_kg) {
      // If the user hasn't completed setup, send back zeros.
      return res.json({
        caloriesIn: Math.round(caloriesIn),
        estimatedTDEE: 0,
        stepCount: 0,
        todaysWorkoutQuest: null, // Can't have a quest without a plan
      });
    }

    const bmr = user.physicalMetrics.bmr || 0;
    const stepCount = activityLog ? activityLog.steps.count : 0;
    const stepCalories = calculateStepCalories(
      stepCount,
      user.physicalMetrics.weight_kg
    );
    const workoutCalories = await calculateWorkoutCalories(
      historicalWorkoutLogs,
      user.physicalMetrics.weight_kg
    );
    const tdee = bmr + stepCalories + workoutCalories;

    // --- 2. Workout Quest Status (THE CORRECTED LOGIC) ---
    let todaysWorkoutQuest = null;
    const userWithPlan = await User.findById(user.id).populate({
      path: "activeWorkoutPlan",
      populate: {
        path: `days.${new Intl.DateTimeFormat("en-US", { weekday: "long" })
          .format(startOfDay)
          .toLowerCase()}`,
      },
    });

    if (userWithPlan.activeWorkoutPlan) {
      const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        .format(startOfDay)
        .toLowerCase();
      const workout = userWithPlan.activeWorkoutPlan.days[dayOfWeek];

      if (workout) {
        // The SINGLE SOURCE OF TRUTH: Find a session for this specific workout today.
        const session = await WorkoutSession.findOne({
          userId: user.id,
          workoutId: workout._id,
          date: startOfDay,
        });

        let status = "pending";
        let sessionId = null;

        if (session) {
          // If a session exists, its status is the quest's status.
          status = session.status; // This will be 'in-progress' or 'completed'
          sessionId = session._id;
        }

        todaysWorkoutQuest = { ...workout.toObject(), status, sessionId };
      }
    }

    res.json({
      caloriesIn: Math.round(caloriesIn),
      estimatedTDEE: Math.round(tdee),
      stepCount,
      todaysWorkoutQuest,
    });
  } catch (error) {
    console.error("Error fetching dashboard data: ", error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
};

module.exports = { getTodaysPlan, getDashboardData };
