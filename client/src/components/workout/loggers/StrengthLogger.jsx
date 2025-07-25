import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Input, Button } from "../../common/Styled";
import { theme } from "../../../styles/theme";
import { FaEdit, FaCheck } from "react-icons/fa";

const LastPerformance = styled.p`
  /* ... same as before ... */
`;

const SetRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.isBodyweight ? "auto 1fr auto" : "auto 1fr 1fr auto"};
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${(props) =>
    props.isLogged ? `rgba(0, 168, 255, 0.1)` : "rgba(0,0,0,0.2)"};
  border-left: 3px solid
    ${(props) => (props.isLogged ? theme.colors.primary : "transparent")};
  border-radius: 4px;
  transition: all 0.2s ease-in-out;

  span {
    font-weight: bold;
    min-width: 60px;
    font-size: 1.2rem;
  }
`;

const SetInput = styled(Input)`
  width: 100%;
  margin: 0;
  text-align: center;
  &:disabled {
    background-color: transparent;
    border-color: transparent;
    color: ${theme.colors.text};
  }
`;

const LogButton = styled(Button)`
  width: auto;
  padding: 0.8rem 1.5rem;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

function StrengthLogger({
  exercise,
  onSetUpdate,
  initialLogs,
  lastPerformance,
  masterExercise,
  exerciseIndex,
}) {
  const [setsData, setSetsData] = useState([]);
  const isBodyweight = masterExercise?.isBodyweight || false;

  useEffect(() => {
    const initialSets = Array.from({ length: exercise.sets }, (_, i) => {
      const setNumber = i + 1;
      const existingLog = initialLogs.find(
        (log) => log.setNumber === setNumber
      );
      return {
        setNumber: setNumber,
        weight: existingLog?.weight ?? (isBodyweight ? "0" : ""),
        reps: existingLog?.reps || "",
        isLogged: !!existingLog,
      };
    });
    setSetsData(initialSets);
  }, [exercise, initialLogs, isBodyweight]);

  const handleInputChange = (index, field, value) => {
    const newSetsData = [...setsData];
    newSetsData[index][field] = value;
    setSetsData(newSetsData);
  };

  const handleToggleLog = (index) => {
    const newSetsData = [...setsData];
    const currentSet = newSetsData[index];

    // This toggles the 'isLogged' state for editing.
    const isNowEditing = currentSet.isLogged;

    if (isNowEditing) {
      // If user clicks "Edit", just unlock the fields.
      currentSet.isLogged = false;
      setSetsData(newSetsData);
    } else {
      // If user clicks "Log Set", validate and save.
      const reps = parseInt(currentSet.reps, 10);
      const weight = parseFloat(currentSet.weight);

      if (isNaN(reps) || reps < 0) {
        alert("Please enter a valid number for reps.");
        return;
      }
      if (!isBodyweight && (isNaN(weight) || weight < 0)) {
        alert("Please enter a valid number for weight.");
        return;
      }

      currentSet.isLogged = true;
      setSetsData(newSetsData);

      onSetUpdate({
        exerciseName: exercise.name,
        setNumber: currentSet.setNumber,
        weight: isBodyweight ? currentSet.weight || 0 : currentSet.weight,
        reps: currentSet.reps,
        exerciseIndex: exerciseIndex,
      });
    }
  };

  return (
    <div>
      {lastPerformance && (
        <LastPerformance>
          Last time:{" "}
          {lastPerformance.weight > 0 ? `${lastPerformance.weight}kg x ` : ""}
          {lastPerformance.reps} reps
        </LastPerformance>
      )}
      <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
        Target Reps: {exercise.reps} | Rest: {exercise.rest}s
      </p>

      <div>
        {setsData.map((set, index) => (
          <SetRow
            key={index}
            isLogged={set.isLogged}
            isBodyweight={isBodyweight}
          >
            <span>Set {set.setNumber}</span>
            {!isBodyweight && (
              <SetInput
                type="number"
                placeholder="kg"
                value={set.weight}
                onChange={(e) =>
                  handleInputChange(index, "weight", e.target.value)
                }
                disabled={set.isLogged}
              />
            )}
            <SetInput
              type="number"
              placeholder="reps"
              value={set.reps}
              onChange={(e) => handleInputChange(index, "reps", e.target.value)}
              disabled={set.isLogged}
            />
            <LogButton
              onClick={() => handleToggleLog(index)}
              disabled={
                !set.isLogged && ((!isBodyweight && !set.weight) || !set.reps)
              }
              style={{
                backgroundColor: set.isLogged
                  ? theme.colors.accent
                  : theme.colors.primary,
              }}
            >
              {set.isLogged ? (
                <>
                  <FaEdit /> EDIT
                </>
              ) : (
                <>
                  <FaCheck /> LOG SET
                </>
              )}
            </LogButton>
          </SetRow>
        ))}
      </div>
    </div>
  );
}

export default StrengthLogger;
