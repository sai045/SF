const express = require("express");
const router = express.Router();
const { logWorkout, getWorkoutById } = require("../controllers/workout.controller");
const { protect } = require("../middleware/auth.middleware");

// All workout routes will be protected
router.post("/log", protect, logWorkout);
router.get("/:id", protect, getWorkoutById);

module.exports = router;
