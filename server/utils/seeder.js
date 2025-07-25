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
  {
    name: "Ginger Garlic Paste",
    calories_per_100g: 90.5,
    protein_per_100g: 4.3,
    carbs_per_100g: 17.2,
    fats_per_100g: 0.5,
    category: "Produce",
    isVerified: true,
  },
  {
    name: "Sunflower Refined Oil",
    calories_per_100g: 900,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fats_per_100g: 100,
    category: "Other",
    isVerified: true,
  },
  {
    name: "Almonds",
    calories_per_100g: 579,
    protein_per_100g: 21,
    carbs_per_100g: 22,
    fats_per_100g: 50,
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
      { name: "Banana", quantity: "100g" },
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
      { name: "Whole Wheat Flour", quantity: "100g" },
      { name: "Plain Curd/Yogurt", quantity: "40g" },
      { name: "Ginger Garlic Paste", quantity: "15g" },
      { name: "Sunflower Refined Oil", quantity: "10g" },
    ],
  },
  {
    name: "Protein-Packed Dinner",
    templateType: "Dinner",
    ingredients: [
      { name: "Egg (Large)", quantity: "8" },
      { name: "Sunflower Refined Oil", quantity: "5g" },
    ],
  },
  {
    name: "Snacks",
    templateType: "Snacks",
    ingredients: [{ name: "Banana", quantity: "100g" }],
  },
];

