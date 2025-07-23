const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  checkinHabit,
} = require("../controllers/habit.controller");
const { protect } = require("../middleware/auth.middleware");

router.route("/").get(protect, getHabits).post(protect, createHabit);

router.post("/:habitId/checkin", protect, checkinHabit);

module.exports = router;
