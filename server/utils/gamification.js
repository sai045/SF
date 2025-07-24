const mongoose = require("mongoose");
const User = require("../models/User.model");
const ExerciseLog = require("../models/ExerciseLog.model");
const MasterExercise = require("../models/MasterExercise.model");
const { calculateE1RM } = require("./fitnessCalculator");

const config = {
  EXP: {
    WORKOUT_COMPLETE_BASE: 100,
    BOSS_BATTLE_MULTIPLIER: 2.5,
    SET_LOGGED: 2,
    PR_BONUS: 25,
    MEAL_LOGGED: 15,
    INGREDIENT_BONUS: 2, // Per ingredient in a custom meal
    STEP_MILESTONE: 10, // Per 1000 steps
    SLEEP_BONUS: 40, // For 8+ hours
    HABIT_COMPLETED: 10,
  },
  LEVEL_UP_FORMULA: (level) => Math.floor(100 * Math.pow(level, 1.5)),
  RANK_THRESHOLDS: {
    E: 1,
    D: 10,
    C: 20,
    B: 30,
    A: 40,
    S: 50,
    SS: 60,
  },
};

const checkAndApplyLevelUp = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  let hasLeveledUp = false;
  while (user.exp >= user.expToNextLevel) {
    hasLeveledUp = true;
    const remainingExp = user.exp - user.expToNextLevel;

    user.level += 1;
    user.exp = remainingExp;
    user.expToNextLevel = config.LEVEL_UP_FORMULA(user.level);

    const newRank = Object.keys(config.RANK_THRESHOLDS)
      .reverse()
      .find((rank) => user.level >= config.RANK_THRESHOLDS[rank]);
    if (newRank && newRank !== user.rank) {
      user.rank = newRank;
    }
  }

  if (hasLeveledUp) {
    await user.save();
  }

  return user;
};

/**
 * Checks if a new set is a Personal Record for a given user and exercise.
 * @param {string} userId - The ID of the user.
 * @param {string} exerciseName - The name of the exercise.
 * @param {number} newWeight - The weight of the newly logged set.
 * @param {number} newReps - The reps of the newly logged set.
 * @param {Date} workoutStartDate - The start date of the current workout session.
 * @returns {Promise<boolean>} - True if it's a new PR, false otherwise.
 */
const checkForPR = async (
  userId,
  exerciseName,
  newWeight,
  newReps,
  workoutStartDate
) => {
  try {
    const masterEx = await MasterExercise.findOne({ name: exerciseName });
    if (!masterEx) return false;

    if (masterEx.isBodyweight) {
      // Bodyweight logic (based on max reps)
      const bestPreviousSet = await ExerciseLog.findOne({
        userId,
        exerciseName,
        date: { $lt: workoutStartDate },
        // Ensure we only compare against numeric reps
        reps: { $type: "number" },
      }).sort({ reps: -1 });

      const previousBestReps = bestPreviousSet ? bestPreviousSet.reps : 0;
      return newReps > previousBestReps;
    } else {
      // Weighted Exercise Logic (based on e1RM)
      const newE1RM = calculateE1RM(newWeight, newReps);
      if (isNaN(newE1RM)) return false;

      const historicalBests = await ExerciseLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            exerciseName,
            date: { $lt: workoutStartDate },
            // --- THIS IS THE CRITICAL FIX ---
            // Only include documents where 'reps' and 'weight' are numbers in this pipeline.
            reps: { $type: "number" },
            weight: { $type: "number" },
            // --- END OF FIX ---
          },
        },
        {
          $addFields: {
            e1rm: {
              $multiply: ["$weight", { $add: [1, { $divide: ["$reps", 30] }] }],
            },
          },
        },
        { $group: { _id: null, maxE1RM: { $max: "$e1rm" } } },
      ]);

      const previousBestE1RM =
        historicalBests.length > 0 ? historicalBests[0].maxE1RM : 0;

      return newE1RM > previousBestE1RM + 0.01;
    }
  } catch (error) {
    // We now log the specific error for better debugging in the future
    console.error(
      `Error checking for PR for exercise "${exerciseName}":`,
      error
    );
    return false;
  }
};

module.exports = {
  gameConfig: config,
  checkAndApplyLevelUp,
  checkForPR,
};
