const mongoose = require("mongoose");

// Log of an actual eaten meal
const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" }, // Link to template if used
    customIngredients: String, // For logging food not from a template
    date: { type: Date, default: Date.now },
    mealTime: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    expGained: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealLog", mealLogSchema);
