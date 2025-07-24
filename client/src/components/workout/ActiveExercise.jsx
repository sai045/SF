import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { getExerciseHistory } from "../../api/workout.api.js";
import { FaYoutube } from "react-icons/fa";
import StrengthLogger from "./loggers/StrengthLogger";
import TimedLogger from "./loggers/TimedLogger";
import CardioLogger from "./loggers/CardioLogger"; // Import the new logger

const ExerciseCard = styled.div`
  background-color: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  border-top: 5px solid ${theme.colors.primary};
  margin-top: 2rem;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const YoutubeLink = styled.a`
  color: #ff0000;
  font-size: 2.5rem;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.1);
  }
`;

function ActiveExercise({
  exercise,
  onSetUpdate,
  initialLogs,
  masterExercise,
}) {
  const [lastPerformance, setLastPerformance] = useState(null);

  useEffect(() => {
    if (masterExercise?.unit === "per_rep_and_rest") {
      getExerciseHistory(exercise.name)
        .then((data) => setLastPerformance(data))
        .catch((err) => console.error("Could not fetch exercise history", err));
    }
  }, [exercise, masterExercise]);

  const renderLogger = () => {
    if (!masterExercise) return <p>Loading exercise data...</p>;

    // This logic determines which logger UI to show
    if (
      masterExercise.category === "LISS" ||
      masterExercise.category === "HIIT"
    ) {
      return (
        <CardioLogger
          exercise={exercise}
          onSetUpdate={onSetUpdate}
          initialLogs={initialLogs}
          masterExercise={masterExercise}
        />
      );
    }

    switch (masterExercise.unit) {
      case "per_rep_and_rest":
        return (
          <StrengthLogger
            exercise={exercise}
            onSetUpdate={onSetUpdate}
            initialLogs={initialLogs}
            lastPerformance={lastPerformance}
          />
        );
      case "per_minute":
        return (
          <TimedLogger
            exercise={exercise}
            onSetUpdate={onSetUpdate}
            initialLogs={initialLogs}
            masterExercise={masterExercise}
          />
        );
      default:
        return <p>Unsupported exercise type.</p>;
    }
  };

  return (
    <ExerciseCard>
      <ExerciseHeader>
        <h2>{exercise.name}</h2>
        {masterExercise?.youtubeLink && (
          <YoutubeLink
            href={`https://www.youtube.com/watch?v=${masterExercise.youtubeLink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube />
          </YoutubeLink>
        )}
      </ExerciseHeader>
      {renderLogger()}
    </ExerciseCard>
  );
}

export default ActiveExercise;
