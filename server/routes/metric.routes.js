const express = require("express");
const router = express.Router();
const {
  logBodyMetric,
  getBodyMetricsHistory,
} = require("../controllers/metric.controller");
const { protect } = require("../middleware/auth.middleware");

router
  .route("/")
  .post(protect, logBodyMetric)
  .get(protect, getBodyMetricsHistory);

module.exports = router;
