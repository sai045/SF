import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startWorkoutSession } from "../api/session.api.js";

function WorkoutStartPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const beginSession = async () => {
      try {
        const session = await startWorkoutSession(workoutId);
        // Redirect to the active session page
        navigate(`/workout/session/${session._id}`, { replace: true });
      } catch (error) {
        console.error("Failed to start session", error);
        navigate("/"); // Redirect home on error
      }
    };
    beginSession();
  }, [workoutId, navigate]);

  return <div>Starting your workout...</div>;
}

export default WorkoutStartPage;
