const User = require("../models/User.model");
const WorkoutLog = require("../models/WorkoutLog.model");
const ExerciseLog = require("../models/ExerciseLog.model");

// --- Master List of All Achievements ---
const ALL_ACHIEVEMENTS = {
  // Workout Count Achievements
  WORKOUT_LOG_1: {
    name: "First Step",
    description: "Complete your first workout.",
  },
  WORKOUT_LOG_10: {
    name: "Novice Lifter",
    description: "Complete 10 workouts.",
  },
  WORKOUT_LOG_50: {
    name: "Adept Lifter",
    description: "Complete 50 workouts.",
  },

  // PR Achievements
  PR_HIT_1: {
    name: "Breaking the Limit",
    description: "Hit your first Personal Record.",
  },
  BENCH_100KG: {
    name: "Bench Master",
    description: "Achieve an estimated 1-Rep Max of 100kg on a Bench Press.",
  },

  // Streak Achievements
  STREAK_7_WORKOUT: {
    name: "Week Warrior",
    description: "Maintain a 7-day workout streak.",
  },

  // Titles are just special achievements
  TITLE_PUSHUP_GOD: {
    name: "Pushup God",
    description: "Perform 100 push-ups in a single session.",
    isTitle: true,
  },
};

/**
 * Checks if an achievement has already been unlocked by the user.
 * @param {object} user - The user document.
 * @param {string} key - The achievement key.
 * @returns {boolean}
 */
const hasUnlocked = (user, key) => {
  return user.unlockedAchievements.some((ach) => ach.key === key);
};

/**
 * The main function to check and award achievements after an action.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action (e.g., 'WORKOUT_LOGGED', 'PR_HIT').
 * @param {object} data - Optional data related to the action (e.g., workoutLog, exerciseLog).
 */
const checkAchievements = async (userId, actionType, data = {}) => {
  const user = await User.findById(userId);
  if (!user) return;

  let newAchievements = [];

  // --- Rule Engine ---
  if (actionType === "WORKOUT_LOGGED") {
    const workoutCount = await WorkoutLog.countDocuments({ userId });

    if (workoutCount >= 1 && !hasUnlocked(user, "WORKOUT_LOG_1"))
      newAchievements.push("WORKOUT_LOG_1");
    if (workoutCount >= 10 && !hasUnlocked(user, "WORKOUT_LOG_10"))
      newAchievements.push("WORKOUT_LOG_10");
    if (workoutCount >= 50 && !hasUnlocked(user, "WORKOUT_LOG_50"))
      newAchievements.push("WORKOUT_LOG_50");

    // Example for a specific achievement like "Pushup God"
    const pushupsInSession = data.setsLogged
      .filter((s) => s.exerciseName.toLowerCase().includes("push-up"))
      .reduce((acc, set) => acc + parseInt(set.reps, 10), 0);
    if (pushupsInSession >= 100 && !hasUnlocked(user, "TITLE_PUSHUP_GOD"))
      newAchievements.push("TITLE_PUSHUP_GOD");
  }

  if (actionType === "PR_HIT") {
    if (!hasUnlocked(user, "PR_HIT_1")) newAchievements.push("PR_HIT_1");

    // Example for a specific PR
    if (
      data.exerciseName.toLowerCase().includes("bench") &&
      data.e1rm >= 100 &&
      !hasUnlocked(user, "BENCH_100KG")
    ) {
      newAchievements.push("BENCH_100KG");
    }
  }

  // --- Grant New Achievements ---
  if (newAchievements.length > 0) {
    newAchievements.forEach((key) => {
      const achievementData = ALL_ACHIEVEMENTS[key];
      if (achievementData) {
        user.unlockedAchievements.push({
          key: key,
          name: achievementData.name,
        });
      }
    });
    await user.save();
    console.log(
      `[Achievements] User ${user.username} unlocked: ${newAchievements.join(
        ", "
      )}`
    );
  }
};

module.exports = {
  ALL_ACHIEVEMENTS,
  checkAchievements,
};
