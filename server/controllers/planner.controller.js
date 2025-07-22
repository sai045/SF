const User = require("../models/User.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const MealLog = require("../models/MealLog.model");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model"); // Assuming it exists

// @desc    Get the smart daily plan for the logged-in user
// @route   GET /api/planner/today
// @access  Private
const getTodaysPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "activeWorkoutPlan",
        populate: {
          path: "days.monday days.tuesday days.wednesday days.thursday days.friday days.saturday days.sunday",
        },
      })
      .populate("activeMealPlan"); // Add more population for meals later

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- Determine Today's Tasks ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
      .format(today)
      .toLowerCase();

    const dailyPlanner = {
      date: today.toISOString().split("T")[0],
      dayOfWeek,
      dailyWorkout: null,
      dailyMeals: [], // Will be an array of { name, status }
      missedActions: [],
      nextBestAction: null,
    };

    // --- 1. Find Today's Workout ---
    if (user.activeWorkoutPlan && user.activeWorkoutPlan.days[dayOfWeek]) {
      const todaysWorkout = user.activeWorkoutPlan.days[dayOfWeek];

      // Check if this workout was already logged today
      const startOfDay = new Date(today);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const workoutLog = await WorkoutLog.findOne({
        userId: user._id,
        workoutId: todaysWorkout._id,
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      dailyPlanner.dailyWorkout = {
        ...todaysWorkout.toObject(),
        status: workoutLog ? "completed" : "pending",
      };
    }

    // --- 2. Find Today's Meals (Placeholder logic) ---
    // We'll add meal logic later when those features are built.
    // For now, let's create some dummy meals.
    dailyPlanner.dailyMeals = [
      { name: "Track Breakfast", status: "pending" },
      { name: "Track Lunch", status: "pending" },
      { name: "Track Dinner", status: "pending" },
    ];

    // --- 3. Check for Missed Actions (from yesterday) ---
    // (Simplified logic for now) If yesterday's workout wasn't done, flag it.
    // This can be expanded greatly.

    // --- 4. Suggest Next Action ---
    if (
      dailyPlanner.dailyWorkout &&
      dailyPlanner.dailyWorkout.status === "pending"
    ) {
      dailyPlanner.nextBestAction = `Time to start your workout: "${dailyPlanner.dailyWorkout.name}"`;
    } else {
      const pendingMeal = dailyPlanner.dailyMeals.find(
        (m) => m.status === "pending"
      );
      if (pendingMeal) {
        dailyPlanner.nextBestAction = `Next up: ${pendingMeal.name}`;
      } else {
        dailyplanner.nextBestAction =
          "All quests complete for today. Well done, Hunter.";
      }
    }

    res.status(200).json(dailyPlanner);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error retrieving daily plan.",
        error: error.message,
      });
  }
};

module.exports = { getTodaysPlan };
