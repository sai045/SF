import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  AppContainer,
  Title,
  FormCard,
  Input,
  Button,
} from "../components/common/Styled";
import MealLoggerModal from "../components/nutrition/MealLoggerModal";
import { logSteps, getTodaysActivityLog } from "../api/activity.api";
import { theme } from "../styles/theme";
import {
  FaFire,
  FaAppleAlt,
  FaDrumstickBite,
  FaPizzaSlice,
  FaGlassWhiskey,
} from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MealGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const MealTypeCard = styled.div`
  background: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-left: 5px solid ${(props) => props.color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.glow};
  }

  h2 {
    font-size: 2.5rem;
    margin: 0;
  }
  p {
    font-size: 3rem;
    margin: 0;
    line-height: 1;
    color: ${(props) => props.color};
  }
`;

const LogDisplayPanel = styled.div`
  background: ${theme.colors.cardBackgroundSolid};
  border-radius: 8px;
  padding: 2rem;
`;

const MealDisplayCard = styled.div`
  margin-bottom: 2rem;
  h3 {
    border-bottom: 2px solid ${theme.colors.cardBackground};
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.color};
  }
`;

const IngredientRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: ${theme.colors.textMuted};
  span:first-child {
    color: ${theme.colors.text};
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 1rem;
  background-color: ${theme.colors.cardBackground};
  border-radius: 4px;
  margin-top: 2rem;
`;

const SummaryItem = styled.div`
  h4 {
    color: ${theme.colors.accent};
    font-size: 1.5rem;
    margin: 0;
  }
  p {
    font-size: 0.8rem;
    color: ${theme.colors.textMuted};
    margin: 0;
  }
`;

function NutritionDashboardPage() {
  const { user, refreshDashboardSummary } = useAuth();
  const [dailyLog, setDailyLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLog = () => {
    getTodaysActivityLog()
      .then((data) => {
        setDailyLog(data);
        setSteps(data.steps?.count || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLog();
  }, []);

  const handleOpenModal = (mealType) => {
    setSelectedMealType(mealType);
    setIsModalOpen(true);
  };

  const handleMealLogged = (updatedDailyLog) => {
    setDailyLog(updatedDailyLog); // Update local state for immediate UI feedback
    refreshDashboardSummary(); // Trigger global refresh for dashboard
  };

  const handleLogSteps = async (e) => {
    e.preventDefault();
    const stepCount = parseInt(steps, 10);
    if (isNaN(stepCount) || stepCount < 0) {
      return toast.error("Please enter a valid number of steps.");
    }
    try {
      await logSteps({ stepCount });
      toast.success(`${stepCount} steps logged for today!`);
      refreshDashboardSummary();
    } catch (err) {
      toast.error("Failed to log steps.");
    }
  };

  // Calculate total macros for the day using useMemo for performance
  const dailySummary = useMemo(() => {
    if (!dailyLog || !dailyLog.mealsLogged)
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return dailyLog.mealsLogged.reduce(
      (acc, meal) => {
        meal.ingredients.forEach((ing) => {
          if (ing.ingredientId) {
            const multiplier = ing.weightInGrams / 100;
            acc.calories +=
              (ing.ingredientId.calories_per_100g || 0) * multiplier;
            acc.protein +=
              (ing.ingredientId.protein_per_100g || 0) * multiplier;
            acc.carbs += (ing.ingredientId.carbs_per_100g || 0) * multiplier;
            acc.fats += (ing.ingredientId.fats_per_100g || 0) * multiplier;
          }
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [dailyLog]);

  if (loading)
    return (
      <AppContainer style={{ justifyContent: "center" }}>
        <LoadingSpinner />
      </AppContainer>
    );

  const mealCategories = [
    "Pre-Workout",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
  ];
  const mealIcons = {
    "Pre-Workout": { icon: <FaFire />, color: "#F39C12" },
    Breakfast: { icon: <FaAppleAlt />, color: theme.colors.primary },
    Lunch: { icon: <FaDrumstickBite />, color: theme.colors.danger },
    Dinner: { icon: <FaPizzaSlice />, color: theme.colors.secondary },
    Snacks: { icon: <FaGlassWhiskey />, color: theme.colors.accent },
  };

  const initialIngredients =
    dailyLog?.mealsLogged?.find((m) => m.mealType === selectedMealType)
      ?.ingredients || [];

  return (
    <>
      {isModalOpen && (
        <MealLoggerModal
          mealType={selectedMealType}
          initialIngredients={initialIngredients}
          onClose={() => setIsModalOpen(false)}
          onMealLogged={handleMealLogged}
        />
      )}

      <AppContainer>
        <Title>Daily Nutrition Log</Title>
        <PageGrid>
          <ControlPanel>
            <FormCard as="div">
              <h3
                style={{
                  textAlign: "center",
                  color: theme.colors.text,
                  fontSize: "1.5rem",
                }}
              >
                Log Today's Steps
              </h3>
              <form
                onSubmit={handleLogSteps}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <Input
                  type="number"
                  placeholder="e.g., 8000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  style={{ margin: 0 }}
                />
                <Button
                  type="submit"
                  style={{ width: "auto", minWidth: "150px" }}
                >
                  LOG
                </Button>
              </form>
            </FormCard>

            <FormCard as="div">
              <h3
                style={{
                  textAlign: "center",
                  color: theme.colors.text,
                  fontSize: "1.5rem",
                }}
              >
                Log a Meal
              </h3>
              <p
                style={{
                  textAlign: "center",
                  color: theme.colors.textMuted,
                  marginTop: "-0.5rem",
                  marginBottom: "1rem",
                }}
              >
                Select a meal to add/edit ingredients.
              </p>
              <MealGrid>
                {mealCategories.map((mealType) => (
                  <MealTypeCard
                    key={mealType}
                    color={mealIcons[mealType].color}
                    onClick={() => handleOpenModal(mealType)}
                  >
                    <p>{mealIcons[mealType].icon}</p> <h2>{mealType}</h2>
                  </MealTypeCard>
                ))}
              </MealGrid>
            </FormCard>
          </ControlPanel>

          <LogDisplayPanel>
            <h2>Today's Logged Items</h2>
            {dailyLog?.mealsLogged && dailyLog.mealsLogged.length > 0 ? (
              dailyLog.mealsLogged.map((meal) => (
                <MealDisplayCard
                  key={meal.mealType}
                  color={mealIcons[meal.mealType].color}
                >
                  <h3>{meal.mealType}</h3>
                  {meal.ingredients.map((ing) => (
                    <IngredientRow key={ing.ingredientId._id}>
                      <span>{ing.ingredientId.name}</span>
                      <span>{ing.weightInGrams}g</span>
                    </IngredientRow>
                  ))}
                </MealDisplayCard>
              ))
            ) : (
              <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
                No meals logged for today yet.
              </p>
            )}
            <SummaryRow>
              <SummaryItem>
                <h4>{Math.round(dailySummary.calories)}</h4>
                <p>TOTAL KCAL</p>
              </SummaryItem>
              <SummaryItem>
                <h4>{Math.round(dailySummary.protein)}g</h4>
                <p>PROTEIN</p>
              </SummaryItem>
              <SummaryItem>
                <h4>{Math.round(dailySummary.carbs)}g</h4>
                <p>CARBS</p>
              </SummaryItem>
              <SummaryItem>
                <h4>{Math.round(dailySummary.fats)}g</h4>
                <p>FATS</p>
              </SummaryItem>
            </SummaryRow>
          </LogDisplayPanel>
        </PageGrid>
      </AppContainer>
    </>
  );
}

export default NutritionDashboardPage;
