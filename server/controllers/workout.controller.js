const WorkoutLog = require("../models/WorkoutLog.model");
const Workout = require("../models/Workout.model");
const User = require("../models/User.model");
const { gameConfig, checkAndApplyLevelUp } = require("../utils/gamification");

// @desc    Log a completed workout session
// @route   POST /api/workouts/log
// @access  Private
const logWorkout = async (req, res) => {
  const { workoutId, duration, setsLogged, totalVolume } = req.body;
  const userId = req.user.id; // From auth middleware

  if (!workoutId || !duration || !setsLogged) {
    return res
      .status(400)
      .json({ message: "Missing required workout log data." });
  }

  try {
    // --- Calculate EXP ---
    const workoutTemplate = await Workout.findById(workoutId);
    if (!workoutTemplate) {
      return res.status(404).json({ message: "Workout template not found." });
    }

    let expGained = gameConfig.EXP.WORKOUT_COMPLETE_BASE;
    if (workoutTemplate.type === "Boss Battle") {
      expGained *= gameConfig.EXP.BOSS_BATTLE_MULTIPLIER;
    }
    expGained += setsLogged.length * gameConfig.EXP.SET_LOGGED;

    // Check for PRs in the logged sets
    const prCount = setsLogged.filter((set) => set.isPR).length;
    expGained += prCount * gameConfig.EXP.PR_BONUS;

    // --- Save the Log ---
    const newLog = await WorkoutLog.create({
      userId,
      workoutId,
      duration,
      setsLogged,
      totalVolume: totalVolume || 0,
      expGained,
    });

    // --- Update User Stats ---
    const user = await User.findById(userId);
    user.exp += expGained;

    // --- Check for Level Up and Save ---
    // This function handles the level up logic and saves the user
    const updatedUser = await checkAndApplyLevelUp(user._id);

    res.status(201).json({
      message: `[System] Quest Complete! Workout "${workoutTemplate.name}" logged. You gained ${expGained} EXP.`,
      log: newLog,
      updatedUserStatus: {
        level: updatedUser.level,
        exp: updatedUser.exp,
        expToNextLevel: updatedUser.expToNextLevel,
        rank: updatedUser.rank,
      },
    });
  } catch (error) {
    console.error("Error logging workout: ", error);
    res.status(500).json({
      message: "Server error while logging workout.",
      error: error.message,
    });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { logWorkout, getWorkoutById };
