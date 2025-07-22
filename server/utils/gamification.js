const User = require("../models/User.model");

const config = {
  EXP: {
    WORKOUT_COMPLETE_BASE: 100,
    BOSS_BATTLE_MULTIPLIER: 2.5,
    SET_LOGGED: 2,
    PR_BONUS: 25,
    MEAL_LOGGED: 15,
    MACRO_GOAL_HIT: 50,
    STEP_MILESTONE: 10, // Per 1000 steps
    SLEEP_BONUS: 40, // For 8+ hours
    HABIT_COMPLETED: 10,
  },
  // The famous "Solo Leveling" stat formula - makes leveling harder over time
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
  // Keep leveling up until current EXP is less than required EXP
  while (user.exp >= user.expToNextLevel) {
    hasLeveledUp = true;
    const remainingExp = user.exp - user.expToNextLevel;

    user.level += 1;
    user.exp = remainingExp;
    user.expToNextLevel = config.LEVEL_UP_FORMULA(user.level);

    // Check for Rank Up
    const newRank = Object.keys(config.RANK_THRESHOLDS)
      .reverse()
      .find((rank) => user.level >= config.RANK_THRESHOLDS[rank]);
    if (newRank && newRank !== user.rank) {
      user.rank = newRank;
      // You could add a notification here later
    }
  }

  if (hasLeveledUp) {
    await user.save();
  }

  // Return the latest user state
  return user;
};

module.exports = {
  gameConfig: config,
  checkAndApplyLevelUp,
};
