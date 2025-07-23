const mongoose = require("mongoose");
const User = require("../models/User.model");
const ExerciseLog = require("../models/ExerciseLog.model");
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

const checkForPR = async (userId, exerciseName, newWeight, newReps) => {
  try {
    const newE1RM = calculateE1RM(newWeight, newReps);

    const historicalBests = await ExerciseLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), exerciseName } },
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
  } catch (error) {
    console.error("Error checking for PR:", error);
    return false;
  }
};

module.exports = {
  gameConfig: config,
  checkAndApplyLevelUp,
  checkForPR,
};
