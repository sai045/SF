import React from "react";
import { Link } from "react-router-dom";
import { AppContainer, Title, Button } from "../components/common/Styled";
import styled from "styled-components";
import { theme } from "../styles/theme";

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
`;

function HistoryPage() {
  return (
    <AppContainer>
      <Title>History & Logbooks</Title>
      <p
        style={{
          textAlign: "center",
          color: theme.colors.textMuted,
          marginTop: "-1rem",
          marginBottom: "2rem",
        }}
      >
        Review your past performance and track your progress.
      </p>
      <ButtonGrid>
        <Link to="/history/workouts" style={{ textDecoration: "none" }}>
          <Button style={{ width: "100%", padding: "1.5rem" }}>
            Workout Logbook
          </Button>
        </Link>
        <Link to="/history/exercises" style={{ textDecoration: "none" }}>
          <Button
            style={{
              width: "100%",
              padding: "1.5rem",
              background: theme.colors.secondary,
            }}
          >
            Exercise Progress
          </Button>
        </Link>
        <Link to="/history/summary" style={{ textDecoration: "none" }}>
          <Button
            style={{
              width: "100%",
              padding: "1.5rem",
              background: theme.colors.accent,
              color: theme.colors.background,
            }}
          >
            Daily Summaries
          </Button>
        </Link>
      </ButtonGrid>
    </AppContainer>
  );
}

export default HistoryPage;
