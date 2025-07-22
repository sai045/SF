const express = require("express");
const router = express.Router();
const { getTodaysPlan } = require("../controllers/planner.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/today", protect, getTodaysPlan);

module.exports = router;
