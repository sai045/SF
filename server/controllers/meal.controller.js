const User = require("../models/User.model");
const MealLog = require("../models/MealLog.model");
const Meal = require("../models/Meal.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");
const Ingredient = require("../models/Ingredient.model");
const { gameConfig, checkAndApplyLevelUp } = require("../utils/gamification");

// @desc    Get the user's detailed meal plan for today from templates
// @route   GET /api/meals/plan/today
// @access  Private
const getTodaysMealPlan = async (req, res) => {
  // This function can remain as a way to see "suggested" meals, even if logging is custom.
  // For now, we will focus on custom logging. A future feature could be to "quick-add" from this.
  res
    .status(200)
    .json({ message: "Endpoint for template plans. Use custom logger." });
};

// @desc    Log that a user has eaten a predefined meal template (legacy or quick-add)
// @route   POST /api/meals/log
// @access  Private
const logMeal = async (req, res) => {
  // This can be adapted for a "quick-add" feature in the future
  res.status(400).json({
    message: "This route is for template logging. Please use /log_custom.",
  });
};

// @desc    Search for ingredients in the master database
// @route   GET /api/meals/ingredients/search?q=chicken
// @access  Private
const searchIngredients = async (req, res) => {
  try {
    const query = req.query.q || "";
    const ingredients = await Ingredient.find({
      name: { $regex: query, $options: "i" },
    }).limit(20);

    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: "Server error searching ingredients." });
  }
};

// @desc    Log a custom meal made of ingredients
// @route   POST /api/meals/log_custom
// @access  Private
const logCustomMeal = async (req, res) => {
  const { mealType, loggedIngredients } = req.body;
  const userId = req.user.id;

  if (!mealType || !loggedIngredients || loggedIngredients.length === 0) {
    return res
      .status(400)
      .json({ message: "Meal type and ingredients are required." });
  }

  try {
    let totalCalories = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFats = 0;

    const ingredientIds = loggedIngredients.map((ing) => ing.ingredientId);
    const ingredientDocs = await Ingredient.find({
      _id: { $in: ingredientIds },
    });
    const ingredientMap = new Map(
      ingredientDocs.map((i) => [i._id.toString(), i])
    );

    for (const loggedIng of loggedIngredients) {
      const masterIng = ingredientMap.get(loggedIng.ingredientId);
      if (!masterIng) continue;

      const weightMultiplier = loggedIng.weightInGrams / 100;
      totalCalories += masterIng.calories_per_100g * weightMultiplier;
      totalProtein += masterIng.protein_per_100g * weightMultiplier;
      totalCarbs += masterIng.carbs_per_100g * weightMultiplier;
      totalFats += masterIng.fats_per_100g * weightMultiplier;
    }

    const expGained =
      gameConfig.EXP.MEAL_LOGGED +
      loggedIngredients.length * gameConfig.EXP.INGREDIENT_BONUS;

    const newLog = await MealLog.create({
      userId,
      mealType,
      loggedIngredients,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      expGained,
    });

    const user = await User.findById(userId);
    user.exp += expGained;
    const updatedUser = await checkAndApplyLevelUp(user._id);

    res.status(201).json({
      message: `[System] ${mealType} logged successfully! +${expGained} EXP.`,
      log: newLog,
      updatedUserStatus: {
        level: updatedUser.level,
        exp: updatedUser.exp,
        expToNextLevel: updatedUser.expToNextLevel,
        rank: updatedUser.rank,
      },
    });
  } catch (error) {
    console.error("Error logging custom meal:", error);
    res.status(500).json({ message: "Server error while logging meal." });
  }
};

// @desc    Get all meal templates
// @route   GET /api/meals/templates
const getMealTemplates = async (req, res) => {
  try {
    // Fetch templates created by admin (createdBy: null) or the user
    const templates = await Meal.find({
      $or: [{ createdBy: null }, { createdBy: req.user.id }],
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching meal templates" });
  }
};

// @desc    Get a single meal template with ingredients
// @route   GET /api/meals/templates/:id
const getMealTemplateById = async (req, res) => {
  try {
    const template = await Meal.findById(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: "Error fetching template" });
  }
};

// @desc    Prepares a meal template's ingredients for logging
// @route   POST /api/meals/templates/prepare
const prepareTemplateForLogging = async (req, res) => {
  const { templateId } = req.body;
  try {
    const template = await Meal.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    // Get all ingredient names from the template
    const ingredientNames = template.ingredients.map((ing) => ing.name);

    // Find the corresponding master Ingredient documents
    const masterIngredients = await Ingredient.find({
      name: { $in: ingredientNames },
    });
    const masterIngredientMap = new Map(
      masterIngredients.map((i) => [i.name, i])
    );

    // Build the response payload for the meal logger
    const preparedIngredients = template.ingredients
      .map((templateIng) => {
        const masterIng = masterIngredientMap.get(templateIng.name);
        if (!masterIng) return null; // Ingredient not found in master list

        // We need to parse the quantity string (e.g., "30g") to a number
        const weightInGrams =
          parseInt(templateIng.quantity.replace("g", ""), 10) || 100;

        return {
          ingredientId: masterIng._id,
          name: masterIng.name,
          weightInGrams: weightInGrams,
          // Pass full nutritional data for live calculation on the frontend
          ...masterIng.toObject(),
        };
      })
      .filter(Boolean); // Filter out any nulls

    res.json(preparedIngredients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error preparing template", error: error.message });
  }
};

module.exports = {
  getTodaysMealPlan,
  logMeal,
  searchIngredients,
  getMealTemplates,
  getMealTemplateById,
  logCustomMeal,
  prepareTemplateForLogging,
};
