import React, { useState, useEffect } from "react";
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

const MealGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
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

function NutritionDashboardPage() {
  const { user, updateUserStats } = useAuth();
  const [dailyLog, setDailyLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleOpenModal = (mealType) => {
    setSelectedMealType(mealType);
    setIsModalOpen(true);
  };

  const handleMealLogged = (updatedDailyLog) => {
    setDailyLog(updatedDailyLog);
    // Can add logic here to re-calculate and update global calorie state
  };

  const handleLogSteps = async (e) => {
    e.preventDefault();
    const stepCount = parseInt(steps, 10);
    if (isNaN(stepCount) || stepCount < 0) {
      toast("Please enter a valid number of steps.");
      return;
    }
    try {
      await logSteps({ stepCount });
      toast(`${stepCount} steps logged for today!`);
    } catch (err) {
      toast("Failed to log steps.");
    }
  };

  if (loading)
    return (
      <AppContainer>
        <h2>Loading Nutrition Log...</h2>
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

  // Get the ingredients for the selected meal type to pass to the modal
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
        <Title>DAILY LOGGING</Title>
        <FormCard
          as="div"
          style={{ width: "100%", maxWidth: "800px", marginBottom: "2rem" }}
        >
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
            <Button type="submit" style={{ width: "auto", minWidth: "150px" }}>
              LOG STEPS
            </Button>
          </form>
        </FormCard>

        <h2
          style={{
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontWeight: "normal",
          }}
        >
          Log a Meal
        </h2>
        <p
          style={{
            textAlign: "center",
            color: theme.colors.textMuted,
            marginTop: "-1rem",
            marginBottom: "2rem",
          }}
        >
          Select a meal type to start logging ingredients.
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
      </AppContainer>
    </>
  );
}

export default NutritionDashboardPage;
