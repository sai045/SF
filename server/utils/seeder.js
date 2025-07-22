const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' }); // Precise path to .env

const connectDB = require('../config/db');
const Workout = require('../models/Workout.model');
const WeeklyWorkoutPlan = require('../models/WeeklyWorkoutPlan.model');
const Meal = require('../models/Meal.model');
const WeeklyMealPlan = require('../models/WeeklyMealPlan.model');

connectDB();

// =================================================================
// 🍲 MEAL DATA FROM IMAGE
// =================================================================
const seedMeals = [
  {
    name: "Pre-Workout Fuel",
    templateType: "Pre-Workout",
    ingredients: [
      { name: "Sattu Pindi", quantity: "40g", category: "Pantry", calories: 155, protein: 10.4, carbs: 22, fats: 3 },
      { name: "Banana", quantity: "1 medium", category: "Produce", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    ],
    // Totals are calculated from the ingredients above
    totalCalories: 260, totalProtein: 11.7, totalCarbs: 49, totalFats: 3.4
  },
  {
    name: "High Protein Breakfast",
    templateType: "Breakfast",
    ingredients: [
      { name: "Slim Milk", quantity: "330g", category: "Dairy", calories: 115, protein: 11.55, carbs: 16, fats: 0.5 },
      { name: "Peanut Butter", quantity: "30g", category: "Pantry", calories: 180, protein: 8.49, carbs: 6, fats: 15 },
      { name: "Oats", quantity: "45g", category: "Pantry", calories: 170, protein: 4.9, carbs: 30, fats: 3 },
    ],
    totalCalories: 465, totalProtein: 24.94, totalCarbs: 52, totalFats: 18.5
  },
  {
    name: "Balanced Power Lunch",
    templateType: "Lunch",
    ingredients: [
      { name: "Chicken Breast", quantity: "200g", category: "Meat", calories: 330, protein: 43.2, carbs: 0, fats: 7 },
      { name: "Soya Chunks", quantity: "60g", category: "Pantry", calories: 200, protein: 31.8, carbs: 20, fats: 0.5 },
      { name: "Chapathi Flour", quantity: "100g", category: "Pantry", calories: 340, protein: 6.9, carbs: 72, fats: 1.5 },
      { name: "Curd", quantity: "40g", category: "Dairy", calories: 39, protein: 1.2, carbs: 2, fats: 2.5 },
    ],
    totalCalories: 909, totalProtein: 83.1, totalCarbs: 94, totalFats: 11.5
  },
  {
    name: "Afternoon Snack",
    templateType: "Snacks",
    ingredients: [
      { name: "Banana", quantity: "1 medium", category: "Produce", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    ],
    totalCalories: 105, totalProtein: 1.3, totalCarbs: 27, totalFats: 0.4
  },
  {
    name: "Protein-Packed Dinner",
    templateType: "Dinner",
    ingredients: [
      { name: "Eggs", quantity: "8 large", category: "Protein", calories: 624, protein: 38.5, carbs: 3, fats: 50 },
      { name: "Chapathi Flour", quantity: "40g", category: "Pantry", calories: 140, protein: 3.2, carbs: 29, fats: 0.5 },
    ],
    totalCalories: 764, totalProtein: 41.7, totalCarbs: 32, totalFats: 50.5
  }
];

// =================================================================
// 🏋️ WORKOUT DATA FROM IMAGE
// =================================================================
const seedWorkouts = [
  {
    name: "Day 1: Upper Body + Core",
    description: "Focuses on building strength in the chest, back, shoulders, and arms, with a core finisher.",
    type: "Template", muscleGroups: ["Upper Body", "Core", "Strength"], estimatedDuration: 60,
    exercises: [
      { name: "Dumbbell Bench Press", sets: 3, reps: "8-12", rest: 60 },
      { name: "Overhead Press", sets: 3, reps: "8-12", rest: 60 },
      { name: "Bent-Over Rows", sets: 3, reps: "8-12", rest: 60 },
      { name: "Bicep Curls", sets: 3, reps: "10-15", rest: 45 },
      { name: "Core: Plank", sets: 3, reps: "45-60s hold", rest: 30, isSupersetWithNext: true },
      { name: "Core: Leg Raises", sets: 3, reps: "15-20", rest: 60 }
    ]
  },
  {
    name: "Day 2: HIIT + LISS",
    description: "High-Intensity Interval Training combined with Low-Intensity Steady State cardio for maximum fat loss and cardiovascular health.",
    type: "Template", muscleGroups: ["Cardio", "HIIT", "Endurance"], estimatedDuration: 80,
    exercises: [
      { name: "HIIT Session", sets: 1, reps: "25min (30-60s effort, 60-90s recovery)", rest: 0 },
      { name: "LISS: Incline Walking", sets: 1, reps: "55min steady pace", rest: 0 }
    ]
  },
  {
    name: "Day 3: Lower Body + Core",
    description: "Strengthens the entire lower body including quads, hamstrings, and glutes, plus a core workout.",
    type: "Template", muscleGroups: ["Lower Body", "Core", "Strength"], estimatedDuration: 60,
    exercises: [
      { name: "Goblet Squats", sets: 4, reps: "10-12", rest: 60 },
      { name: "Romanian Deadlifts", sets: 3, reps: "8-12", rest: 75 },
      { name: "Dumbbell Lunges", sets: 3, reps: "10 per leg", rest: 60 },
      { name: "Core: Crunches", sets: 3, reps: "20-25", rest: 30, isSupersetWithNext: true },
      { name: "Core: Side Planks", sets: 3, reps: "30s hold per side", rest: 60 }
    ]
  },
  {
    name: "Day 4: LISS + Core",
    description: "A focused session on building core stability combined with low-intensity cardio.",
    type: "Template", muscleGroups: ["Cardio", "Core"], estimatedDuration: 80,
    exercises: [
        { name: "LISS: Steady State Cardio", sets: 1, reps: "55min walking or cycling", rest: 0 },
        { name: "Reverse Crunches", sets: 3, reps: "15-20", rest: 45 },
        { name: "Bird Dog Holds", sets: 3, reps: "30s hold per side", rest: 45 },
        { name: "Focused Core Circuit", sets: 1, reps: "25 min total", rest: 0}
    ]
  },
  {
    name: "Day 5: Full Body + HIIT",
    description: "A combination of compound strength movements targeting the whole body, finished with a high-intensity session.",
    type: "Template", muscleGroups: ["Full Body", "HIIT", "Strength"], estimatedDuration: 75,
    exercises: [
        { name: "Compound: Squats", sets: 3, reps: "8-10", rest: 90 },
        { name: "Compound: Push Press", sets: 3, reps: "8-10", rest: 90 },
        { name: "Compound: Pull-ups or Lat Pulldowns", sets: 3, reps: "As many as possible", rest: 90 },
        { name: "HIIT Finisher", sets: 1, reps: "30min session", rest: 0 }
    ]
  },
  {
    name: "Day 6: Strength + LISS",
    description: "A primary strength day focusing on good form and progressive overload, with a LISS recovery component.",
    type: "Template", muscleGroups: ["Strength", "Cardio", "Full Body"], estimatedDuration: 85,
    exercises: [
        { name: "Main Lift A/B/C Rotation (e.g., Bench Press)", sets: 5, reps: "5", rest: 120 },
        { name: "Accessory Lift 1", sets: 3, reps: "10-12", rest: 60 },
        { name: "Accessory Lift 2", sets: 3, reps: "10-12", rest: 60 },
        { name: "LISS: Recovery Walk", sets: 1, reps: "25min steady pace", rest: 0 }
    ]
  },
  {
    name: "Day 7: Active Recovery",
    description: "A light day to promote blood flow, flexibility, and muscle repair, preparing you for the week ahead.",
    type: "Template", muscleGroups: ["Recovery", "Flexibility"], estimatedDuration: 100,
    exercises: [
        { name: "LISS: Long Walk", sets: 1, reps: "80min steady pace", rest: 0 },
        { name: "Light Stretching", sets: 1, reps: "15-20 min full body", rest: 0 }
    ]
  }
];

// =================================================================
// 📜 SEEDER FUNCTION
// =================================================================
const seedData = async () => {
    try {
        console.log('[System] Initializing data destruction...');
        await Workout.deleteMany({});
        await WeeklyWorkoutPlan.deleteMany({});
        await Meal.deleteMany({});
        await WeeklyMealPlan.deleteMany({});
        console.log('[System] Old templates purged.');

        console.log('[System] Creating new meal templates...');
        const createdMeals = await Meal.insertMany(seedMeals);
        console.log(`[System] ${createdMeals.length} meal templates created.`);
        
        console.log('[System] Creating new workout templates...');
        const createdWorkouts = await Workout.insertMany(seedWorkouts);
        console.log(`[System] ${createdWorkouts.length} workout templates created.`);

        // --- Create a Default Weekly Workout Plan ---
        console.log('[System] Assembling the Weekly Workout Plan...');
        const defaultWorkoutPlan = await WeeklyWorkoutPlan.create({
            planName: "Hunter's Standard Week",
            // The `userId` is intentionally left null for a global template
            userId: null, 
            weekStartDate: new Date(), // This is a placeholder
            days: {
                monday: createdWorkouts.find(w => w.name.includes("Day 1"))._id,
                tuesday: createdWorkouts.find(w => w.name.includes("Day 2"))._id,
                wednesday: createdWorkouts.find(w => w.name.includes("Day 3"))._id,
                thursday: createdWorkouts.find(w => w.name.includes("Day 4"))._id,
                friday: createdWorkouts.find(w => w.name.includes("Day 5"))._id,
                saturday: createdWorkouts.find(w => w.name.includes("Day 6"))._id,
                sunday: createdWorkouts.find(w => w.name.includes("Day 7"))._id,
            }
        });
        console.log(`[System] Default Weekly Workout Plan created with ID: ${defaultWorkoutPlan._id}`);
        
        // --- Create a Default Weekly Meal Plan ---
        console.log('[System] Assembling the Weekly Meal Plan...');
        const preWorkoutMeal = createdMeals.find(m => m.templateType === "Pre-Workout")._id;
        const breakfastMeal = createdMeals.find(m => m.templateType === "Breakfast")._id;
        const lunchMeal = createdMeals.find(m => m.templateType === "Lunch")._id;
        const snackMeal = createdMeals.find(m => m.templateType === "Snacks")._id;
        const dinnerMeal = createdMeals.find(m => m.templateType === "Dinner")._id;
        
        // --- CORRECTED LOGIC HERE ---
        // We define the plan for a single day, which will be repeated
        const repeatedDailyPlan = {
            breakfast: breakfastMeal,
            lunch: lunchMeal,
            dinner: dinnerMeal,
            snacks: [preWorkoutMeal, snackMeal]
        };

        const defaultMealPlan = await WeeklyMealPlan.create({
            // Again, userId is null for a global template
            userId: null, 
            weekStartDate: new Date(), // Placeholder date
            days: {
                monday: repeatedDailyPlan,
                tuesday: repeatedDailyPlan,
                wednesday: repeatedDailyPlan,
                thursday: repeatedDailyPlan,
                friday: repeatedDailyPlan,
                saturday: repeatedDailyPlan,
                sunday: repeatedDailyPlan,
            }
        });
        // --- END OF CORRECTION ---
        console.log(`[System] Default Weekly Meal Plan created with ID: ${defaultMealPlan._id}`);


        console.log('[System] Seeding complete! Database is ready.');

    } catch (error) {
        console.error('Error while seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('[System] Database connection closed.');
    }
};

// --- RUN THE SCRIPT ---
seedData();