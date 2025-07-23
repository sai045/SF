const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  templateType: String, // e.g., "Breakfast", "Lunch", "Keto"
  ingredients: [
    {
      name: String,
      quantity: String, // e.g., "100g", "1 cup"
      category: { type: String, trim: true },
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
    },
  ],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for admin or custom
});

module.exports = mongoose.model("Meal", mealSchema);
