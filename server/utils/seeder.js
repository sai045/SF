const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });

// Import ALL models
const connectDB = require("../config/db");
const User = require("../models/User.model");
const Workout = require("../models/Workout.model");
const WeeklyWorkoutPlan = require("../models/WeeklyWorkoutPlan.model");
const Meal = require("../models/Meal.model");
const WeeklyMealPlan = require("../models/WeeklyMealPlan.model");
const Ingredient = require("../models/Ingredient.model");
const ExerciseLog = require("../models/ExerciseLog.model");
const MealLog = require("../models/MealLog.model");
const DailyActivityLog = require("../models/DailyActivityLog.model");
const WorkoutSession = require("../models/WorkoutSession.model");
const MasterExercise = require("../models/MasterExercise.model");

// =================================================================
// 🥘 MASTER INGREDIENT DATABASE
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
    category: "Poultry",
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
];

// =================================================================
// 🍲 MEAL TEMPLATE DATABASE
// =================================================================
const seedMeals = [
  {
    name: "Pre-Workout Fuel",
    templateType: "Pre-Workout",
    ingredients: [
      { name: "Sattu Powder", quantity: "40g" },
      { name: "Banana", quantity: "1 medium" },
    ],
  },
  {
    name: "High Protein Breakfast",
    templateType: "Breakfast",
    ingredients: [
      { name: "Skimmed Milk", quantity: "330g" },
      { name: "Peanut Butter", quantity: "30g" },
      { name: "Oats (Rolled)", quantity: "45g" },
    ],
  },
  {
    name: "Power Lunch",
    templateType: "Lunch",
    ingredients: [
      { name: "Chicken Breast", quantity: "200g" },
      { name: "Soya Chunks (Dry)", quantity: "60g" },
      { name: "Whole Wheat Flour", quantity: "80g" },
      { name: "Plain Curd/Yogurt", quantity: "40g" },
    ],
  },
  {
    name: "Quick Snack",
    templateType: "Snacks",
    ingredients: [{ name: "Banana", quantity: "100g" }],
  },
  {
    name: "Protein-Packed Dinner",
    templateType: "Dinner",
    ingredients: [
      { name: "Egg (Large)", quantity: "400g" },
      { name: "Whole Wheat Flour", quantity: "20g" },
    ],
  },
];

