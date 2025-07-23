const MasterExercise = require("../models/MasterExercise.model");

// Mifflin-St Jeor Equation for BMR
const calculateBMR = (gender, weight_kg, height_cm, age) => {
  if (!gender || !weight_kg || !height_cm || !age) {
    return 0; // Not enough data to calculate
  }

  if (gender.toLowerCase() === "male") {
    // BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    // female
    // BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
};

// Simplified MET values for activities
const MET_VALUES = {
  STRENGTH_TRAINING: 4.5,
  HIIT: 8.0,
  LISS_CARDIO: 3.5,
  STEPS_PER_MINUTE_WALKING: 3.5, // Corresponds to walking at ~3.0 mph
};

const calculateWorkoutCalories = async (workoutLogs, userWeightKg) => {
  if (!workoutLogs || workoutLogs.length === 0 || !userWeightKg) return 0;

  // The new function expects setsLogged, so we extract them from the logs
  const allSetsLogged = workoutLogs.flatMap((log) => {
    // Find the original workout template to get the rest periods
    const originalWorkout = log.workoutId;
    return log.setsLogged.map((set) => {
      const originalExercise = originalWorkout.exercises.find(
        (ex) => ex.name === set.exerciseName
      );
      return {
        ...set.toObject(),
        rest: originalExercise ? originalExercise.rest : 60, // Default rest if not found
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

  for (const set of allSetsLogged) {
    const masterEx = masterExerciseMap.get(set.exerciseName);
    if (!masterEx) continue;

    let durationMinutes = 0;
    let metValue = masterEx.metValue;

    if (masterEx.unit === "per_minute") {
      const repString = set.reps.toString().toLowerCase();
      let seconds = 0;
      if (repString.includes("min")) {
        seconds = (parseFloat(repString) || 0) * 60;
      } else if (repString.includes("s")) {
        seconds = parseFloat(repString) || 0;
      } else {
        // If it's just a number, assume it's seconds (for things like Plank)
        seconds = parseFloat(repString) || 0;
      }
      durationMinutes = seconds / 60;
    } else if (masterEx.unit === "per_rep_and_rest") {
      const reps = parseInt(set.reps, 10);
      if (isNaN(reps)) continue;

      const timeUnderTensionSeconds = reps * SECONDS_PER_REP;
      const restSeconds = set.rest || 60;
      durationMinutes = (timeUnderTensionSeconds + restSeconds) / 60;
    }

    if (durationMinutes > 0) {
      const caloriesForSet =
        ((metValue * 3.5 * userWeightKg) / 200) * durationMinutes;
      totalCaloriesBurned += caloriesForSet;
    }
  }

  return totalCaloriesBurned;
};

// Calculates calories burned from walking
const calculateStepCalories = (stepCount, userWeightKg) => {
  if (!stepCount || !userWeightKg) return 0;

  // Assume an average of 100 steps per minute of walking for calculation purposes
  const durationMinutes = stepCount / 100;
  const calories =
    ((MET_VALUES.STEPS_PER_MINUTE_WALKING * 3.5 * userWeightKg) / 200) *
    durationMinutes;
  return calories;
};

// Epley formula for Estimated 1-Rep Max
const calculateE1RM = (weight, reps) => {
  if (reps === 1) {
    return weight;
  }
  // Formula is less accurate for high reps, but good enough for this purpose
  if (reps === 0) return 0;
  return weight * (1 + reps / 30);
};

/**
 * Estimates calories burned from a workout session by analyzing each logged set.
 * @param {Array} setsLogged - The array of sets from a WorkoutLog.
 * @param {number} userWeightKg - The user's weight in kilograms.
 * @returns {Promise<number>} - The estimated total calories burned.
 */
const calculateWorkoutCaloriesBottomUp = async (setsLogged, userWeightKg) => {
  if (!setsLogged || setsLogged.length === 0 || !userWeightKg) return 0;

  let totalCaloriesBurned = 0;

  // Fetch all unique master exercises for this workout in one query for efficiency
  const exerciseNames = [...new Set(setsLogged.map((set) => set.exerciseName))];
  const masterExercises = await MasterExercise.find({
    name: { $in: exerciseNames },
  });
  const masterExerciseMap = new Map(masterExercises.map((ex) => [ex.name, ex]));

  // Define an estimated time per rep for strength exercises
  const SECONDS_PER_REP = 3;

  for (const set of setsLogged) {
    const masterEx = masterExerciseMap.get(set.exerciseName);
    if (!masterEx) continue; // Skip if exercise is not in our master list

    let durationMinutes = 0;
    let metValue = masterEx.metValue;

    // --- Logic for Timed Exercises (Cardio, Planks, Stretches) ---
    if (masterEx.unit === "per_minute") {
      // Reps for timed exercises are stored as strings like "5 min", "60s", "30s"
      const repString = set.reps.toString().toLowerCase();
      let seconds = 0;
      if (repString.includes("min")) {
        seconds = (parseFloat(repString) || 0) * 60;
      } else if (repString.includes("s")) {
        seconds = parseFloat(repString) || 0;
      }
      durationMinutes = seconds / 60;
    }
    // --- Logic for Rep-based Exercises (Strength, Core) ---
    else {
      // We estimate the duration of the set itself plus the rest period
      const reps = parseInt(set.reps, 10);
      if (isNaN(reps)) continue;

      const timeUnderTensionSeconds = reps * SECONDS_PER_REP;
      // Find the rest period from the workout template (this is a simplification)
      const restSeconds = set.rest || 60; // Default to 60s if not specified
      durationMinutes = (timeUnderTensionSeconds + restSeconds) / 60;
    }

    if (durationMinutes > 0) {
      // The standard formula: (METs * 3.5 * weight in kg / 200) * duration in minutes
      const caloriesForSet =
        ((metValue * 3.5 * userWeightKg) / 200) * durationMinutes;
      totalCaloriesBurned += caloriesForSet;
    }
  }

  return totalCaloriesBurned;
};

module.exports = {
  calculateBMR,
  calculateWorkoutCalories: calculateWorkoutCaloriesBottomUp,
  calculateStepCalories,
  calculateE1RM,
};
