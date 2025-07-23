const express = require("express");
const router = express.Router();
const {
  logSteps,
  getTodaysActivityLog,
  updateMealInLog,
} = require("../controllers/activity.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/steps", protect, logSteps);
router.get("/today", protect, getTodaysActivityLog);
router.post("/meals", protect, updateMealInLog);

module.exports = router;
