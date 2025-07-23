const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });

const connectDB = require("../config/db");
const User = require("../models/User.model");
const Workout = require("../models/Workout.model");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const Meal = require("../models/Meal.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");
const Ingredient = require("../models/Ingredient.model");

// =================================================================
// 🥘 INGREDIENT DATA
// =================================================================
const seedIngredients = [
  {
    name: "Chicken Breast",
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fats_per_100g: 3.6,
    category: "Poultry",
    isVerified: true,
  },
  {
    name: "Soya Chunks (Dry)",
    calories_per_100g: 345,
    protein_per_100g: 52,
    carbs_per_100g: 33,
    fats_per_100g: 0.5,
    category: "Pantry",
    isVerified: true,
  },
  {
    name: "Whole Wheat Flour",
    calories_per_100g: 340,
    protein_per_100g: 13,
    carbs_per_100g: 72,
    fats_per_100g: 1.9,
    category: "Grains",
    isVerified: true,
  },
  {
    name: "Plain Curd/Yogurt",
    calories_per_100g: 98,
    protein_per_100g: 3,
    carbs_per_100g: 4,
    fats_per_100g: 5,
    category: "Dairy",
    isVerified: true,
  },
  {
    name: "Egg (Large)",
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fats_per_100g: 11,
    category: "Protein",
    isVerified: true,
  },
  {
    name: "Banana",
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fats_per_100g: 0.3,
    category: "Produce",
    isVerified: true,
  },
  {
    name: "Oats (Rolled)",
    calories_per_100g: 389,
    protein_per_100g: 16.9,
    carbs_per_100g: 66,
    fats_per_100g: 6.9,
    category: "Grains",
    isVerified: true,
  },
  {
    name: "Peanut Butter",
    calories_per_100g: 588,
    protein_per_100g: 25,
    carbs_per_100g: 20,
    fats_per_100g: 50,
    category: "Pantry",
    isVerified: true,
  },
  {
    name: "Skimmed Milk",
    calories_per_100g: 34,
    protein_per_100g: 3.4,
    carbs_per_100g: 5,
    fats_per_100g: 0.1,
    category: "Dairy",
    isVerified: true,
  },
  {
    name: "Sattu Powder",
    calories_per_100g: 413,
    protein_per_100g: 20,
    carbs_per_100g: 65,
    fats_per_100g: 6,
    category: "Pantry",
    isVerified: true,
  },
  {
    name: "Brown Rice (Cooked)",
    calories_per_100g: 123,
    protein_per_100g: 2.7,
    carbs_per_100g: 26,
    fats_per_100g: 0.9,
    category: "Grains",
    isVerified: true,
  },
  {
    name: "Olive Oil",
    calories_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fats_per_100g: 100,
    category: "Pantry",
    isVerified: true,
  },
];

// =================================================================
// 🍲 MEAL TEMPLATE DATA
// =================================================================
const seedMeals = [
  {
    name: "Pre-Workout Fuel",
    templateType: "Pre-Workout",
    ingredients: [
      {
        name: "Sattu Pindi",
        quantity: "40g",
        category: "Pantry",
        calories: 155,
        protein: 10.4,
        carbs: 22,
        fats: 3,
      },
      {
        name: "Banana",
        quantity: "1 medium",
        category: "Produce",
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fats: 0.4,
      },
    ],
    totalCalories: 260,
    totalProtein: 11.7,
    totalCarbs: 49,
    totalFats: 3.4,
  },
  {
    name: "High Protein Breakfast",
    templateType: "Breakfast",
    ingredients: [
      {
        name: "Slim Milk",
        quantity: "330g",
        category: "Dairy",
        calories: 115,
        protein: 11.55,
        carbs: 16,
        fats: 0.5,
      },
      {
        name: "Peanut Butter",
        quantity: "30g",
        category: "Pantry",
        calories: 180,
        protein: 8.49,
        carbs: 6,
        fats: 15,
      },
      {
        name: "Oats",
        quantity: "45g",
        category: "Pantry",
        calories: 170,
        protein: 4.9,
        carbs: 30,
        fats: 3,
      },
    ],
    totalCalories: 465,
    totalProtein: 24.94,
    totalCarbs: 52,
    totalFats: 18.5,
  },
];

