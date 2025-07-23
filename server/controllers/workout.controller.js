const User = require("../models/User.model");
const Workout = require("../models/Workout.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const ExerciseLog = require("../models/ExerciseLog.model");
const {
  gameConfig,
  checkAndApplyLevelUp,
  checkForPR,
} = require("../utils/gamification");

const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getExerciseHistory = async (req, res) => {
  try {
    const lastLog = await ExerciseLog.findOne({
      userId: req.user.id,
      exerciseName: decodeURIComponent(req.params.exerciseName),
    }).sort({ date: -1 });
    res.json(lastLog);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching exercise history." });
  }
};

const logWorkout = async (req, res) => {
  const { workoutId, duration, setsLogged } = req.body;
  const userId = req.user.id;
  if (!workoutId || !setsLogged) {
    return res
      .status(400)
      .json({ message: "Workout ID and logged sets are required." });
  }

  try {
    const workoutTemplate = await Workout.findById(workoutId);
    if (!workoutTemplate)
      return res.status(404).json({ message: "Workout template not found." });

    let expGained = gameConfig.EXP.WORKOUT_COMPLETE_BASE;
    if (workoutTemplate.type === "Boss Battle") {
      expGained *= gameConfig.EXP.BOSS_BATTLE_MULTIPLIER;
    }

    const newWorkoutLog = await WorkoutLog.create({
      userId,
      workoutId,
      duration,
      setsLogged,
    });

    const exerciseLogsToCreate = [];
    let prCount = 0;

    for (const set of setsLogged) {
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps, 10);
      if (isNaN(weight) || isNaN(reps)) continue;

      const isNewPR = await checkForPR(userId, set.exerciseName, weight, reps);
      if (isNewPR) prCount++;
      set.isPR = isNewPR; // Mutate for response

      exerciseLogsToCreate.push({
        userId,
        workoutLogId: newWorkoutLog._id,
        exerciseName: set.exerciseName,
        setNumber: parseInt(set.setNumber, 10),
        weight,
        reps,
        date: newWorkoutLog.date,
      });
    }

    if (exerciseLogsToCreate.length > 0) {
      await ExerciseLog.insertMany(exerciseLogsToCreate);
    }

    expGained += prCount * gameConfig.EXP.PR_BONUS;
    expGained += setsLogged.length * gameConfig.EXP.SET_LOGGED;
    newWorkoutLog.expGained = expGained;
    await newWorkoutLog.save();

    const user = await User.findById(userId);
    user.exp += expGained;
    const updatedUser = await checkAndApplyLevelUp(user._id);

    res.status(201).json({
      message: `[System] Quest Complete! Workout logged. You gained ${expGained} EXP and hit ${prCount} PR(s)!`,
      log: newWorkoutLog,
      loggedSetsWithPRs: setsLogged,
      updatedUserStatus: {
        level: updatedUser.level,
        exp: updatedUser.exp,
        expToNextLevel: updatedUser.expToNextLevel,
        rank: updatedUser.rank,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while logging workout.",
        error: error.message,
      });
  }
};

module.exports = { getWorkoutById, logWorkout, getExerciseHistory };
