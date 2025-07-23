import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkout, logWorkout } from "../api/workout.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AppContainer,
  Title,
  Button,
  ErrorMessage,
} from "../components/common/Styled";
import ActiveExercise from "../components/workout/ActiveExercise";
import RestTimer from "../components/workout/RestTimer";
import styled from "styled-components";
import { theme } from "../styles/theme";

const WorkoutContainer = styled.div`
  width: 100%;
  max-width: 800px;
`;

const WorkoutNav = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const WorkoutTitle = styled(Title)`
  color: ${theme.colors.text};
`;

function WorkoutPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { updateUserStats } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const data = await getWorkout(workoutId);
        setWorkout(data);
        setStartTime(new Date());
      } catch (err) {
        setError("Failed to load workout details.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [workoutId]);

  const handleSetComplete = (logData) => {
    setWorkoutLogs([...workoutLogs, logData]);
    const currentExercise = workout.exercises[currentExerciseIndex];
    setIsResting(true);
    setRestDuration(currentExercise.rest);
  };

  const handleRestFinished = () => {
    setIsResting(false);
    setRestDuration(0);
  };

  const handleFinishWorkout = async () => {
    setSubmitting(true);
    setError("");
    const endTime = new Date();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    const payload = {
      workoutId,
      duration: durationSeconds,
      setsLogged: workoutLogs,
    };

    try {
      const response = await logWorkout(payload);
      updateUserStats(response.updatedUserStatus);
      alert(response.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log workout.");
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <AppContainer>
        <h2>[ SYSTEM LOADING WORKOUT... ]</h2>
      </AppContainer>
    );
  if (error && !workout)
    return (
      <AppContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </AppContainer>
    );
  if (!workout)
    return (
      <AppContainer>
        <h2>Workout not found.</h2>
      </AppContainer>
    );

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  return (
    <AppContainer>
      <WorkoutContainer>
        {isResting && (
          <RestTimer duration={restDuration} onFinish={handleRestFinished} />
        )}

        <WorkoutTitle>
          {workout.name} ({currentExerciseIndex + 1}/{workout.exercises.length})
        </WorkoutTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ActiveExercise
          exercise={currentExercise}
          onSetComplete={handleSetComplete}
        />

        <WorkoutNav>
          <Button
            disabled={currentExerciseIndex === 0 || submitting}
            onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          >
            PREVIOUS
          </Button>
          {isLastExercise ? (
            <Button
              style={{ backgroundColor: theme.colors.accent }}
              onClick={handleFinishWorkout}
              disabled={submitting}
            >
              {submitting ? "LOGGING..." : "FINISH WORKOUT"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
              disabled={submitting}
            >
              NEXT EXERCISE
            </Button>
          )}
        </WorkoutNav>
      </WorkoutContainer>
    </AppContainer>
  );
}

export default WorkoutPage;
