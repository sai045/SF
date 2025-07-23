const express = require("express");
const router = express.Router();
const {
  logWorkout,
  getWorkoutById,
  getExerciseHistory,
  getWorkoutHistoryList,
  getWorkoutLogDetails,
  createCustomWorkout,
  getMyWorkouts,
} = require("../controllers/workout.controller");
const { protect } = require("../middleware/auth.middleware");

// Log a completed workout session
router.post("/log", protect, logWorkout);

// Get a single workout template by its ID
router.get("/:id", protect, getWorkoutById);

// Get the last performance for a specific exercise for PR comparison
router.get("/history/:exerciseName", protect, getExerciseHistory);
router.get("/history/all", protect, getWorkoutHistoryList);
router.get("/history/log/:logId", protect, getWorkoutLogDetails);
router
  .route("/custom")
  .post(protect, createCustomWorkout)
  .get(protect, getMyWorkouts);
router.get("/custom/master-list", protect, getMasterExerciseList);

module.exports = router;
