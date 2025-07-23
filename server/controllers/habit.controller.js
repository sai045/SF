const Habit = require("../models/Habit.model");
const User = require("../models/User.model");
const { gameConfig, checkAndApplyLevelUp } = require("../utils/gamification");
const { isSameDay } = require("date-fns"); // A helpful library for date comparisons

// @desc    Get all habits for the logged-in user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching habits." });
  }
};

// @desc    Create a new habit for the logged-in user
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Habit name is required." });
  }

  try {
    const newHabit = await Habit.create({
      userId: req.user.id,
      name,
    });
    res.status(201).json(newHabit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating habit." });
  }
};

// @desc    Check in a habit for the day, update streak, and grant EXP
// @route   POST /api/habits/:habitId/checkin
// @access  Private
const checkinHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);

    // Security check
    if (!habit || habit.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Habit not found." });
    }

    const today = new Date();

    // Prevent multiple check-ins on the same day
    if (habit.lastCompleted && isSameDay(today, habit.lastCompleted)) {
      return res
        .status(400)
        .json({ message: "Habit already completed today." });
    }

    // --- Update Streak ---
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (habit.lastCompleted && isSameDay(yesterday, habit.lastCompleted)) {
      // Continued the streak
      habit.streak += 1;
    } else {
      // Reset the streak
      habit.streak = 1;
    }

    habit.lastCompleted = today;
    await habit.save();

    // --- Grant EXP ---
    const user = await User.findById(req.user.id);
    const expGained = gameConfig.EXP.HABIT_COMPLETED + habit.streak; // Bonus EXP for longer streaks
    user.exp += expGained;
    const updatedUser = await checkAndApplyLevelUp(user._id);

    res.json({
      message: `Habit "${habit.name}" completed! +${expGained} EXP. Streak: ${habit.streak} days.`,
      habit,
      updatedUserStatus: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error checking in habit." });
  }
};

module.exports = {
  getHabits,
  createHabit,
  checkinHabit,
};
