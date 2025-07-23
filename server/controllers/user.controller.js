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
    const userId = req.user._id;

    // 1. Get total workouts completed from WorkoutLog
    const totalWorkouts = await WorkoutLog.countDocuments({ userId });

    // 2. Aggregate total volume lifted and top PRs from ExerciseLog
    const exerciseStats = await ExerciseLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $addFields: {
          // Calculate e1RM for each set
          e1rm: {
            $multiply: ["$weight", { $add: [1, { $divide: ["$reps", 30] }] }],
          },
        },
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalVolume: { $sum: { $multiply: ["$weight", "$reps"] } },
        },
      },
    ]);

    // 3. Get best PRs (e.g., top 5 by e1RM)
    const topPRs = await ExerciseLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $addFields: {
          e1rm: {
            $multiply: ["$weight", { $add: [1, { $divide: ["$reps", 30] }] }],
          },
        },
      },
      // Find the best set for each exercise
      { $sort: { e1rm: -1 } },
      {
        $group: {
          _id: "$exerciseName",
          bestSet: { $first: "$$ROOT" },
        },
      },
      // Sort the exercises by their best set's e1RM
      { $sort: { "bestSet.e1rm": -1 } },
      { $limit: 5 },
    ]);

    const stats = {
      totalWorkouts,
      totalVolume: exerciseStats[0]?.totalVolume || 0,
      topPRs: topPRs.map((pr) => ({
        exerciseName: pr._id,
        weight: pr.bestSet.weight,
        reps: pr.bestSet.reps,
        e1rm: pr.bestSet.e1rm,
      })),
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
};

// @desc    Set the user's active title
// @route   PUT /api/users/profile/title
// @access  Private
const setActiveTitle = async (req, res) => {
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
