import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getPerformedExercises } from "../api/workout.api";
import { AppContainer, Title } from "../components/common/Styled";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { theme } from "../styles/theme";

const ExerciseList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseItem = styled(Link)`
  display: block;
  text-decoration: none;
  background: ${theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 5px solid ${theme.colors.secondary};
  transition: all 0.2s ease-in-out;
  color: ${theme.colors.text};
  font-size: 1.2rem;
  font-weight: 500;

  &:hover {
    transform: translateX(5px);
    border-left-color: ${theme.colors.accent};
  }
`;

function ExerciseHistoryListPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformedExercises().then((data) => {
      setExercises(data.sort()); // Sort alphabetically
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <AppContainer style={{ justifyContent: "center" }}>
        <LoadingSpinner />
      </AppContainer>
    );

  return (
    <AppContainer>
      <Title>Exercise Progress</Title>
      <p
        style={{
          textAlign: "center",
          color: theme.colors.textMuted,
          marginTop: "-1rem",
          marginBottom: "2rem",
        }}
      >
        Select an exercise to view your progressive overload charts.
      </p>
      <ExerciseList>
        {exercises.length === 0 ? (
          <p>You haven't logged any exercises yet.</p>
        ) : (
          exercises.map((name) => (
            <ExerciseItem
              key={name}
              to={`/history/exercise/${encodeURIComponent(name)}`}
            >
              {name}
            </ExerciseItem>
          ))
        )}
      </ExerciseList>
    </AppContainer>
  );
}

export default ExerciseHistoryListPage;
