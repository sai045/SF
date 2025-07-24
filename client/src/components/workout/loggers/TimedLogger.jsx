import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../styles/theme";
import { Button, Input } from "../../common/Styled";
import { FaPlay, FaCheck } from "react-icons/fa";

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

function TimedLogger({ exercise, onSetUpdate, initialLogs }) {
  const isLogged = initialLogs.length > 0;

  // Parse the initial 'reps' string like "60s" or "5 min"
  const initialDuration = parseFloat(exercise.reps) || 60;
  const initialUnit = exercise.reps.includes("min") ? "min" : "s";

  const [duration, setDuration] = useState(initialDuration);
  const [unit, setUnit] = useState(initialUnit);

  const handleLog = () => {
    onSetUpdate({
      exerciseName: exercise.name,
      setNumber: 1, // Timed exercises are one set
      weight: 0,
      reps: `${duration}${unit}`,
    });
  };

  return (
    <div>
      <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
        Target: {exercise.reps}
      </p>

      {isLogged ? (
        <CompletedDisplay>
          <FaCheck /> Completed: {initialLogs[0].reps}
        </CompletedDisplay>
      ) : (
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
            <FaPlay /> LOG
          </Button>
        </TimedRow>
      )}
    </div>
  );
}

export default TimedLogger;
