import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkout, logWorkout } from '../api/workout.api'; // Updated import
import { AppContainer } from '../components/common/Styled';
import ActiveExercise from '../components/workout/ActiveExercise';
import RestTimer from '../components/workout/RestTimer'; // We'll create this next
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Button } from '../components/common/Styled';

const WorkoutContainer = styled.div`
  width: 100%;
  max-width: 800px;
`;

const WorkoutNav = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

function WorkoutPage() {
    const { workoutId } = useParams();
    const navigate = useNavigate();

    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- Workout State ---
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [isResting, setIsResting] = useState(false);
    const [restDuration, setRestDuration] = useState(0);
    const [startTime, setStartTime] = useState(null);


    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const data = await getWorkout(workoutId);
                setWorkout(data);
                setStartTime(new Date()); // Record when the workout starts
            } catch (err) { setError("Failed to load workout details."); }
            finally { setLoading(false); }
        };
        fetchWorkout();
    }, [workoutId]);

    const handleSetComplete = (logData) => {
        setWorkoutLogs([...workoutLogs, logData]);

        // Start rest timer
        const currentExercise = workout.exercises[currentExerciseIndex];
        setIsResting(true);
        setRestDuration(currentExercise.rest);
    };
    
    const handleRestFinished = () => {
        setIsResting(false);
        setRestDuration(0);
    };
    
    const handleFinishWorkout = async () => {
      setLoading(true);
      const endTime = new Date();
      const durationSeconds = Math.round((endTime - startTime) / 1000);

      const payload = {
        workoutId,
        duration: durationSeconds,
        setsLogged: workoutLogs
      };

      try {
        const response = await logWorkout(payload);
        console.log(response); // Quest complete!
        // Here you would show a success modal and update user context
        // For now, we'll just navigate home
        alert(response.message);
        navigate('/');
      } catch (err) {
        setError('Failed to log workout.');
      } finally {
        setLoading(false);
      }
    };

    if (loading && !workout) return <AppContainer><h2>[ SYSTEM LOADING WORKOUT... ]</h2></AppContainer>;
    if (error) return <AppContainer><h2>{error}</h2></AppContainer>;
    if (!workout) return <AppContainer><h2>Workout not found.</h2></AppContainer>;

    const currentExercise = workout.exercises[currentExerciseIndex];
    const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

    return (
        <AppContainer>
            <WorkoutContainer>
                {isResting && <RestTimer duration={restDuration} onFinish={handleRestFinished} />}

                <h1>{workout.name} ({currentExerciseIndex + 1}/{workout.exercises.length})</h1>

                <ActiveExercise exercise={currentExercise} onSetComplete={handleSetComplete} />

                <WorkoutNav>
                    <Button
                        disabled={currentExerciseIndex === 0}
                        onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                    >
                        PREVIOUS
                    </Button>
                    {isLastExercise ? (
                        <Button style={{backgroundColor: theme.colors.accent}} onClick={handleFinishWorkout} disabled={loading}>
                            {loading ? 'LOGGING...' : 'FINISH WORKOUT'}
                        </Button>
                    ) : (
                         <Button onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}>
                            NEXT
                        </Button>
                    )}
                </WorkoutNav>

            </WorkoutContainer>
        </AppContainer>
    );
}

export default WorkoutPage;