// =================================================================
// 🏋️ MASTER EXERCISE DATABASE with MET Values
// =================================================================
const seedMasterExercises = [
  {
    name: "Treadmill Brisk Walk",
    metValue: 4.3,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "Jumping Jacks",
    metValue: 8.0,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "High Knees",
    metValue: 8.0,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "Dynamic Stretching",
    metValue: 3.0,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "Bodyweight Squats",
    metValue: 5.0,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "Leg Swings",
    metValue: 3.0,
    unit: "per_minute",
    category: "Warm-up",
  },
  {
    name: "Walking Lunges",
    metValue: 4.0,
    unit: "per_minute",
    category: "Warm-up",
  },

  {
    name: "Dumbbell Bench Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Dumbbell Overhead Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Bent-Over Rows (Dumbbell)",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Lat Pulldowns",
    metValue: 4.5,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Dumbbell Bicep Curls",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Triceps Pushdowns",
    metValue: 3.5,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Goblet Squats",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Romanian Deadlift (Dumbbell)",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Lunges",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Leg Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Push Press",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },
  {
    name: "Pull-ups",
    metValue: 8.0,
    unit: "per_rep_and_rest",
    category: "Strength",
  },

  { name: "Plank", metValue: 2.8, unit: "per_minute", category: "Core" },
  {
    name: "Leg Raises",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  {
    name: "Russian Twists",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  {
    name: "Crunches",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  {
    name: "Bicycle Crunches",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  { name: "Side Planks", metValue: 2.8, unit: "per_minute", category: "Core" },
  {
    name: "Reverse Crunches",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  {
    name: "Cable Crunches",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Core",
  },
  {
    name: "Bird Dog",
    metValue: 2.5,
    unit: "per_rep_and_rest",
    category: "Core",
  },

  {
    name: "HIIT Sprint (12 kmph)",
    metValue: 12.5,
    unit: "per_minute",
    category: "HIIT",
  },
  {
    name: "Active Recovery Walk (4 kmph)",
    metValue: 3.0,
    unit: "per_minute",
    category: "LISS",
  },
  {
    name: "LISS Brisk Walk (6 kmph, 2 incline)",
    metValue: 5.0,
    unit: "per_minute",
    category: "LISS",
  },
  { name: "Light Jog", metValue: 7.0, unit: "per_minute", category: "LISS" },

  {
    name: "Static Stretching",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
  },
];

// =================================================================
// 🏋️ WORKOUT TEMPLATE DATA
// =================================================================
const seedWorkouts = [
  {
    name: "Day 1: Strength A (Upper Body) + Core",
    type: "Template",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "5 min", rest: 0 },
      { name: "Dynamic Stretching", sets: 1, reps: "5 min", rest: 0 },
      { name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Overhead Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Bent-Over Rows (Dumbbell)", sets: 4, reps: "8-12", rest: 75 },
      { name: "Lat Pulldowns", sets: 3, reps: "10-15", rest: 60 },
      { name: "Dumbbell Bicep Curls", sets: 3, reps: "10-15", rest: 60 },
      { name: "Triceps Pushdowns", sets: 3, reps: "10-15", rest: 60 },
      { name: "Plank", sets: 3, reps: "60s", rest: 45 },
      { name: "Leg Raises", sets: 3, reps: "15-20", rest: 45 },
      { name: "Russian Twists", sets: 3, reps: "15-20 per side", rest: 45 },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 2: HIIT + LISS Cardio",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "HIIT Sprint (12 kmph)", sets: 8, reps: "60s", rest: 90 },
      { name: "Active Recovery Walk (4 kmph)", sets: 8, reps: "90s", rest: 0 },
      {
        name: "LISS Brisk Walk (6 kmph, 2 incline)",
        sets: 1,
        reps: "50 min",
        rest: 0,
      },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 3: Strength B (Lower Body) + Core",
    type: "Template",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "3 min", rest: 0 },
      { name: "Jumping Jacks", sets: 1, reps: "1 min", rest: 0 },
      { name: "Bodyweight Squats", sets: 1, reps: "12", rest: 15 },
      { name: "Leg Swings", sets: 1, reps: "12 each leg", rest: 15 },
      { name: "Goblet Squats", sets: 4, reps: "8-12", rest: 90 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 4, reps: "8-12", rest: 90 },
      { name: "Lunges", sets: 3, reps: "12 per leg", rest: 75 },
      { name: "Leg Press", sets: 3, reps: "10-15", rest: 75 },
      { name: "Crunches", sets: 3, reps: "20-25", rest: 45 },
      { name: "Bicycle Crunches", sets: 3, reps: "20 per side", rest: 45 },
      { name: "Side Planks", sets: 3, reps: "60s per side", rest: 45 },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 4: LISS (Extended) + Core",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      {
        name: "LISS Brisk Walk (6 kmph, 2 incline)",
        sets: 1,
        reps: "55 min",
        rest: 0,
      },
      { name: "Reverse Crunches", sets: 3, reps: "15-20", rest: 45 },
      { name: "Cable Crunches", sets: 3, reps: "15-20", rest: 45 },
      { name: "Bird Dog", sets: 3, reps: "12 per side", rest: 45 },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 5: Strength C (Full Body) + HIIT",
    type: "Boss Battle",
    exercises: [
      { name: "Jumping Jacks", sets: 1, reps: "3 min", rest: 0 },
      { name: "Dynamic Stretching", sets: 1, reps: "5 min", rest: 0 },
      { name: "Goblet Squats", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Bent-Over Rows (Dumbbell)", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Overhead Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "HIIT Sprint (12 kmph)", sets: 5, reps: "60s", rest: 90 },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 6: Strength Rotation + LISS",
    type: "Template",
    exercises: [
      { name: "Dynamic Stretching", sets: 1, reps: "10 min", rest: 0 },
      { name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Goblet Squats", sets: 4, reps: "8-12", rest: 75 },
      { name: "Bent-Over Rows (Dumbbell)", sets: 3, reps: "10-15", rest: 60 },
      {
        name: "LISS Brisk Walk (6 kmph, 2 incline)",
        sets: 1,
        reps: "25 min",
        rest: 0,
      },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
  {
    name: "Day 7: Active Recovery",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      {
        name: "LISS Brisk Walk (6 kmph, 2 incline)",
        sets: 1,
        reps: "80 min",
        rest: 0,
      },
      { name: "Static Stretching", sets: 1, reps: "5 min", rest: 0 },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("[System] Purging all old data...");
    const collections = [
      User,
      Workout,
      WeeklyWorkoutPlan,
      Meal,
      WeeklyMealPlan,
      Ingredient,
      ExerciseLog,
      MealLog,
      DailyActivityLog,
      WorkoutSession,
      MasterExercise,
    ];
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log("[System] Data purged.");

    console.log("[System] Seeding new master data...");
    await Ingredient.insertMany(seedIngredients);
    await MasterExercise.insertMany(seedMasterExercises);
    await Meal.insertMany(seedMeals);
    const createdWorkouts = await Workout.insertMany(seedWorkouts);
    console.log(
      `[System] ${createdWorkouts.length} new workout templates created.`
    );

    const workoutPlanDays = {
      monday: createdWorkouts.find((w) => w.name.includes("Day 1"))._id,
      tuesday: createdWorkouts.find((w) => w.name.includes("Day 2"))._id,
      wednesday: createdWorkouts.find((w) => w.name.includes("Day 3"))._id,
      thursday: createdWorkouts.find((w) => w.name.includes("Day 4"))._id,
      friday: createdWorkouts.find((w) => w.name.includes("Day 5"))._id,
      saturday: createdWorkouts.find((w) => w.name.includes("Day 6"))._id,
      sunday: createdWorkouts.find((w) => w.name.includes("Day 7"))._id,
    };
    await WeeklyWorkoutPlan.create({
      planName: "Hunter's Intensive Week",
      userId: null,
      days: workoutPlanDays,
    });
    console.log(`[System] Default Weekly Workout Plan created.`);

    const mealTemplates = await Meal.find({});
    const breakfastMeal = mealTemplates.find(
      (m) => m.templateType === "Breakfast"
    )._id;
    const preWorkoutMeal = mealTemplates.find(
      (m) => m.templateType === "Pre-Workout"
    )._id;
    const repeatedDailyPlan = {
      breakfast: breakfastMeal,
      lunch: null,
      dinner: null,
      snacks: [preWorkoutMeal],
    };
    await WeeklyMealPlan.create({
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
    console.log(`[System] Default Weekly Meal Plan created.`);

    console.log("[System] Seeding complete! Database is ready.");
  } catch (error) {
    console.error("Error while seeding database:", error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("[System] Database connection closed.");
    }
  }
};

seedDatabase();
