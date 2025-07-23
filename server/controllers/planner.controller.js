const User = require("../models/User.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const MealLog = require("../models/MealLog.model");
const DailyActivityLog = require("../models/DailyActivityLog.model");
const {
  calculateWorkoutCalories,
  calculateStepCalories,
} = require("../utils/fitnessCalculator");

// @desc    Get the smart daily plan (workouts) for the logged-in user
// @route   GET /api/planner/today
// @access  Private
const getTodaysPlan = async (req, res) => {
  // This is a simplified version, the main data now comes from getDashboardData
  try {
    const user = await User.findById(req.user.id).populate({
      path: "activeWorkoutPlan",
      populate: {
        path: "days.monday days.tuesday days.wednesday days.thursday days.friday days.saturday days.sunday",
      },
    });

    const today = new Date();
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
      .format(today)
      .toLowerCase();

    let dailyWorkout = null;
    if (user.activeWorkoutPlan && user.activeWorkoutPlan.days[dayOfWeek]) {
      dailyWorkout = user.activeWorkoutPlan.days[dayOfWeek];
    }

    res.json({ dailyWorkout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error retrieving daily plan." });
  }
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

    // 1. Get total calories consumed today
    const mealLogs = await MealLog.find({
      userId: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const caloriesIn = mealLogs.reduce(
      (acc, log) => acc + log.totalCalories,
      0
    );

    // 2. Get today's workout and activity logs
    const activityLog = await DailyActivityLog.findOne({
      userId: user._id,
      date: startOfDay,
    });
    const workoutLogs = await WorkoutLog.find({
      userId: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("workoutId");

    // 3. Calculate live TDEE
    const bmr = user.physicalMetrics.bmr || 0;
    const stepCount = activityLog ? activityLog.steps.count : 0;
    const stepCalories = calculateStepCalories(
      stepCount,
      user.physicalMetrics.weight_kg
    );
    const workoutCalories = calculateWorkoutCalories(
      workoutLogs,
      user.physicalMetrics.weight_kg
    );
    const tdee = bmr + stepCalories + workoutCalories;

    // 4. Get workout quest for today
    const userWithPlan = await User.findById(user.id).populate({
      path: "activeWorkoutPlan",
      populate: {
        path: `days.${new Intl.DateTimeFormat("en-US", { weekday: "long" })
          .format(startOfDay)
          .toLowerCase()}`,
      },
    });

    let todaysWorkoutQuest = null;
    if (userWithPlan.activeWorkoutPlan) {
      const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        .format(startOfDay)
        .toLowerCase();
      const workout = userWithPlan.activeWorkoutPlan.days[dayOfWeek];
      if (workout) {
        const isCompleted = workoutLogs.some((log) =>
          log.workoutId._id.equals(workout._id)
        );
        todaysWorkoutQuest = {
          ...workout.toObject(),
          status: isCompleted ? "completed" : "pending",
        };
      }
    }

    res.json({
      caloriesIn: Math.round(caloriesIn),
      estimatedTDEE: Math.round(tdee),
      stepCount,
      todaysWorkoutQuest,
      // You can add more data here as needed, like recent meals etc.
    });
  } catch (error) {
    console.error("Error fetching dashboard data: ", error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
};

module.exports = { getTodaysPlan, getDashboardData };
