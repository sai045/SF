const express = require("express");
const router = express.Router();
const {
  getTodaysMealPlan,
  logMeal,
  searchIngredients,
  logCustomMeal,
  getMealTemplates,
  getMealTemplateById,
  prepareTemplateForLogging,
} = require("../controllers/meal.controller");
const { protect } = require("../middleware/auth.middleware");

// Route to get today's plan based on templates
router.get("/plan/today", protect, getTodaysMealPlan);
// Route to log a pre-defined template meal (legacy or quick-add)
router.post("/log", protect, logMeal);

// --- Routes for advanced ingredient-based logging ---
router.get("/ingredients/search", protect, searchIngredients);
router.post("/log_custom", protect, logCustomMeal);
router.get("/templates", protect, getMealTemplates);
router.get("/templates/:id", protect, getMealTemplateById);
router.post("/templates/prepare", protect, prepareTemplateForLogging);

module.exports = router;