// =================================================================
// 🏋️ MASTER EXERCISE DATABASE (V3)
// =================================================================
const seedMasterExercises = [
  {
    name: "Treadmill Brisk Walk",
    metValue: 4.3,
    unit: "per_minute",
    category: "LISS",
    defaultSpeed_kmph: 6,
    defaultIncline_percent: 2,
  },
  {
    name: "Jumping Jacks",
    metValue: 8.0,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "iSSAk4XCsRA",
    isBodyweight: true,
  },
  {
    name: "High Knees",
    metValue: 8.0,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "ZNDHivUg7vA",
    isBodyweight: true,
  },
  {
    name: "Bodyweight Squats",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "xqvAg4ltc3o",
    isBodyweight: true,
  },
  {
    name: "Walking Lunges",
    metValue: 4.0,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "DlhojghkaQ0",
    isBodyweight: true,
  },
  {
    name: "Scapular Push-ups",
    metValue: 2.8,
    unit: "per_rep_and_rest",
    category: "Warm-up",
    youtubeLink: "NKekqeudgWs",
    isBodyweight: true,
  },
  {
    name: "Leg Swings (Forward and Backward)",
    metValue: 3.0,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "AK3ALBgaEt0",
    isBodyweight: true,
  },
  {
    name: "Leg Swings (Side to Side)",
    metValue: 3.0,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "AK3ALBgaEt0",
    isBodyweight: true,
  },
  {
    name: "Push-up to Downward Dog",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Warm-up",
    youtubeLink: "LCLfv60R9XA",
    isBodyweight: true,
  },

  {
    name: "Dumbbell Bench Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "ZaDlbm8E8Tg",
  },
  {
    name: "Dumbbell Overhead Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "Did01dFR3Lk",
  },
  {
    name: "Bent-Over Rows (Dumbbell)",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "6gvmcqr226U",
  },
  {
    name: "Lat Pulldowns",
    metValue: 4.5,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "JGeRYIZdojU",
  },
  {
    name: "Dumbbell Bicep Curls",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "cBSD6mQIPQk",
  },
  {
    name: "Triceps Pushdowns",
    metValue: 3.5,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "LXkCrxn3caQ",
  },
  {
    name: "Goblet Squats",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "pEGfGwp6IEA",
  },
  {
    name: "Romanian Deadlift (Dumbbell)",
    metValue: 6.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "xAL7lHwj30E",
  },
  {
    name: "Lunges",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "MxfTNXSFiYI",
  },
  {
    name: "Leg Press",
    metValue: 5.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "yZmx_Ac3880",
  },
  {
    name: "Pull-ups",
    metValue: 8.0,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "eGo4IaAggnpPyR6EYlbE5g",
    isBodyweight: true,
  },
  {
    name: "Push-ups",
    metValue: 4.5,
    unit: "per_rep_and_rest",
    category: "Strength",
    youtubeLink: "WDIpL0pjun0",
    isBodyweight: true,
  },
  {
    name: "Plank",
    metValue: 2.8,
    unit: "per_minute",
    category: "Core",
    youtubeLink: "pSHjTRCQxIw",
    isBodyweight: true,
  },
  {
    name: "Leg Raises",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "JB2oyawG9KI",
    isBodyweight: true,
  },
  {
    name: "Russian Twists",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "wkD8rjkodUI",
  },
  {
    name: "Crunches",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "Xyd_fa5zoEU",
    isBodyweight: true,
  },
  {
    name: "Bicycle Crunches",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "Iwyvozckjak",
    isBodyweight: true,
  },
  {
    name: "Side Planks",
    metValue: 2.8,
    unit: "per_minute",
    category: "Core",
    youtubeLink: "1ZfIm-GZ-38",
    isBodyweight: true,
  },
  {
    name: "Reverse Crunches",
    metValue: 3.8,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "hyv14e2QDq0",
    isBodyweight: true,
  },
  {
    name: "Cable Crunches",
    metValue: 4.0,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "u_s-3Gv3J8Y",
  },
  {
    name: "Bird Dog",
    metValue: 2.5,
    unit: "per_rep_and_rest",
    category: "Core",
    youtubeLink: "wiFNA3sqjCA",
    isBodyweight: true,
  },

  {
    name: "HIIT Sprint",
    metValue: 12.5,
    unit: "per_minute",
    category: "HIIT",
    defaultSpeed_kmph: 12,
    defaultIncline_percent: 0,
  },
  {
    name: "Active Recovery Walk",
    metValue: 3.0,
    unit: "per_minute",
    category: "LISS",
    defaultSpeed_kmph: 4,
    defaultIncline_percent: 0,
  },
  {
    name: "LISS Brisk Walk",
    metValue: 5.0,
    unit: "per_minute",
    category: "LISS",
    defaultSpeed_kmph: 6,
    defaultIncline_percent: 2,
  },
  { name: "Light Jog", metValue: 7.0, unit: "per_minute", category: "LISS" },
  {
    name: "Chest Stretch (Doorway)",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "Nd_aS4-2xKo",
  },
  {
    name: "Triceps Stretch (Overhead)",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "mRangebs1_w",
  },
  {
    name: "Biceps Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "Q6g-3i5-57E",
  },
  {
    name: "Lat Stretch (Overhead)",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "nFp4-k-T_2Y",
  },
  {
    name: "Cobra Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "jdY2dfL2eMI",
  },
  {
    name: "Child's Pose",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Quad Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "T_z_Qh4Q2BU",
  },
  {
    name: "Hamstring Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "6Kq42C_wXkI",
  },
  {
    name: "Calf Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "Yy3s-O_t9V4",
  },
  {
    name: "Hip Flexor Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "gE4pfDYY3-8",
  },
  {
    name: "Glute Stretch (Figure-Four)",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "B12-AaV4e8U",
  },
  {
    name: "Side Bend Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "Drx25_r5g9A",
  },
  {
    name: "Gentle Spinal Twist",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "eIqfa4aY1qQ",
  },
  {
    name: "Arm Circles",
    metValue: 2.5,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Torso Twists",
    metValue: 2.5,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Shoulder Rolls",
    metValue: 2.5,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Cat-Cow Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Arm Cross-overs",
    metValue: 2.5,
    unit: "per_minute",
    category: "Warm-up",
    youtubeLink: "2vJKSlfTQ-M",
  },
  {
    name: "Shoulder Stretch",
    metValue: 2.5,
    unit: "per_minute",
    category: "Cool-down",
    youtubeLink: "2vJKSlfTQ-M",
  },
];

