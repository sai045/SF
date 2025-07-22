const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { gameConfig } = require("../utils/gamification");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");

// --- Helper to generate JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new Hunter
// @route   POST /api/users/register
// @access  Public
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultWorkoutPlan = await WeeklyWorkoutPlan.findOne({
      userId: null,
    });
    const defaultMealPlan = await WeeklyMealPlan.findOne({ userId: null });

    // Create the user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      expToNextLevel: gameConfig.LEVEL_UP_FORMULA(1), // Set initial EXP goal
      activeWorkoutPlan: defaultWorkoutPlan ? defaultWorkoutPlan._id : null,
      activeMealPlan: defaultMealPlan ? defaultMealPlan._id : null,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        rank: user.rank,
        token: generateToken(user._id),
        message: `[System] Welcome, ${user.username}. You are now a registered Hunter.`,
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

// @desc    Authenticate a Hunter & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        rank: user.rank,
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

// @desc    Get current Hunter's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is populated by the 'protect' middleware
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
