import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getWorkoutSession,
  updateWorkoutSession,
  finishWorkoutSession,
} from "../api/session.api.js";
import {
  AppContainer,
  Title,
  Button,
  ErrorMessage,
} from "../components/common/Styled";
import ActiveExercise from "../components/workout/ActiveExercise";
import RestTimer from "../components/workout/RestTimer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import styled from "styled-components";
import { theme } from "../styles/theme";
import { playSuccessSound } from "../utils/sounds.js";

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
  text-align: center;
`;

const LoadingContainer = styled(AppContainer)`
  justify-content: center;
`;

// A simple debounce utility to prevent spamming the update API
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

function WorkoutPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { updateUserStats } = useAuth();

  const [session, setSession] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);

  const debouncedUpdateSession = useCallback(
    debounce(async (sessionId, logs) => {
      try {
        await updateWorkoutSession(sessionId, logs);
      } catch (err) {
        console.error("Failed to sync session progress:", err);
        // In a real app, you'd show a "Sync failed" toast here
      }
    }, 1500),
    []
  );

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const data = await getWorkoutSession(sessionId);
        setSession(data);
        setWorkout(data.workoutId);
        setWorkoutLogs(data.setsLogged || []);
      } catch (err) {
        setError(
          "Failed to load workout session. It may have been completed or does not exist."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  // --- CORRECTED LOGIC ---
  const handleSetUpdate = (updatedSetLog) => {
    const existingLogIndex = workoutLogs.findIndex(
      (log) =>
        log.exerciseName === updatedSetLog.exerciseName &&
        log.setNumber === updatedSetLog.setNumber
    );

    let newLogs = [...workoutLogs];
    const wasPreviouslyLogged = existingLogIndex > -1;

    if (wasPreviouslyLogged) {
      // If it exists, update it.
      newLogs[existingLogIndex] = updatedSetLog;
    } else {
      // If it's new, add it.
      newLogs.push(updatedSetLog);
    }

    // Always update the component's state with the new logs array.
    setWorkoutLogs(newLogs);

    // Always call the debounced function to save progress to the backend.
    debouncedUpdateSession(sessionId, newLogs);

    // Only trigger the sound and rest timer if the set was newly logged (not an edit).
    if (!wasPreviouslyLogged) {
      playSuccessSound();
      if (!isResting) {
        const currentExercise = workout.exercises[currentExerciseIndex];
        setIsResting(true);
        setRestDuration(currentExercise.rest);
      }
    }
  };

  const handleRestFinished = () => {
    setIsResting(false);
    setRestDuration(0);
  };

  const handleFinishWorkout = async () => {
    if (workoutLogs.length === 0) {
      alert(
        "You haven't logged any sets. Please log at least one set before finishing."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateWorkoutSession(sessionId, workoutLogs);
      const response = await finishWorkoutSession(sessionId);

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
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  if (error || !workout)
    return (
      <AppContainer>
        <ErrorMessage>{error || "Workout not found."}</ErrorMessage>
      </AppContainer>
    );

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  const logsForCurrentExercise = workoutLogs.filter(
    (log) => log.exerciseName === currentExercise.name
  );

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
          onSetUpdate={handleSetUpdate}
          initialLogs={logsForCurrentExercise}
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
              {submitting ? "LOGGING..." : "FINISH & LOG WORKOUT"}
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
