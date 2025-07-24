import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  updateWorkoutSession,
  finishWorkoutSession,
  getWorkoutSession,
} from "../api/session.api.js";
import { getMasterExerciseList } from "../api/workout.api.js";
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
import { FaPlus } from "react-icons/fa";
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

const AddExerciseContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${theme.colors.cardBackground};
  border-radius: 8px;
  text-align: center;
`;

const SelectExercise = styled.select`
  width: 100%;
  max-width: 400px;
  padding: 0.8rem;
  font-size: 1rem;
  background: ${theme.colors.cardBackgroundSolid};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
`;

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);

  // --- STATE FOR ADDING EXERCISES ---
  const [masterExercises, setMasterExercises] = useState([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [sessionExercises, setSessionExercises] = useState([]);

  const debouncedUpdateSets = useCallback(
    debounce(async (sessionId, logs) => {
      try {
        await updateWorkoutSession(sessionId, { setsLogged: logs });
      } catch (err) {
        console.error("Failed to sync sets:", err);
      }
    }, 1500),
    []
  );

  useEffect(() => {
    const fetchSessionAndMasterData = async () => {
      setLoading(true);
      try {
        // Fetch both session and master list in parallel for speed
        const [sessionData, masterData] = await Promise.all([
          getWorkoutSession(sessionId),
          getMasterExerciseList(),
        ]);

        setSession(sessionData);
        setSessionExercises(sessionData.exercises);
        setWorkoutLogs(sessionData.setsLogged || []);
        setMasterExercises(masterData);
      } catch (err) {
        setError("Failed to load workout session.");
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndMasterData();
  }, [sessionId]);

  const handleSetUpdate = (updatedSetLog) => {
    const existingLogIndex = workoutLogs.findIndex(
      (log) =>
        log.exerciseName === updatedSetLog.exerciseName &&
        log.setNumber === updatedSetLog.setNumber
    );
    let newLogs = [...workoutLogs];
    const wasPreviouslyLogged = existingLogIndex > -1;
    if (wasPreviouslyLogged) newLogs[existingLogIndex] = updatedSetLog;
    else newLogs.push(updatedSetLog);
    setWorkoutLogs(newLogs);
    debouncedUpdateSets(sessionId, newLogs);
    if (!wasPreviouslyLogged && !isResting) {
      const currentExercise = sessionExercises[currentExerciseIndex];
      if (currentExercise.rest > 0) {
        setIsResting(true);
        setRestDuration(currentExercise.rest);
      }
      playSuccessSound();
    }
  };

  const handleAddExerciseToSession = async (exerciseName) => {
    setIsAddingExercise(false); // Close the dropdown immediately
    if (!exerciseName) return;

    const exerciseToAdd = masterExercises.find(
      (ex) => ex.name === exerciseName
    );
    if (!exerciseToAdd) return;

    const newExercise = {
      name: exerciseToAdd.name,
      sets: 3,
      reps: "8-12",
      rest: 60,
    };

    const updatedExercises = [...sessionExercises, newExercise];
    setSessionExercises(updatedExercises); // Optimistic UI update

    try {
      await updateWorkoutSession(sessionId, { exercises: updatedExercises });
    } catch (err) {
      console.error("Failed to add exercise to session:", err);
      setSessionExercises(sessionExercises); // Revert on error
      alert("Error: Could not add exercise. Please try again.");
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
      await updateWorkoutSession(sessionId, {
        setsLogged: workoutLogs,
        exercises: sessionExercises,
      });
      const response = await finishWorkoutSession(sessionId);
      updateUserStats(response.updatedUserStatus);
      alert(response.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log workout.");
      setSubmitting(false);
    }
  };

  if (loading || !session)
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  if (error)
    return (
      <AppContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </AppContainer>
    );

  const currentExercise = sessionExercises[currentExerciseIndex];
  if (!currentExercise)
    return (
      <AppContainer>
        <p>Workout finished or error loading exercises.</p>
      </AppContainer>
    );

  const isLastExercise = currentExerciseIndex === sessionExercises.length - 1;
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
          {session.workoutId.name} ({currentExerciseIndex + 1}/
          {sessionExercises.length})
        </WorkoutTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ActiveExercise
          exercise={currentExercise}
          onSetUpdate={handleSetUpdate}
          initialLogs={logsForCurrentExercise}
          masterExercise={masterExercises.find(
            (ex) => ex.name === currentExercise.name
          )}
        />

        <AddExerciseContainer>
          {isAddingExercise ? (
            <SelectExercise
              onChange={(e) => handleAddExerciseToSession(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Select an exercise to add --</option>
              {masterExercises
                .filter(
                  (ex) => ex.category === "Strength" || ex.category === "Core"
                )
                .map((ex) => (
                  <option key={ex._id} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
            </SelectExercise>
          ) : (
            <Button
              onClick={() => setIsAddingExercise(true)}
              style={{
                background: theme.colors.secondary,
                width: "auto",
                padding: "1rem 2rem",
              }}
            >
              <FaPlus /> Add Unplanned Exercise
            </Button>
          )}
        </AddExerciseContainer>

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
