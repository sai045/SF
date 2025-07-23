const mongoose = require("mongoose");

const loggedIngredientSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingredient",
    required: true,
  },
  weightInGrams: { type: Number, required: true },
});

const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loggedIngredients: [loggedIngredientSchema],
    date: { type: Date, default: Date.now },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],
      required: true,
    },
    totalCalories: { type: Number, required: true },
    totalProtein: { type: Number, required: true },
    totalCarbs: { type: Number, required: true },
    totalFats: { type: Number, required: true },
    expGained: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealLog", mealLogSchema);
