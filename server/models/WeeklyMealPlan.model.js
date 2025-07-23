const mongoose = require("mongoose");

const dailyPlanSchema = new mongoose.Schema(
  {
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
    snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],
  },
  { _id: false }
);

const weeklyMealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    weekStartDate: { type: Date, required: true },
    days: {
      monday: dailyPlanSchema,
      tuesday: dailyPlanSchema,
      wednesday: dailyPlanSchema,
      thursday: dailyPlanSchema,
      friday: dailyPlanSchema,
      saturday: dailyPlanSchema,
      sunday: dailyPlanSchema,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyMealPlan", weeklyMealPlanSchema);
