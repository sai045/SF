import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../styles/theme";
import { Button, Input } from "../../common/Styled";
import { FaPlay, FaCheck, FaEdit } from "react-icons/fa";

const TimedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const CompletedDisplay = styled.div`
  width: 100%;
  text-align: center;
  padding: 2rem;
  background-color: rgba(0, 168, 255, 0.1);
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimedInput = styled(Input)`
  width: 100px;
  margin: 0;
  text-align: center;
`;

const SelectUnit = styled.select`
  width: 100px;
  padding: 0.8rem 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  color: ${theme.colors.text};
  font-size: 1rem;
`;

function TimedLogger({ exercise, onSetUpdate, initialLogs, exerciseIndex }) {
  const isLogged = initialLogs.length > 0;
  const loggedData = isLogged ? initialLogs[0] : null;

  const parseReps = (repsString) => {
    if (!repsString) return { duration: 60, unit: "s" };
    const duration = parseFloat(repsString) || 60;
    const unit = repsString.includes("min") ? "min" : "s";
    return { duration, unit };
  };

  const [duration, setDuration] = useState(
    parseReps(isLogged ? loggedData.reps : exercise.reps).duration
  );
  const [unit, setUnit] = useState(
    parseReps(isLogged ? loggedData.reps : exercise.reps).unit
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false); // Reset edit state when exercise changes
  }, [exercise]);

  const handleLog = () => {
    onSetUpdate({
      exerciseName: exercise.name,
      setNumber: 1, // Timed exercises are one set
      weight: 0,
      reps: `${duration}${unit}`,
      exerciseIndex
    });
    setIsEditing(false);
  };

  if (isLogged && !isEditing) {
    return (
      <CompletedDisplay>
        <span>
          <FaCheck /> Completed: {loggedData.reps}
        </span>
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
        Target: {exercise.reps}
      </p>
      <TimedRow>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <TimedInput
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <SelectUnit value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="s">Seconds</option>
            <option value="min">Minutes</option>
          </SelectUnit>
        </div>
        <Button
          onClick={handleLog}
          style={{ width: "auto", padding: "1rem 2rem" }}
        >
          <FaPlay /> {isLogged ? "UPDATE LOG" : "LOG"}
        </Button>
      </TimedRow>
    </div>
  );
}

export default TimedLogger;
