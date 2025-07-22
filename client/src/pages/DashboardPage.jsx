import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppContainer, SystemMessageCard } from "../components/common/Styled";
import styled from "styled-components";
import { theme } from "../styles/theme";
import plannerService from "../api/planner.api";
import DailyQuestItem from "../components/planner/DailyQuestItem";
// You might still want to import EXPBar and other stats components for a header

const PlannerHeader = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
  }

  p {
    margin: 0.5rem 0 0;
  }
`;

const QuestList = styled.div`
  margin-top: 1.5rem;
`;

const NextAction = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
  background: linear-gradient(
    90deg,
    rgba(142, 68, 173, 0.2),
    rgba(0, 168, 255, 0.2)
  );
  border-radius: 4px;
  font-weight: bold;
  color: ${theme.colors.text};

  span {
    color: ${theme.colors.accent};
  }
`;

const LoadingSpinner = styled.div`
  /* A simple CSS spinner */
  font-size: 2rem;
  text-align: center;
  font-family: ${theme.fonts.heading};
`;

function DashboardPage() {
  const { user } = useAuth();
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        const data = await plannerService.getTodaysPlan();
        setPlannerData(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch daily quests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlanner();
  }, []);

  return (
    <AppContainer>
      <SystemMessageCard>
        {loading && <LoadingSpinner>[ SYSTEM LOADING... ]</LoadingSpinner>}
        {error && <div>{error}</div>}

        {plannerData && (
          <>
            <PlannerHeader>
              <h2>[ DAILY QUESTS ] - {plannerData.date}</h2>
              <p>Welcome, {user.username}. Complete these tasks to gain EXP.</p>
            </PlannerHeader>

            <h3>Today's Workout</h3>
            <QuestList>
              {plannerData.dailyWorkout ? (
                <DailyQuestItem
                  type="workout"
                  data={plannerData.dailyWorkout}
                />
              ) : (
                <p>You have a rest day. Focus on recovery, Hunter.</p>
              )}
            </QuestList>

            <h3>Nutrition Log</h3>
            <QuestList>
              {plannerData.dailyMeals.map((meal) => (
                <DailyQuestItem key={meal.name} type="meal" data={meal} />
              ))}
            </QuestList>

            {plannerData.nextBestAction && (
              <NextAction>
                ▶ Next Action: <span>{plannerData.nextBestAction}</span>
              </NextAction>
            )}
          </>
        )}
      </SystemMessageCard>
    </AppContainer>
  );
}

export default DashboardPage;
