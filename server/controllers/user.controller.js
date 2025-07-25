const User = require("../models/User.model");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { gameConfig } = require("../utils/gamification");
const { calculateBMR } = require("../utils/fitnessCalculator");
const WorkoutLog = require("../models/WorkoutLog.model");
const ExerciseLog = require("../models/ExerciseLog.model");
const { ALL_ACHIEVEMENTS } = require("../utils/achievements");
const mongoose = require("mongoose");
const { subDays, isSameDay } = require("date-fns");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "A Hunter with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultWorkoutPlan = await WeeklyWorkoutPlan.findOne({
      userId: null,
    });
    const defaultMealPlan = await WeeklyMealPlan.findOne({ userId: null });

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      expToNextLevel: gameConfig.LEVEL_UP_FORMULA(1),
      activeWorkoutPlan: defaultWorkoutPlan ? defaultWorkoutPlan._id : null,
      activeMealPlan: defaultMealPlan ? defaultMealPlan._id : null,
    });

    if (user) {
      const userResponse = await User.findById(user._id).select("-password");
      res.status(201).json({
        ...userResponse.toObject(),
        token: generateToken(user._id),
        message: `[System] Welcome, ${user.username}. Your default plans have been assigned.`,
      });
    } else {
      res.status(400).json({ message: "Invalid user data." });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const userResponse = await User.findById(user._id).select("-password");
      res.json({
        ...userResponse.toObject(),
        token: generateToken(user._id),
        message: `[System] Welcome back, Hunter ${user.username}.`,
      });
    } else {
      res.status(400).json({
        message: "Invalid credentials. Check your email or password.",
      });
    }
  } catch (error) {
    console.error("Error during user login:", error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  res.json(req.user);
};

const updateUserProfile = async (req, res) => {
  try {
    const { gender, age, height_cm, weight_kg } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.physicalMetrics) user.physicalMetrics = {};

    user.physicalMetrics.gender = gender ?? user.physicalMetrics.gender;
    user.physicalMetrics.age = age ?? user.physicalMetrics.age;
    user.physicalMetrics.height_cm =
      height_cm ?? user.physicalMetrics.height_cm;
    user.physicalMetrics.weight_kg =
      weight_kg ?? user.physicalMetrics.weight_kg;

    user.physicalMetrics.bmr = calculateBMR(
      user.physicalMetrics.gender,
      user.physicalMetrics.weight_kg,
      user.physicalMetrics.height_cm,
      user.physicalMetrics.age
    );

    const updatedUser = await user.save();
    const responseUser = await User.findById(updatedUser._id).select(
      "-password"
    );

    res.json(responseUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Server error updating profile.",
      error: error.message,
    });
  }
};

// @desc    Get aggregated stats for the user's profile page
// @route   GET /api/users/profile/stats
// @access  Private
const getProfileStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const recentWorkouts = await WorkoutLog.find({ userId }).sort({ date: -1 });
    let workoutStreak = 0;
    if (recentWorkouts.length > 0) {
      const today = new Date();
      const yesterday = subDays(today, 1);
      let lastWorkoutDate = new Date(recentWorkouts[0].date);

      if (
        isSameDay(today, lastWorkoutDate) ||
        isSameDay(yesterday, lastWorkoutDate)
      ) {
        workoutStreak = 1;
        let currentDate = lastWorkoutDate;
        for (let i = 1; i < recentWorkouts.length; i++) {
          const previousDate = subDays(currentDate, 1);
          const nextWorkoutDate = new Date(recentWorkouts[i].date);
          if (isSameDay(previousDate, nextWorkoutDate)) {
            workoutStreak++;
            currentDate = nextWorkoutDate;
          } else if (!isSameDay(currentDate, nextWorkoutDate)) {
            // Break if the next log isn't on the same day or the day before
            break;
          }
        }
      }
    }

    const totalWorkouts = recentWorkouts.length;

    // --- START OF THE NEW LOGIC: JAVASCRIPT AGGREGATION ---

    // 1. Fetch ALL exercise logs for the user.
    const allExerciseLogs = await ExerciseLog.find({ userId });

    let totalVolume = 0;
    const bestSets = {}; // Use a map to track the best set for each exercise

    // 2. Loop through all logs in the application layer.
    for (const log of allExerciseLogs) {
      // Safely parse weight and reps
      const weight = parseFloat(log.weight);
      const reps = parseInt(log.reps, 10);

      // Check if both are valid numbers. This correctly filters out cardio/timed logs.
      if (!isNaN(weight) && !isNaN(reps)) {
        // A. Calculate Total Volume
        totalVolume += weight * reps;

        // B. Calculate e1RM and check for Top PRs
        const e1rm = weight * (1 + reps / 30);

        // If we haven't seen this exercise before, or if this set is better, update it.
        if (
          !bestSets[log.exerciseName] ||
          e1rm > bestSets[log.exerciseName].e1rm
        ) {
          bestSets[log.exerciseName] = {
            exerciseName: log.exerciseName,
            weight: weight,
            reps: reps,
            e1rm: e1rm,
          };
        }
      }
    }

    // 3. Sort the best sets to find the top 5 PRs
    const topPRs = Object.values(bestSets)
      .sort((a, b) => b.e1rm - a.e1rm)
      .slice(0, 5);

    const stats = {
      totalWorkouts,
      totalVolume: totalVolume,
      workoutStreak: workoutStreak,
      topPRs: topPRs,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    res.status(500).json({ message: "Server error fetching profile stats." });
  }
};

// @desc    Get all achievements, marking which are unlocked
// @route   GET /api/users/achievements
// @access  Private
const getAchievements = async (req, res) => {
  try {
    const user = req.user;
    const unlockedKeys = new Set(user.unlockedAchievements.map((a) => a.key));

    const allAchievements = Object.entries(ALL_ACHIEVEMENTS).map(
      ([key, value]) => ({
        key,
        ...value,
        isUnlocked: unlockedKeys.has(key),
      })
    );

    res.json(allAchievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({
      message: "Server error fetching achievements.",
      error: error.message,
    });
  }
};

// @desc    Set the user's active title
// @route   PUT /api/users/profile/title
// @access  Private
const setActiveTitle = async (req, res) => {
  try {
    const { titleKey } = req.body;
    const user = req.user;

    // Check if the title exists and is a title
    const achievement = ALL_ACHIEVEMENTS[titleKey];
    if (!achievement || !achievement.isTitle) {
      return res.status(400).json({ message: "Invalid title." });
    }

    // Check if the user has unlocked this title
    if (!user.unlockedAchievements.some((a) => a.key === titleKey)) {
      return res
        .status(403)
        .json({ message: "You have not unlocked this title." });
    }

    user.title = achievement.name;
    await user.save();

    // Send back the full user object so the frontend context can update
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error("Error setting active title:", error);
    res.status(500).json({
      message: "Server error setting active title.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getProfileStats,
  getAchievements,
  setActiveTitle,
};
