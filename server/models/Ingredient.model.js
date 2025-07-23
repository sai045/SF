const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  calories_per_100g: { type: Number, required: true },
  protein_per_100g: { type: Number, required: true },
  carbs_per_100g: { type: Number, required: true },
  fats_per_100g: { type: Number, required: true },
  category: {
    type: String,
    enum: [
      "Produce",
      "Meat",
      "Poultry",
      "Fish",
      "Dairy",
      "Grains",
      "Pantry",
      "Snacks",
      "Other",
    ],
    default: "Other",
  },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
