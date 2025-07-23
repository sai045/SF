const User = require("../models/User.model");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { gameConfig } = require("../utils/gamification");
const { calculateBMR } = require("../utils/fitnessCalculator");

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
    res
      .status(500)
      .json({
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
      res
        .status(400)
        .json({
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
    res
      .status(500)
      .json({
        message: "Server error updating profile.",
        error: error.message,
      });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
