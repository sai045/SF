import React, { useState } from "react";
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
import { logSteps } from "../api/activity.api";
import { theme } from "../styles/theme";
import {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [steps, setSteps] = useState("");

  const handleOpenModal = (mealType) => {
    setSelectedMealType(mealType);
    setIsModalOpen(true);
  };

  const handleMealLogged = (response) => {
    alert(response.message);
    updateUserStats(response.updatedUserStatus);
  };

  const handleLogSteps = async (e) => {
    e.preventDefault();
    const stepCount = parseInt(steps, 10);
    if (isNaN(stepCount) || stepCount < 0) {
      alert("Please enter a valid number of steps.");
      return;
    }
    try {
      await logSteps({ stepCount });
      alert(`${stepCount} steps logged for today!`);
      setSteps("");
    } catch (err) {
      alert("Failed to log steps.");
    }
  };

  return (
    <>
      {isModalOpen && (
        <MealLoggerModal
          mealType={selectedMealType}
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
          <MealTypeCard
            color={theme.colors.primary}
            onClick={() => handleOpenModal("Breakfast")}
          >
            <p>
              <FaAppleAlt />
            </p>{" "}
            <h2>Breakfast</h2>
          </MealTypeCard>
          <MealTypeCard
            color={theme.colors.danger}
            onClick={() => handleOpenModal("Lunch")}
          >
            <p>
              <FaDrumstickBite />
            </p>{" "}
            <h2>Lunch</h2>
          </MealTypeCard>
          <MealTypeCard
            color={theme.colors.secondary}
            onClick={() => handleOpenModal("Dinner")}
          >
            <p>
              <FaPizzaSlice />
            </p>{" "}
            <h2>Dinner</h2>
          </MealTypeCard>
          <MealTypeCard
            color={theme.colors.accent}
            onClick={() => handleOpenModal("Snacks")}
          >
            <p>
              <FaGlassWhiskey />
            </p>{" "}
            <h2>Snacks</h2>
          </MealTypeCard>
        </MealGrid>
      </AppContainer>
    </>
  );
}

export default NutritionDashboardPage;
