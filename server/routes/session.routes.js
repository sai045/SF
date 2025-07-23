const express = require("express");
const router = express.Router();
const {
  startWorkoutSession,
  getWorkoutSession,
  updateWorkoutSession,
  finishWorkoutSession,
} = require("../controllers/session.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/start", protect, startWorkoutSession);
router.get("/:sessionId", protect, getWorkoutSession);
router.put("/:sessionId", protect, updateWorkoutSession);
router.post("/:sessionId/finish", protect, finishWorkoutSession);

module.exports = router;
