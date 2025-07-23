import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createCustomWorkout } from "../api/workout.api";
import {
  AppContainer,
  Title,
  FormCard,
  Input,
  Button,
} from "../components/common/Styled";
import { theme } from "../styles/theme";
import { FaPlus, FaTrash } from "react-icons/fa";

const ExerciseForm = styled.div`
  background: ${theme.colors.cardBackground};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ExerciseRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
`;

function WorkoutBuilderPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", rest: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleExerciseChange = (index, event) => {
    const values = [...exercises];
    values[index][event.target.name] = event.target.value;
    setExercises(values);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", rest: "" }]);
  };

  const handleRemoveExercise = (index) => {
    const values = [...exercises];
    values.splice(index, 1);
    setExercises(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCustomWorkout({ name, description, exercises });
      navigate("/workouts");
    } catch (error) {
      toast("Failed to create workout. Please check all fields.");
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Title>Create Custom Workout</Title>
      <FormCard as="form" onSubmit={handleSubmit} style={{ maxWidth: "900px" }}>
        <label>Workout Name</label>
        <Input
          type="text"
          placeholder="e.g., Intense Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Description (Optional)</label>
        <Input
          type="text"
          placeholder="A short description of the workout"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h3
          style={{
            marginTop: "2rem",
            marginBottom: "1rem",
            color: theme.colors.text,
          }}
        >
          Exercises
        </h3>
        {exercises.map((exercise, index) => (
          <ExerciseForm key={index}>
            <ExerciseRow>
              <Input
                type="text"
                placeholder="Exercise Name"
                name="name"
                value={exercise.name}
                onChange={(e) => handleExerciseChange(index, e)}
                required
                style={{ margin: 0 }}
              />
              <Input
                type="number"
                placeholder="Sets"
                name="sets"
                value={exercise.sets}
                onChange={(e) => handleExerciseChange(index, e)}
                required
                style={{ margin: 0 }}
              />
              <Input
                type="text"
                placeholder="Reps"
                name="reps"
                value={exercise.reps}
                onChange={(e) => handleExerciseChange(index, e)}
                required
                style={{ margin: 0 }}
              />
              <Input
                type="number"
                placeholder="Rest (s)"
                name="rest"
                value={exercise.rest}
                onChange={(e) => handleExerciseChange(index, e)}
                required
                style={{ margin: 0 }}
              />
              <Button
                type="button"
                onClick={() => handleRemoveExercise(index)}
                style={{
                  background: theme.colors.danger,
                  width: "auto",
                  padding: "0.8rem",
                }}
              >
                <FaTrash />
              </Button>
            </ExerciseRow>
          </ExerciseForm>
        ))}
        <Button
          type="button"
          onClick={handleAddExercise}
          style={{ background: theme.colors.secondary, marginBottom: "2rem" }}
        >
          <FaPlus /> Add Exercise
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "SAVING..." : "SAVE WORKOUT"}
        </Button>
      </FormCard>
    </AppContainer>
  );
}

export default WorkoutBuilderPage;
