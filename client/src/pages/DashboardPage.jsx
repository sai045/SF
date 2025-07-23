import React from "react";
import { useAuth } from "../context/AuthContext";
import { AppContainer, Title } from "../components/common/Styled";
import DailyQuestItem from "../components/planner/DailyQuestItem";
import styled from "styled-components";
import { theme } from "../styles/theme";
import HabitTracker from "../components/habits/HabitTracker";
import LoadingSpinner from "../components/common/LoadingSpinner";

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
`;

const StatCard = styled.div`
  background: ${theme.colors.cardBackgroundSolid};
  padding: 2rem;
  border-radius: 8px;
  border-left: 5px solid ${(props) => props.color || theme.colors.primary};
`;

const CalorieDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  margin: 2rem 0;

  h2 {
    font-size: 2.5rem;
    margin: 0;
    color: ${theme.colors.text};
  }
  span {
    font-size: 0.8rem;
    color: ${theme.colors.textMuted};
  }
`;

function DashboardPage() {
  // 1. Get all necessary data directly from the context.
  //    This is our single source of truth. No need for extra state here.
  const { user, dashboardSummary } = useAuth();

  // 2. The loading state is now also derived from the context.
  //    If dashboardSummary doesn't exist yet, we show a spinner.
  //    This check happens AFTER all hook calls, which is correct.
  if (!dashboardSummary) {
    return (
      <AppContainer style={{ justifyContent: "center" }}>
        <LoadingSpinner />
      </AppContainer>
    );
  }

  // 3. Destructure the data *after* the loading check.
  const { caloriesIn, estimatedTDEE, todaysWorkoutQuest } = dashboardSummary;
  const balance = caloriesIn - estimatedTDEE;

  return (
    <AppContainer>
      <DashboardGrid>
        <StatCard color={theme.colors.accent}>
          <h2>Today's Status</h2>
          <CalorieDisplay>
            <div>
              <h2>{caloriesIn}</h2>
              <span>CAL IN</span>
            </div>
            <h2>-</h2>
            <div>
              <h2>{estimatedTDEE}</h2>
              <span>CAL OUT</span>
            </div>
            <h2>=</h2>
            <div
              style={{
                color: balance > 0 ? theme.colors.danger : theme.colors.primary,
              }}
            >
              <h2 style={{ color: "inherit" }}>{balance}</h2>
              <span>BALANCE</span>
            </div>
          </CalorieDisplay>
        </StatCard>

        <StatCard color={theme.colors.primary}>
          <h2>[ Daily Quests ]</h2>
          {todaysWorkoutQuest ? (
            <DailyQuestItem type="workout" data={todaysWorkoutQuest} />
          ) : (
            <p>No workout scheduled for today. Focus on recovery.</p>
          )}
          <DailyQuestItem
            type="meal"
            data={{ name: "Log Today's Meals", status: "pending" }}
          />
          <DailyQuestItem
            type="activity"
            data={{
              name: `Log ${user.personalGoals?.dailyStepGoal || 8000} Steps`,
              status: "pending",
            }}
          />
        </StatCard>

        <StatCard color={theme.colors.secondary}>
          <h2>[ Habit Tracker ]</h2>
          <HabitTracker />
        </StatCard>
      </DashboardGrid>
    </AppContainer>
  );
}

export default DashboardPage;
