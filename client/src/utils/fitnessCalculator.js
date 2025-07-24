// Epley formula for Estimated 1-Rep Max
export const calculateE1RM = (weight, reps) => {
  if (reps === 1) return weight;
  if (reps === 0) return 0;
  return weight * (1 + reps / 30);
};
