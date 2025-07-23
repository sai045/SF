const express = require("express");
const router = express.Router();
const { logSteps } = require("../controllers/activity.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/steps", protect, logSteps);

module.exports = router;