// =================================================================
// 🏋️ WORKOUT TEMPLATE DATA
// =================================================================
const seedWorkouts = [
  {
    name: "Day 1: Upper Body + Core",
    type: "Template",
    muscleGroups: ["Upper Body", "Core"],
    estimatedDuration: 60,
    exercises: [
      { name: "Dumbbell Bench Press", sets: 3, reps: "8-12", rest: 60 },
      { name: "Overhead Press", sets: 3, reps: "8-12", rest: 60 },
      { name: "Bent-Over Rows", sets: 3, reps: "8-12", rest: 60 },
      { name: "Bicep Curls", sets: 3, reps: "10-15", rest: 45 },
      {
        name: "Plank",
        sets: 3,
        reps: "60s",
        rest: 30,
        isSupersetWithNext: true,
      },
      { name: "Leg Raises", sets: 3, reps: "15-20", rest: 60 },
    ],
  },
  {
    name: "Day 2: HIIT + LISS",
    type: "Template",
    muscleGroups: ["Cardio", "HIIT"],
    estimatedDuration: 80,
    exercises: [
      { name: "HIIT Session", sets: 1, reps: "25min intervals", rest: 0 },
      { name: "LISS: Incline Walking", sets: 1, reps: "55min steady", rest: 0 },
    ],
  },
  {
    name: "Day 3: Lower Body + Core",
    type: "Template",
    muscleGroups: ["Lower Body", "Core"],
    estimatedDuration: 60,
    exercises: [
      { name: "Goblet Squats", sets: 4, reps: "10-12", rest: 60 },
      { name: "Romanian Deadlifts", sets: 3, reps: "8-12", rest: 75 },
      { name: "Dumbbell Lunges", sets: 3, reps: "10 per leg", rest: 60 },
      {
        name: "Crunches",
        sets: 3,
        reps: "20-25",
        rest: 30,
        isSupersetWithNext: true,
      },
      { name: "Side Planks", sets: 3, reps: "30s per side", rest: 60 },
    ],
  },
  {
    name: "Day 4: LISS + Core",
    type: "Template",
    muscleGroups: ["Cardio", "Core"],
    estimatedDuration: 80,
    exercises: [
      { name: "LISS: Steady Cardio", sets: 1, reps: "55min", rest: 0 },
      { name: "Reverse Crunches", sets: 3, reps: "15-20", rest: 45 },
      { name: "Bird Dog", sets: 3, reps: "12 per side", rest: 45 },
      { name: "Core Circuit", sets: 1, reps: "25min", rest: 0 },
    ],
  },
  {
    name: "Day 5: Full Body + HIIT (Boss Battle)",
    type: "Boss Battle",
    muscleGroups: ["Full Body", "HIIT"],
    estimatedDuration: 75,
    exercises: [
      { name: "Barbell Squats", sets: 3, reps: "8-10", rest: 90 },
      { name: "Push Press", sets: 3, reps: "8-10", rest: 90 },
      { name: "Pull-ups", sets: 3, reps: "AMRAP", rest: 90 },
      { name: "HIIT Finisher", sets: 1, reps: "30min session", rest: 0 },
    ],
  },
  {
    name: "Day 6: Strength + LISS",
    type: "Template",
    muscleGroups: ["Strength", "Cardio"],
    estimatedDuration: 85,
    exercises: [
      { name: "Main Lift: Bench Press", sets: 5, reps: "5", rest: 120 },
      { name: "Accessory Lift 1", sets: 3, reps: "10-12", rest: 60 },
      { name: "Accessory Lift 2", sets: 3, reps: "10-12", rest: 60 },
      { name: "LISS: Recovery Walk", sets: 1, reps: "25min", rest: 0 },
    ],
  },
  {
    name: "Day 7: Active Recovery",
    type: "Template",
    muscleGroups: ["Recovery", "Flexibility"],
    estimatedDuration: 100,
    exercises: [
      { name: "LISS: Long Walk", sets: 1, reps: "80min", rest: 0 },
      { name: "Full Body Stretching", sets: 1, reps: "20 min", rest: 0 },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("[System] Purging old data...");
    await User.deleteMany({});
    await Workout.deleteMany({});
    await WeeklyWorkoutPlan.deleteMany({});
    await Meal.deleteMany({});
    await WeeklyMealPlan.deleteMany({});
    await Ingredient.deleteMany({});
    await ExerciseLog.deleteMany({});
    await MealLog.deleteMany({});
    await DailyActivityLog.deleteMany({});

    console.log("[System] Seeding new data...");
    await Ingredient.insertMany(seedIngredients);
    const createdMeals = await Meal.insertMany(seedMeals);
    const createdWorkouts = await Workout.insertMany(seedWorkouts);

    // --- Create a Default Weekly Workout Plan ---
    const defaultWorkoutPlan = await WeeklyWorkoutPlan.create({
      planName: "Hunter's Standard Week",
      userId: null,
      days: {
        monday: createdWorkouts.find((w) => w.name.includes("Day 1"))._id,
        tuesday: createdWorkouts.find((w) => w.name.includes("Day 2"))._id,
        wednesday: createdWorkouts.find((w) => w.name.includes("Day 3"))._id,
        thursday: createdWorkouts.find((w) => w.name.includes("Day 4"))._id,
        friday: createdWorkouts.find((w) => w.name.includes("Day 5"))._id,
        saturday: createdWorkouts.find((w) => w.name.includes("Day 6"))._id,
        sunday: createdWorkouts.find((w) => w.name.includes("Day 7"))._id,
      },
    });

    // --- Create a Default Weekly Meal Plan (from templates) ---
    const breakfastMeal = createdMeals.find(
      (m) => m.templateType === "Breakfast"
    )._id;
    const preWorkoutMeal = createdMeals.find(
      (m) => m.templateType === "Pre-Workout"
    )._id;

    const repeatedDailyPlan = {
      breakfast: breakfastMeal,
      // These would be custom logged by the user, so we leave them null in the template
      lunch: null,
      dinner: null,
      snacks: [preWorkoutMeal],
    };

    const defaultMealPlan = await WeeklyMealPlan.create({
      userId: null,
      weekStartDate: new Date(),
      days: {
        monday: repeatedDailyPlan,
        tuesday: repeatedDailyPlan,
        wednesday: repeatedDailyPlan,
        thursday: repeatedDailyPlan,
        friday: repeatedDailyPlan,
        saturday: repeatedDailyPlan,
        sunday: repeatedDailyPlan,
      },
    });

    console.log("[System] Seeding complete! Database is ready.");
  } catch (error) {
    console.error("Error while seeding database:", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log("[System] Database connection closed.");
  }
};

seedDatabase();
