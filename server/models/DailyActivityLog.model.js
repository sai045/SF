const mongoose = require("mongoose");

// Sub-schema for an ingredient logged by the user
const loggedIngredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    weightInGrams: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema for a specific meal (e.g., Breakfast)
const loggedMealSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ["Pre-Workout", "Breakfast", "Lunch", "Dinner", "Snacks"],
      required: true,
    },
    ingredients: [loggedIngredientSchema],
  },
  { _id: false }
);

const dailyActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true, index: true },
    mealsLogged: [loggedMealSchema],
    steps: {
      count: { type: Number, default: 0 },
      goal: { type: Number, default: 8000 },
      expGained: { type: Number, default: 0 },
    },
    sleep: {
      duration: { type: Number, default: 0 },
      quality: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"] },
      expGained: { type: Number, default: 0 },
    },
    calorieBalance: {
      caloriesIn: { type: Number, default: 0 },
      caloriesOut: { type: Number, default: 0 },
      finalBalance: { type: Number, default: 0 },
      isFinalized: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "date"] }],
  }
);

module.exports = mongoose.model("DailyActivityLog", dailyActivityLogSchema);
