import React from "react";
import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";
import { Button } from "../common/Styled";

const CardContainer = styled.div`
  background: ${theme.colors.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  border-top: 5px solid ${(props) => props.borderColor || theme.colors.primary};
  opacity: ${(props) => (props.status === "completed" ? 0.7 : 1)};
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  span {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }

  h3 {
    margin: 0;
    color: ${(props) => props.color || theme.colors.primary};
    font-size: 1.8rem;
  }
`;

const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const IngredientItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;

  span:first-child {
    color: ${theme.colors.text};
  }
  span:last-child {
    color: ${theme.colors.textMuted};
    font-weight: bold;
  }
`;

const mealTypes = {
  "Pre-Workout": { icon: "🔥", color: "#F39C12" },
  Breakfast: { icon: "🥣", color: "#3498DB" },
  Lunch: { icon: "🍗", color: "#E74C3C" },
  Snacks: { icon: "🍌", color: "#F1C40F" },
  Dinner: { icon: "🍳", color: "#9B59B6" },
};

const MealCard = ({ meal, onLogMeal, loading }) => {
  const { name, ingredients, totalProtein, templateType, status, _id } = meal;
  const typeInfo = mealTypes[templateType] || {
    icon: "🥦",
    color: theme.colors.primary,
  };
  const isCompleted = status === "completed";

  return (
    <CardContainer borderColor={typeInfo.color} status={status}>
      <Header color={typeInfo.color}>
        <span>{typeInfo.icon}</span>
        <h3>{templateType}</h3>
      </Header>
      <IngredientList>
        {ingredients.map((ing, index) => (
          <IngredientItem key={index}>
            <span>
              {ing.name} ({ing.quantity})
            </span>
            <span>{ing.protein.toFixed(1)}g protein</span>
          </IngredientItem>
        ))}
      </IngredientList>
      <Button
        onClick={() => onLogMeal(_id)}
        disabled={isCompleted || loading}
        style={{
          width: "100%",
          backgroundColor: isCompleted
            ? theme.colors.textMuted
            : typeInfo.color,
          color: theme.colors.background,
        }}
      >
        {isCompleted ? "COMPLETED" : "LOG MEAL"}
      </Button>
    </CardContainer>
  );
};

export default MealCard;
