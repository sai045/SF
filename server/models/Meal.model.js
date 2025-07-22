const mongoose = require("mongoose");

// This model is for Meal TEMPLATES, e.g., "High Protein Breakfast"
const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  templateType: String, // e.g., "Breakfast", "Lunch", "Keto"
  ingredients: [
    {
      name: String,
      quantity: String, // e.g., "100g", "1 cup"

      // --- ADD THIS FIELD ---
      category: { type: String, trim: true }, // e.g., 'Produce', 'Dairy', 'Meat', 'Pantry'
      // --- END ADDITION ---

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
