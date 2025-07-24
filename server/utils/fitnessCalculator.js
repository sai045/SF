const MasterExercise = require("../models/MasterExercise.model");
const mongoose = require("mongoose");

// BMR Calculation (Mifflin-St Jeor)
const calculateBMR = (gender, weight_kg, height_cm, age) => {
  if (!gender || !weight_kg || !height_cm || !age) {
    return 0;
  }
  if (gender.toLowerCase() === "male") {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
};

// Step Calorie Calculation
const calculateStepCalories = (stepCount, userWeightKg) => {
  if (!stepCount || !userWeightKg) return 0;
  const MET_FOR_WALKING = 3.5;
  const durationMinutes = stepCount / 100; // Approx. 100 steps per minute
  const calories =
    ((MET_FOR_WALKING * 3.5 * userWeightKg) / 200) * durationMinutes;
  return calories;
};

// Estimated 1-Rep Max Calculation (Epley Formula)
const calculateE1RM = (weight, reps) => {
  if (reps === 1) return weight;
  if (reps === 0) return 0;
  return weight * (1 + reps / 30);
};

// =================================================================
// THE COMPLETE AND CORRECTED WORKOUT CALORIE CALCULATOR
// =================================================================
const calculateWorkoutCalories = async (workoutLogs, userWeightKg) => {
  if (!workoutLogs || workoutLogs.length === 0 || !userWeightKg) return 0;

  // Flatten all logged sets from all of today's workout logs into a single array
  const allSetsLogged = workoutLogs.flatMap((log) => {
    if (!log.workoutId || !log.setsLogged) return [];
    const originalWorkout = log.workoutId;
    return log.setsLogged.map((set) => {
      const originalExercise = originalWorkout.exercises.find(
        (ex) => ex.name === set.exerciseName
      );
      return {
        ...set.toObject(),
        rest: originalExercise ? originalExercise.rest : 60, // Add rest period to each set
      };
    });
  });

  if (allSetsLogged.length === 0) return 0;

  let totalCaloriesBurned = 0;

  const exerciseNames = [
    ...new Set(allSetsLogged.map((set) => set.exerciseName)),
  ];
  const masterExercises = await MasterExercise.find({
    name: { $in: exerciseNames },
  });
  const masterExerciseMap = new Map(masterExercises.map((ex) => [ex.name, ex]));

  const SECONDS_PER_REP = 3;
  const RESTING_MET_VALUE = 1.8; // MET value for light activity between sets

  for (const set of allSetsLogged) {
    const masterEx = masterExerciseMap.get(set.exerciseName);
    if (!masterEx) continue;

    let metValue = masterEx.metValue;

    // --- Dynamic MET adjustment for LISS/HIIT cardio ---
    if (masterEx.category === "LISS" || masterEx.category === "HIIT") {
      let userSpeed = masterEx.defaultSpeed_kmph || 0;
      let userIncline = masterEx.defaultIncline_percent || 0;

      if (typeof set.weight === "object" && set.weight !== null) {
        userSpeed = parseFloat(set.weight.speed) || userSpeed;
        userIncline = parseFloat(set.weight.incline) || userIncline;
      }

      if (masterEx.defaultSpeed_kmph != null) {
        metValue =
          masterEx.metValue +
          (userSpeed - masterEx.defaultSpeed_kmph) * 0.5 +
          userIncline * 0.3;
      } else if (userSpeed > 0) {
        const standardSpeed = 8.0;
        const speedRatio = userSpeed / standardSpeed;
        metValue = masterEx.metValue * speedRatio + userIncline * 0.3;
      }
      metValue = Math.max(2.0, metValue);
    }

    // --- CALORIE CALCULATION LOGIC BY UNIT TYPE ---
    if (masterEx.unit === "per_minute") {
      const repString = set.reps.toString().toLowerCase();
      let seconds = 0;
      if (repString.includes("min"))
        seconds = (parseFloat(repString) || 0) * 60;
      else seconds = parseFloat(repString) || 0;

      const durationMinutes = seconds / 60;

      if (durationMinutes > 0 && !isNaN(metValue)) {
        const caloriesForActivity =
          ((metValue * 3.5 * userWeightKg) / 200) * durationMinutes;
        if (!isNaN(caloriesForActivity)) {
          totalCaloriesBurned += caloriesForActivity;
        }
      }
    } else if (masterEx.unit === "per_rep_and_rest") {
      const reps = parseInt(set.reps, 10);
      if (isNaN(reps) || reps === 0) continue;

      // 1. Calculate calories for the "work" portion (Time Under Tension)
      const timeUnderTensionMinutes = (reps * SECONDS_PER_REP) / 60;
      const workCalories =
        ((metValue * 3.5 * userWeightKg) / 200) * timeUnderTensionMinutes;
      if (!isNaN(workCalories)) {
        totalCaloriesBurned += workCalories;
      }

      // 2. Calculate calories for the "rest" portion
      const restMinutes = (set.rest || 0) / 60; // Use rest from the set, default to 0
      if (restMinutes > 0) {
        const restCalories =
          ((RESTING_MET_VALUE * 3.5 * userWeightKg) / 200) * restMinutes;
        if (!isNaN(restCalories)) {
          totalCaloriesBurned += restCalories;
        }
      }
    }
  }

  return isNaN(totalCaloriesBurned) ? 0 : totalCaloriesBurned;
};

module.exports = {
  calculateBMR,
  calculateStepCalories,
  calculateE1RM,
  calculateWorkoutCalories,
};
