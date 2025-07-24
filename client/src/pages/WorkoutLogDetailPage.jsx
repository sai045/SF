import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getWorkoutLogDetails } from "../api/workout.api";
import { AppContainer, Title } from "../components/common/Styled";
import { theme } from "../styles/theme";
import { FaCrown, FaStar } from "react-icons/fa";

const DetailContainer = styled.div`
  width: 100%;
  max-width: 800px;
`;

const Header = styled.div`
  background: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
`;

const ExerciseGroup = styled.div`
  margin-bottom: 2rem;
  h3 {
    color: ${theme.colors.primary};
    border-bottom: 2px solid ${theme.colors.cardBackgroundSolid};
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }
`;

const SetRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 1fr;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;

  &:nth-child(odd) {
    background: ${theme.colors.cardBackground};
  }
`;

const formatWeight = (weight) => {
  // If it's a number (or a string that can be a number), it's strength training
  if (typeof weight === "number" || !isNaN(parseFloat(weight))) {
    // Bodyweight exercises might be logged as 0, don't show "0 kg"
    return parseFloat(weight) > 0 ? `${weight} kg` : "Bodyweight";
  }
  // If it's an object, it's our cardio data
  if (typeof weight === "object" && weight !== null) {
    return `${weight.speed} km/h | ${weight.incline}%`;
  }
  // Fallback for any other case
  return "N/A";
};

function WorkoutLogDetailPage() {
  const { logId } = useParams();
  const [logDetails, setLogDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutLogDetails(logId)
      .then((data) => {
        setLogDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [logId]);

  const exercisesGrouped = useMemo(() => {
    if (!logDetails) return {};
    // Group sets by exercise name
    return logDetails.setsLogged.reduce((acc, set) => {
      (acc[set.exerciseName] = acc[set.exerciseName] || []).push(set);
      return acc;
    }, {});
  }, [logDetails]);

  if (loading)
    return (
      <AppContainer>
        <h2>Loading Log Details...</h2>
      </AppContainer>
    );
  if (!logDetails)
    return (
      <AppContainer>
        <h2>Workout Log Not Found.</h2>
      </AppContainer>
    );

  const { workoutId, date, duration } = logDetails;

  return (
    <AppContainer>
      <DetailContainer>
        <Header>
          <Title
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {workoutId.type === "Boss Battle" && (
              <FaCrown color={theme.colors.danger} />
            )}
            {workoutId.name}
          </Title>
          <p>
            {new Date(date).toLocaleDateString("en-US", { dateStyle: "full" })}
          </p>
          <p>
            Duration: {Math.floor(duration / 60)}m {duration % 60}s
          </p>
        </Header>

        {Object.entries(exercisesGrouped).map(([exerciseName, sets]) => (
          <ExerciseGroup key={exerciseName}>
            <h3>{exerciseName}</h3>
            <div>
              <SetRow
                style={{ color: theme.colors.textMuted, fontWeight: "bold" }}
              >
                <span>SET</span>
                <span>WEIGHT</span>
                <span>REPS</span>
                <span>PR</span>
              </SetRow>
              {sets.map((set) => (
                <SetRow key={set.setNumber}>
                  <span>{set.setNumber}</span>
                  <span>{formatWeight(set.weight)}</span>
                  <span>{set.reps}</span>
                  <span>
                    {set.isPR && <FaStar color={theme.colors.accent} />}
                  </span>
                </SetRow>
              ))}
            </div>
          </ExerciseGroup>
        ))}
      </DetailContainer>
    </AppContainer>
  );
}

export default WorkoutLogDetailPage;
