import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardData } from "../api/planner.api";
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
  const { user, logout, dashboardSummary } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!dashboardSummary)
    return (
      <AppContainer>
        <LoadingSpinner />
      </AppContainer>
    );

  useEffect(() => {
    getDashboardData()
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          logout();
        } else {
          // Handle other errors (e.g., show a notification)
          console.error("Failed to load dashboard data:", err);
        }
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <AppContainer>
        <h2>[ SYSTEM LOADING DASHBOARD... ]</h2>
      </AppContainer>
    );
  if (!dashboardData)
    return (
      <AppContainer>
        <h2>Could not load dashboard data.</h2>
      </AppContainer>
    );

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
