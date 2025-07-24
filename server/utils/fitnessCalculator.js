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

  const allSetsLogged = workoutLogs.flatMap((log) => {
    const originalWorkout = log.workoutId;
    return log.setsLogged.map((set) => {
      const originalExercise = originalWorkout.exercises.find(
        (ex) => ex.name === set.exerciseName
      );
      return {
        ...set.toObject(),
        rest: originalExercise ? originalExercise.rest : 60,
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

    if (masterEx.category === "LISS" || masterEx.category === "HIIT") {
      let userSpeed = masterEx.defaultSpeed_kmph;
      let userIncline = masterEx.defaultIncline_percent;

      if (typeof set.weight === "object" && set.weight !== null) {
        if (set.weight.speed) userSpeed = parseFloat(set.weight.speed);
        if (set.weight.incline) userIncline = parseFloat(set.weight.incline);
      }

      metValue =
        masterEx.metValue +
        (userSpeed - masterEx.defaultSpeed_kmph) * 0.5 +
        userIncline * 0.3;
      metValue = Math.max(2.0, metValue);
    }

    if (masterEx.unit === "per_minute") {
      const repString = set.reps.toString().toLowerCase();
      let seconds = 0;
      if (repString.includes("min"))
        seconds = (parseFloat(repString) || 0) * 60;
      else if (repString.includes("s")) seconds = parseFloat(repString) || 0;
      else seconds = parseFloat(repString) || 0;
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

module.exports = {
  calculateBMR,
  calculateWorkoutCalories,
  calculateStepCalories,
  calculateE1RM,
};
