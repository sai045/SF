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

// A function to estimate calories burned from workouts
const calculateWorkoutCalories = (workoutLogs, userWeightKg) => {
  if (!workoutLogs || workoutLogs.length === 0 || !userWeightKg) return 0;

  let totalCaloriesBurned = 0;
  for (const log of workoutLogs) {
    if (!log.workoutId || !log.duration) continue; // Skip logs with missing data

    const durationMinutes = log.duration / 60;
    const workoutName = log.workoutId.name.toLowerCase();

    // Use a high MET value if 'HIIT' or 'Boss' is in the name, else standard strength MET.
    const met =
      workoutName.includes("hiit") ||
      workoutName.includes("boss") ||
      workoutName.includes("day 2") ||
      workoutName.includes("day 5")
        ? MET_VALUES.HIIT
        : workoutName.includes("liss") ||
          workoutName.includes("recovery") ||
          workoutName.includes("day 7")
        ? MET_VALUES.LISS_CARDIO
        : MET_VALUES.STRENGTH_TRAINING;

    // Formula: METs * 3.5 * weight in kg / 200 * duration in minutes
    const calories = ((met * 3.5 * userWeightKg) / 200) * durationMinutes;
    totalCaloriesBurned += calories;
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
