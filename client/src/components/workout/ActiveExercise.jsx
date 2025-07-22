import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Input, Button } from "../common/Styled";
import { theme } from "../../styles/theme";

const ExerciseCard = styled.div`
  background-color: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  border-top: 5px solid ${theme.colors.primary};
  margin-top: 2rem;
`;

const SetRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${(props) =>
    props.isLogged ? `rgba(0, 168, 255, 0.1)` : "rgba(0,0,0,0.2)"};
  border-radius: 4px;

  span {
    font-weight: bold;
    min-width: 60px;
  }
`;

const SetInput = styled(Input)`
  width: 80px;
  margin: 0 1rem;
  text-align: center;
`;

function ActiveExercise({ exercise, onSetComplete }) {
  const [setsData, setSetsData] = useState([]);

  useEffect(() => {
    // Initialize state for each set
    const initialSets = Array.from({ length: exercise.sets }, (_, i) => ({
      setNumber: i + 1,
      weight: "",
      reps: "",
      isLogged: false,
    }));
    setSetsData(initialSets);
  }, [exercise]);

  const handleInputChange = (index, field, value) => {
    const newSetsData = [...setsData];
    newSetsData[index][field] = value;
    setSetsData(newSetsData);
  };

  const handleLogSet = (index) => {
    const newSetsData = [...setsData];
    newSetsData[index].isLogged = true;
    setSetsData(newSetsData);

    // Pass the completed set data up to the parent WorkoutPage
    onSetComplete({
      exerciseName: exercise.name,
      ...newSetsData[index],
    });
  };

  return (
    <ExerciseCard>
      <h2>{exercise.name}</h2>
      <p>
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
            <Button
              onClick={() => handleLogSet(index)}
              disabled={set.isLogged || !set.weight || !set.reps}
              style={{ width: "120px" }}
            >
              {set.isLogged ? "LOGGED" : "LOG SET"}
            </Button>
          </SetRow>
        ))}
      </div>
    </ExerciseCard>
  );
}

export default ActiveExercise;