// =================================================================
// 🏋️ WORKOUT TEMPLATES (V3 - FULL 7-DAY PLAN)
// =================================================================
const seedWorkouts = [
  {
    name: "Day 1: Strength A (Upper Body) + Core",
    type: "Template",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "5 min", rest: 0 },
      { name: "Arm Circles", sets: 1, reps: "30s", rest: 10 },
      { name: "Torso Twists", sets: 1, reps: "30s", rest: 10 },
      { name: "Shoulder Rolls", sets: 1, reps: "30s", rest: 10 },
      { name: "Cat-Cow Stretch", sets: 1, reps: "60s", rest: 10 },
      { name: "Arm Cross-overs", sets: 1, reps: "30s", rest: 10 },
      { name: "Scapular Push-ups", sets: 2, reps: "10", rest: 30 },
      { name: "Dumbbell Bench Press", sets: 4, reps: "12", rest: 75 },
      { name: "Dumbbell Overhead Press", sets: 4, reps: "12", rest: 75 },
      { name: "Bent-Over Rows (Dumbbell)", sets: 4, reps: "12", rest: 75 },
      { name: "Lat Pulldowns", sets: 3, reps: "15", rest: 60 },
      { name: "Dumbbell Bicep Curls", sets: 3, reps: "15", rest: 60 },
      { name: "Triceps Pushdowns", sets: 3, reps: "15", rest: 60 },
      { name: "Plank", sets: 3, reps: "60s", rest: 45 },
      { name: "Leg Raises", sets: 3, reps: "20", rest: 45 },
      { name: "Russian Twists", sets: 3, reps: "20 per side", rest: 45 },
      { name: "Chest Stretch (Doorway)", sets: 1, reps: "30s", rest: 10 },
      { name: "Triceps Stretch (Overhead)", sets: 1, reps: "30s", rest: 10 },
      { name: "Lat Stretch (Overhead)", sets: 1, reps: "30s", rest: 10 },
      { name: "Cobra Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 0 },
    ],
  },
  {
    name: "Day 2: HIIT + LISS Cardio",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "HIIT Sprint", sets: 8, reps: "60s", rest: 90 },
      { name: "Active Recovery Walk", sets: 8, reps: "90s", rest: 0 },
      { name: "LISS Brisk Walk", sets: 1, reps: "55 min", rest: 0 },
      { name: "Quad Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Calf Stretch", sets: 1, reps: "30s per side", rest: 0 },
      { name: "Hip Flexor Stretch", sets: 1, reps: "30s per side", rest: 10 },
      {
        name: "Glute Stretch (Figure-Four)",
        sets: 1,
        reps: "30s per side",
        rest: 0,
      },
    ],
  },
  {
    name: "Day 3: Strength B (Lower Body) + Core",
    type: "Template",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "3 min", rest: 0 },
      { name: "Jumping Jacks", sets: 1, reps: "1 min", rest: 0 },
      { name: "High Knees", sets: 1, reps: "1 min", rest: 0 },
      { name: "Bodyweight Squats", sets: 2, reps: "12", rest: 30 },
      {
        name: "Leg Swings (Forward and Backward)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      {
        name: "Leg Swings (Side to Side)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      { name: "Walking Lunges", sets: 1, reps: "12 each leg", rest: 15 },
      { name: "Torso Twists", sets: 1, reps: "30s", rest: 10 },
      { name: "Cat-Cow Stretch", sets: 1, reps: "60s", rest: 10 },
      { name: "Goblet Squats", sets: 4, reps: "12", rest: 90 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 4, reps: "12", rest: 90 },
      { name: "Lunges", sets: 3, reps: "12 per leg", rest: 75 },
      { name: "Leg Press", sets: 3, reps: "15", rest: 75 },
      { name: "Crunches", sets: 3, reps: "20", rest: 45 },
      { name: "Bicycle Crunches", sets: 3, reps: "20", rest: 45 },
      { name: "Side Planks", sets: 3, reps: "60s per side", rest: 45 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Quad Stretch", sets: 1, reps: "30s", rest: 10 },
      {
        name: "Glute Stretch (Figure-Four)",
        sets: 1,
        reps: "30s per side",
        rest: 0,
      },
      { name: "Hip Flexor Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Cobra Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 0 },
    ],
  },
  {
    name: "Day 4: LISS (Extended) + Core",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "LISS Brisk Walk", sets: 1, reps: "55 min", rest: 0 },
      { name: "Reverse Crunches", sets: 3, reps: "20", rest: 45 },
      { name: "Cable Crunches", sets: 3, reps: "20", rest: 45 },
      { name: "Bird Dog", sets: 3, reps: "12 per side", rest: 45 },
      { name: "Hip Flexor Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Quad Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Side Bend Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 0 },
    ],
  },
  {
    name: "Day 5: Strength C (Full Body) + HIIT",
    type: "Boss Battle",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "5 min", rest: 0 },
      { name: "Bodyweight Squats", sets: 2, reps: "12", rest: 30 },
      { name: "Push-up to Downward Dog", sets: 2, reps: "10", rest: 30 },
      { name: "Arm Circles", sets: 1, reps: "30s", rest: 10 },
      { name: "Torso Twists", sets: 1, reps: "30s", rest: 10 },
      {
        name: "Leg Swings (Forward and Backward)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      {
        name: "Leg Swings (Side to Side)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      { name: "Goblet Squats", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Bent-Over Rows (Dumbbell)", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Overhead Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "HIIT Sprint", sets: 5, reps: "60s", rest: 90 },
      { name: "Active Recovery Walk", sets: 5, reps: "90s", rest: 0 },
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "Quad Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s per side", rest: 10 },
      {
        name: "Chest Stretch (Doorway)",
        sets: 1,
        reps: "30s per side",
        rest: 0,
      },
      { name: "Shoulder Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Cobra Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 0 },
    ],
  },
  {
    name: "Day 6: Strength Rotation + LISS",
    type: "Template",
    exercises: [
      { name: "Treadmill Brisk Walk", sets: 1, reps: "5 min", rest: 0 },
      { name: "Arm Circles", sets: 1, reps: "30s", rest: 10 },
      { name: "Torso Twists", sets: 1, reps: "30s", rest: 10 },
      { name: "Bodyweight Squats", sets: 2, reps: "12", rest: 30 },
      {
        name: "Leg Swings (Forward and Backward)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      {
        name: "Leg Swings (Side to Side)",
        sets: 1,
        reps: "12 each leg",
        rest: 15,
      },
      { name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Dumbbell Overhead Press", sets: 4, reps: "8-12", rest: 75 },
      { name: "Lat Pulldowns", sets: 3, reps: "10-15", rest: 60 },
      { name: "Dumbbell Bicep Curls", sets: 3, reps: "10-15", rest: 60 },
      { name: "Triceps Pushdowns", sets: 3, reps: "10-15", rest: 60 },
      { name: "Goblet Squats", sets: 4, reps: "8-12", rest: 90 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 4, reps: "8-12", rest: 90 },
      { name: "Lunges", sets: 3, reps: "12 per leg", rest: 75 },
      { name: "Treadmill Brisk Walk", sets: 1, reps: "25 min", rest: 0 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Quad Stretch", sets: 1, reps: "30s", rest: 10 },
      {
        name: "Glute Stretch (Figure-Four)",
        sets: 1,
        reps: "30s per side",
        rest: 0,
      },
      { name: "Hip Flexor Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Cobra Stretch", sets: 1, reps: "30s", rest: 10 },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 0 },
      { name: "Chest Stretch (Doorway)", sets: 1, reps: "30s", rest: 10 },
      { name: "Triceps Stretch (Overhead)", sets: 1, reps: "30s", rest: 10 },
      { name: "Lat Stretch (Overhead)", sets: 1, reps: "30s", rest: 10 },
    ],
  },
  {
    name: "Day 7: Active Recovery",
    type: "Template",
    exercises: [
      { name: "Light Jog", sets: 1, reps: "5 min", rest: 0 },
      { name: "LISS Brisk Walk", sets: 1, reps: "80 min", rest: 0 },
      { name: "Hamstring Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Quad Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Calf Stretch", sets: 1, reps: "30s per side", rest: 10 },
      { name: "Hip Flexor Stretch", sets: 1, reps: "30s per side", rest: 10 },
      {
        name: "Chest Stretch (Doorway)",
        sets: 1,
        reps: "30s per side",
        rest: 10,
      },
      { name: "Child's Pose", sets: 1, reps: "60s", rest: 10 },
      { name: "Gentle Spinal Twist", sets: 1, reps: "30s per side", rest: 0 },
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
