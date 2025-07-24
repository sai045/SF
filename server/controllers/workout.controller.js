const User = require("../models/User.model");
const Workout = require("../models/Workout.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const ExerciseLog = require("../models/ExerciseLog.model");
const {
  gameConfig,
  checkAndApplyLevelUp,
  checkForPR,
} = require("../utils/gamification");
const { checkAchievements } = require("../utils/achievements");
const MasterExercise = require("../models/MasterExercise.model");

const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    res.json(workout);
  } catch (error) {
    console.error("Error fetching workout by ID:", error);
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
    console.error("Error fetching exercise history:", error);
    res
      .status(500)
      .json({ message: "Server error fetching exercise history." });
  }
};

const createPermanentWorkoutLog = async (
  userId,
  workoutId,
  duration,
  setsLogged
) => {
  const workoutTemplate = await Workout.findById(workoutId);
  if (!workoutTemplate) throw new Error("Workout template not found.");

  let expGained = gameConfig.EXP.WORKOUT_COMPLETE_BASE;
  if (workoutTemplate.type === "Boss Battle") {
    expGained *= gameConfig.EXP.BOSS_BATTLE_MULTIPLIER;
  }

  // Create the parent WorkoutLog to get its ID
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
    if (isNewPR) {
      prCount++;
      set.isPR = true; // Mutate for response
      // Trigger PR achievement check
      await checkAchievements(userId, "PR_HIT", {
        exerciseName: set.exerciseName,
        weight,
        reps,
        e1rm: weight * (1 + reps / 30),
      });
    } else {
      set.isPR = false;
    }

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

  // Trigger workout count achievement check
  await checkAchievements(userId, "WORKOUT_LOGGED", { setsLogged });

  const user = await User.findById(userId);
  user.exp += expGained;
  const updatedUser = await checkAndApplyLevelUp(user._id);

  // Return all necessary data
  return {
    message: `[System] Quest Complete! Workout logged. You gained ${expGained} EXP and hit ${prCount} PR(s)!`,
    log: newWorkoutLog,
    loggedSetsWithPRs: setsLogged,
    updatedUserStatus: {
      level: updatedUser.level,
      exp: updatedUser.exp,
      expToNextLevel: updatedUser.expToNextLevel,
      rank: updatedUser.rank,
    },
  };
};

// @desc    Log a workout session permanently
// @route   POST /api/workouts/log
// @access  Private
const logWorkout = async (req, res) => {
  const { workoutId, duration, setsLogged } = req.body;
  try {
    const result = await createPermanentWorkoutLog(
      req.user.id,
      workoutId,
      duration,
      setsLogged
    );
    res.status(201).json(result);
  } catch (error) {
    console.error("Error logging workout:", error);
    res.status(500).json({
      message: "Server error while logging workout.",
      error: error.message,
    });
  }
};

// @desc    Get a list of all historical workout logs for a user
// @route   GET /api/workouts/history/all
// @access  Private
const getWorkoutHistoryList = async (req, res) => {
  try {
    const history = await WorkoutLog.find({ userId: req.user.id })
      .populate("workoutId", "name type bossName") // Populate with workout name and type
      .sort({ date: -1 }); // Most recent first

    res.json(history);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    res.status(500).json({ message: "Server error fetching workout history." });
  }
};

// @desc    Get the full details of a single historical workout log
// @route   GET /api/workouts/history/log/:logId
// @access  Private
const getWorkoutLogDetails = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.logId).populate(
      "workoutId"
    ); // Get full workout template details

    // Security check: ensure the log belongs to the requesting user
    if (!log || log.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Workout log not found." });
    }

    res.json(log);
  } catch (error) {
    console.error("Error fetching workout log details:", error);
    res
      .status(500)
      .json({ message: "Server error fetching workout log details." });
  }
};

// @desc    Create a new custom workout routine
// @route   POST /api/workouts/custom
// @access  Private
const createCustomWorkout = async (req, res) => {
  const { name, description, exercises } = req.body;
  const userId = req.user.id;

  if (!name || !exercises || exercises.length === 0) {
    return res.status(400).json({
      message: "Workout name and at least one exercise are required.",
    });
  }

  try {
    const newWorkout = await Workout.create({
      name,
      description,
      exercises,
      createdBy: userId, // Link this workout to the user
      type: "Normal", // User-created workouts are 'Normal' by default
    });
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error("Error creating custom workout:", error);
    res.status(500).json({ message: "Server error creating custom workout." });
  }
};

// @desc    Get all custom workouts created by the user
// @route   GET /api/workouts/custom
// @access  Private
const getMyWorkouts = async (req, res) => {
  try {
    const myWorkouts = await Workout.find({ createdBy: req.user.id });
    res.json(myWorkouts);
  } catch (error) {
    console.error("Error fetching custom workouts:", error);
    res.status(500).json({ message: "Server error fetching custom workouts." });
  }
};

const getMasterExerciseList = async (req, res) => {
  try {
    const exercises = await MasterExercise.find({}).sort({
      category: 1,
      name: 1,
    });
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching master exercise list:", error);
    res
      .status(500)
      .json({ message: "Server error fetching master exercise list." });
  }
};

module.exports = {
  getWorkoutById,
  logWorkout,
  getExerciseHistory,
  getWorkoutHistoryList,
  getWorkoutLogDetails,
  createCustomWorkout,
  getMyWorkouts,
  createPermanentWorkoutLog,
  getMasterExerciseList,
};
