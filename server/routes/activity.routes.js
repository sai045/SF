const express = require("express");
const router = express.Router();
const {
  logSteps,
  getTodaysActivityLog,
  updateMealInLog,
  getHistoricalSummary
} = require("../controllers/activity.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/steps", protect, logSteps);
router.get("/today", protect, getTodaysActivityLog);
router.post("/meals", protect, updateMealInLog);
router.get('/history', protect, getHistoricalSummary);

module.exports = router;
