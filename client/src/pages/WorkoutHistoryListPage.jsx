import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getWorkoutHistoryList } from "../api/workout.api";
import { AppContainer, Title } from "../components/common/Styled";
import { theme } from "../styles/theme";
import { FaCrown } from "react-icons/fa";

const HistoryList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled(Link)`
  display: block;
  text-decoration: none;
  background: ${theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 5px solid
    ${(props) => (props.isBoss ? theme.colors.danger : theme.colors.primary)};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${theme.glow};
  }

  h3 {
    color: ${theme.colors.text};
    font-family: ${theme.fonts.body};
    font-weight: 500;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: ${theme.colors.textMuted};
    margin: 0.25rem 0 0 0;
  }
`;

function WorkoutHistoryListPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutHistoryList()
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <AppContainer>
        <h2>Loading Logbook...</h2>
      </AppContainer>
    );

  return (
    <AppContainer>
      <Title>Workout Logbook</Title>
      <HistoryList>
        {history.length === 0 && <p>You haven't logged any workouts yet.</p>}
        {history.map((log) => (
          <HistoryItem
            key={log._id}
            to={`/history/workouts/${log._id}`}
            isBoss={log.workoutId.type === "Boss Battle"}
          >
            <h3>
              {log.workoutId.type === "Boss Battle" && (
                <FaCrown color={theme.colors.danger} />
              )}
              {log.workoutId.name}
            </h3>
            <p>
              {new Date(log.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </HistoryItem>
        ))}
      </HistoryList>
    </AppContainer>
  );
}

export default WorkoutHistoryListPage;
