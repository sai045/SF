import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../styles/theme";
import { Button, Input } from "../../common/Styled";
import { FaPlay, FaCheck, FaEdit } from "react-icons/fa";

const CardioRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TimedInput = styled(Input)`
  width: 120px;
  margin: 0;
  text-align: center;
`;

const Label = styled.label`
  color: ${theme.colors.textMuted};
  margin-right: -0.5rem;
`;

const CompletedDisplay = styled.div`
  width: 100%;
  text-align: center;
  padding: 1.5rem;
  background-color: rgba(0, 168, 255, 0.1);
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

function CardioLogger({ exercise, onSetUpdate, initialLogs, masterExercise }) {
  const isLogged = initialLogs.length > 0;
  // --- THIS IS THE FIX ---
  // Define loggedData at the top level so it's available for state initialization.
  const loggedData = isLogged ? initialLogs[0] : null;

  const [duration, setDuration] = useState(
    isLogged ? parseFloat(loggedData.reps) : parseFloat(exercise.reps) || 10
  );
  const [speed, setSpeed] = useState(
    isLogged && typeof loggedData.weight === "object"
      ? loggedData.weight.speed
      : masterExercise.defaultSpeed_kmph || 6
  );
  const [incline, setIncline] = useState(
    isLogged && typeof loggedData.weight === "object"
      ? loggedData.weight.incline
      : masterExercise.defaultIncline_percent || 2
  );
  // --- END OF FIX ---

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [exercise]);

  const handleLog = () => {
    onSetUpdate({
      exerciseName: exercise.name,
      setNumber: 1,
      weight: {
        speed: parseFloat(speed),
        incline: parseFloat(incline),
      },
      reps: `${duration}min`,
    });
    setIsEditing(false);
  };

  if (isLogged && !isEditing) {
    // We already have loggedData from the top of the component
    const displayData = loggedData.weight;
    return (
      <CompletedDisplay>
        <span>
          <FaCheck /> COMPLETED: {loggedData.reps}
        </span>
        {typeof displayData === "object" && displayData !== null ? (
          <span>
            {displayData.speed} km/h | {displayData.incline}% incline
          </span>
        ) : null}
        <Button
          onClick={() => setIsEditing(true)}
          style={{ width: "auto", background: theme.colors.accent }}
        >
          <FaEdit /> Edit
        </Button>
      </CompletedDisplay>
    );
  }

  return (
    <div>
      <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
        Target: {exercise.reps} at {masterExercise.defaultSpeed_kmph || "N/A"}{" "}
        km/h, {masterExercise.defaultIncline_percent || "N/A"}% incline
      </p>

      <CardioRow>
        <InputGroup>
          <div>
            <Label>Duration</Label>
            <TimedInput
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span>min</span>
          </div>
          <div>
            <Label>Speed</Label>
            <TimedInput
              type="number"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            />
            <span>km/h</span>
          </div>
          <div>
            <Label>Incline</Label>
            <TimedInput
              type="number"
              step="0.1"
              value={incline}
              onChange={(e) => setIncline(e.target.value)}
            />
            <span>%</span>
          </div>
        </InputGroup>
        <Button
          onClick={handleLog}
          style={{ width: "auto", padding: "1rem 2rem" }}
        >
          <FaPlay /> {isLogged ? "UPDATE LOG" : "LOG CARDIO"}
        </Button>
      </CardioRow>
    </div>
  );
}

export default CardioLogger;
