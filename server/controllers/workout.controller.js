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

// =================================================================
// THE COMPLETE AND CORRECTED SERVICE-LIKE FUNCTION
// =================================================================
const createPermanentWorkoutLog = async (
  userId,
  workoutId,
  duration,
  setsLogged
) => {
  // 1. Fetch the workout template for details
  const workoutTemplate = await Workout.findById(workoutId);
  if (!workoutTemplate) {
    // Use a specific error message that can be shown to the user
    throw new Error(
      "Workout template for this log could not be found. It may have been deleted."
    );
  }

  // 2. Calculate the base EXP for completing the workout
  let expGained = gameConfig.EXP.WORKOUT_COMPLETE_BASE;
  if (workoutTemplate.type === "Boss Battle") {
    expGained *= gameConfig.EXP.BOSS_BATTLE_MULTIPLIER;
  }

  // 3. Create the parent WorkoutLog to establish a start time and get its ID
  const newWorkoutLog = await WorkoutLog.create({
    userId,
    workoutId,
    duration,
    setsLogged, // Save the raw setsLogged here for historical detail
    date: new Date(), // The official timestamp for this entire workout session
  });

  const exerciseLogsToCreate = [];
  let prCount = 0;
  const workoutStartDate = newWorkoutLog.date; // Use this consistent start time for all checks

  // 4. Loop through every set to create granular logs and check for PRs
  for (const set of setsLogged) {
    // Sanitize and parse data
    const weight = parseFloat(set.weight);
    const reps = parseInt(set.reps, 10);

    // Skip any sets with invalid data (e.g., non-numeric reps for a strength exercise)
    if (typeof set.weight === "object" || isNaN(reps) || isNaN(weight)) {
      // This is a cardio or timed set, no PR check needed for these.
      set.isPR = false;
    } else {
      // This is a strength set, check for a PR
      const isNewPR = await checkForPR(
        userId,
        set.exerciseName,
        weight,
        reps,
        workoutStartDate
      );

      if (isNewPR) {
        prCount++;
        set.isPR = true; // Mutate the set object for the response
        // Trigger PR achievement check, passing all relevant data
        await checkAchievements(userId, "PR_HIT", {
          exerciseName: set.exerciseName,
          weight,
          reps,
          e1rm: weight * (1 + reps / 30),
        });
      } else {
        set.isPR = false;
      }
    }

    // Add the granular log to the array to be bulk-inserted later
    exerciseLogsToCreate.push({
      userId,
      workoutLogId: newWorkoutLog._id,
      exerciseName: set.exerciseName,
      setNumber: parseInt(set.setNumber, 10),
      weight: set.weight, // Store the Mixed type data (object or number)
      reps: set.reps, // Store the Mixed type data (string or number)
      date: workoutStartDate,
    });
  }

  // 5. Bulk insert all the granular ExerciseLogs for efficiency
  if (exerciseLogsToCreate.length > 0) {
    await ExerciseLog.insertMany(exerciseLogsToCreate);
  }

  // 6. Add bonus EXP for PRs and total sets, then update the parent log
  expGained += prCount * gameConfig.EXP.PR_BONUS;
  expGained += setsLogged.length * gameConfig.EXP.SET_LOGGED;
  newWorkoutLog.expGained = expGained;
  await newWorkoutLog.save();

  // 7. Trigger achievement checks related to the workout completion
  await checkAchievements(userId, "WORKOUT_LOGGED", { setsLogged });

  // 8. Update the user's total EXP and check for level ups
  const user = await User.findById(userId);
  user.exp += expGained;
  const updatedUser = await checkAndApplyLevelUp(user._id);

  // --- FIX FOR WORKOUT STREAK ---
  const today = new Date();
  const yesterday = subDays(today, 1);

  // Check if the last workout was yesterday to continue the streak
  if (
    user.streaks?.workout?.lastDate &&
    isSameDay(yesterday, user.streaks.workout.lastDate)
  ) {
    user.streaks.workout.count += 1;
  }
  // Check if the last workout was NOT today to start a new streak
  else if (
    !user.streaks?.workout?.lastDate ||
    !isSameDay(today, user.streaks.workout.lastDate)
  ) {
    user.streaks.workout.count = 1;
  }
  // If a workout was already logged today, the streak count remains the same.

  user.streaks.workout.lastDate = today;

  // 9. Return all necessary data to the controller that called this function
  return {
    message: `[System] Quest Complete! Workout logged. You gained ${expGained} EXP and hit ${prCount} PR(s)!`,
    log: newWorkoutLog,
    loggedSetsWithPRs: setsLogged, // Send back the sets with the 'isPR' flag
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

// @desc    Get the full details of a single historical workout log AND CALCULATE PRs
// @route   GET /api/workouts/history/log/:logId
// @access  Private
const getWorkoutLogDetails = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.logId)
      .populate("workoutId")
      .lean(); // Use .lean() for a plain JavaScript object, which is faster and easier to modify

    if (!log || log.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Workout log not found." });
    }

    // --- THIS IS THE NEW DYNAMIC PR CALCULATION ---
    // Create a new array of sets by mapping over the existing ones
    const setsWithPRs = await Promise.all(
      log.setsLogged.map(async (set) => {
        let isPR = false;
        // Only check for PRs on strength/bodyweight sets (where reps and weight are numbers)
        const weight = parseFloat(set.weight);
        const reps = parseInt(set.reps, 10);

        if (!isNaN(weight) && !isNaN(reps)) {
          // Call our existing checkForPR function. The log's date is the workout's start time.
          isPR = await checkForPR(
            req.user.id,
            set.exerciseName,
            weight,
            reps,
            log.date
          );
        }

        // Return a new object that includes the original set data plus the calculated isPR flag
        return {
          ...set,
          isPR: isPR,
        };
      })
    );
    // --- END OF NEW LOGIC ---

    // Replace the old setsLogged array with our new, enhanced one
    log.setsLogged = setsWithPRs;

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

// @desc    Get a list of all unique exercises a user has performed
// @route   GET /api/workouts/history/performed-exercises
// @access  Private
const getPerformedExercises = async (req, res) => {
  try {
    const distinctExercises = await ExerciseLog.distinct("exerciseName", {
      userId: req.user.id,
    });
    res.json(distinctExercises);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching performed exercises." });
  }
};

// @desc    Get the full historical data for a single exercise
// @route   GET /api/workouts/history/exercise/:exerciseName
// @access  Private
const getSingleExerciseHistory = async (req, res) => {
  try {
    const exerciseName = decodeURIComponent(req.params.exerciseName);
    const userId = req.user.id;

    const masterExercise = await MasterExercise.findOne({ name: exerciseName });
    if (!masterExercise) {
      return res
        .status(404)
        .json({ message: "Master exercise data not found." });
    }

    const history = await ExerciseLog.find({ userId, exerciseName }).sort({
      date: "asc",
    });

    res.json({ masterExercise, history });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching exercise history." });
  }
};

module.exports = {
  getWorkoutById,
  logWorkout,
  getExerciseHistory,
  getSingleExerciseHistory,
  getWorkoutHistoryList,
  getWorkoutLogDetails,
  createCustomWorkout,
  getMyWorkouts,
  createPermanentWorkoutLog,
  getMasterExerciseList,
  getPerformedExercises,
};
