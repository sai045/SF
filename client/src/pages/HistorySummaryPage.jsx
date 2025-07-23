import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getHistoricalSummary } from "../api/activity.api.js";
import { AppContainer, Title } from "../components/common/Styled";
import { theme } from "../styles/theme";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const HistoryContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryCard = styled.div`
  background: ${theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 6px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;
  gap: 1rem;
  text-align: center;
  border-left: 5px solid
    ${(props) => (props.isDeficit ? theme.colors.primary : theme.colors.danger)};
`;

const DateDisplay = styled.div`
  text-align: left;
  h3 {
    color: ${theme.colors.text};
    font-size: 1.2rem;
    margin: 0;
    font-family: ${theme.fonts.body};
  }
  p {
    color: ${theme.colors.textMuted};
    margin: 0;
    font-size: 0.9rem;
  }
`;

const CalorieValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  font-family: ${theme.fonts.heading};
  color: ${(props) => props.color || theme.colors.text};
`;

function HistorySummaryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoricalSummary()
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
        <LoadingSpinner />
      </AppContainer>
    );

  return (
    <AppContainer>
      <Title>Daily Summary History</Title>
      <HistoryContainer>
        {history.length === 0 && (
          <p style={{ textAlign: "center" }}>
            No finalized daily summaries found. The first summary will appear
            tomorrow after the daily job runs.
          </p>
        )}

        {/* Header Row */}
        <SummaryCard
          style={{
            background: "transparent",
            paddingBottom: "0.5rem",
            border: "none",
            borderBottom: `2px solid ${theme.colors.cardBackgroundSolid}`,
          }}
        >
          <p style={{ textAlign: "left", color: theme.colors.textMuted }}>
            DATE
          </p>
          <p style={{ color: theme.colors.textMuted }}>CAL IN</p>
          <p style={{ color: theme.colors.textMuted }}>CAL OUT</p>
          <p style={{ color: theme.colors.textMuted }}>BALANCE</p>
        </SummaryCard>

        {history.map((log) => {
          const { caloriesIn, caloriesOut, finalBalance } = log.calorieBalance;
          const isDeficit = finalBalance <= 0;
          return (
            <SummaryCard key={log._id} isDeficit={isDeficit}>
              <DateDisplay>
                <h3>
                  {new Date(log.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p>
                  {new Date(log.date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </p>
              </DateDisplay>
              <CalorieValue color={theme.colors.text}>
                {Math.round(caloriesIn)}
              </CalorieValue>
              <CalorieValue color={theme.colors.text}>
                {Math.round(caloriesOut)}
              </CalorieValue>
              <CalorieValue
                color={isDeficit ? theme.colors.primary : theme.colors.danger}
              >
                {finalBalance > 0 ? "+" : ""}
                {Math.round(finalBalance)}
              </CalorieValue>
            </SummaryCard>
          );
        })}
      </HistoryContainer>
    </AppContainer>
  );
}

export default HistorySummaryPage;
