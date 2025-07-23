import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Input, Button } from "../common/Styled";
import { theme } from "../../styles/theme";
import { getExerciseHistory } from "../../api/workout.api.js";
import { FaEdit, FaCheck } from "react-icons/fa";

const ExerciseCard = styled.div`
  background-color: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  border-top: 5px solid ${theme.colors.primary};
  margin-top: 2rem;
`;

const LastPerformance = styled.p`
  color: ${theme.colors.accent};
  background: rgba(241, 196, 15, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
`;

const SetRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  width: 80px;
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

function ActiveExercise({ exercise, onSetUpdate, initialLogs }) {
  const [setsData, setSetsData] = useState([]);
  const [lastPerformance, setLastPerformance] = useState(null);

  useEffect(() => {
    getExerciseHistory(exercise.name)
      .then((data) => setLastPerformance(data))
      .catch((err) => console.error("Could not fetch exercise history", err));

    // Initialize sets, using existing logs if provided (for editing a workout in progress)
    const initialSets = Array.from({ length: exercise.sets }, (_, i) => {
      const existingLog = initialLogs.find((log) => log.setNumber === i + 1);
      return {
        setNumber: i + 1,
        weight: existingLog?.weight || "",
        reps: existingLog?.reps || "",
        isLogged: !!existingLog,
      };
    });
    setSetsData(initialSets);
  }, [exercise, initialLogs]);

  const handleInputChange = (index, field, value) => {
    const newSetsData = [...setsData];
    newSetsData[index][field] = value;
    setSetsData(newSetsData);
  };

  const handleToggleLog = (index) => {
    const newSetsData = [...setsData];
    const currentSet = newSetsData[index];

    // If toggling to "logged" state, validate first
    if (!currentSet.isLogged) {
      const weight = parseFloat(currentSet.weight);
      const reps = parseInt(currentSet.reps, 10);
      if (isNaN(weight) || isNaN(reps) || weight < 0 || reps < 0) {
        toast("Please enter valid numbers for weight and reps.");
        return;
      }
    }

    // Toggle the logged state
    currentSet.isLogged = !currentSet.isLogged;
    setSetsData(newSetsData);

    // Inform the parent component (WorkoutPage) of the update
    onSetUpdate({
      exerciseName: exercise.name,
      setNumber: currentSet.setNumber,
      weight: currentSet.weight,
      reps: currentSet.reps,
    });
  };

  return (
    <ExerciseCard>
      <h2>{exercise.name}</h2>
      {lastPerformance && (
        <LastPerformance>
          Last time: {lastPerformance.weight}kg x {lastPerformance.reps} reps
        </LastPerformance>
      )}
      <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
        Target Reps: {exercise.reps} | Rest: {exercise.rest}s
      </p>

      <div>
        {setsData.map((set, index) => (
          <SetRow key={index} isLogged={set.isLogged}>
            <span>Set {set.setNumber}</span>
            <SetInput
              type="number"
              placeholder="kg"
              value={set.weight}
              onChange={(e) =>
                handleInputChange(index, "weight", e.target.value)
              }
              disabled={set.isLogged}
            />
            <SetInput
              type="number"
              placeholder="reps"
              value={set.reps}
              onChange={(e) => handleInputChange(index, "reps", e.target.value)}
              disabled={set.isLogged}
            />
            <LogButton
              onClick={() => handleToggleLog(index)}
              disabled={!set.isLogged && (!set.weight || !set.reps)}
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
    </ExerciseCard>
  );
}

export default ActiveExercise;
