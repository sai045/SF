import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getMyWorkouts } from "../api/workout.api";
import { AppContainer, Title, Button } from "../components/common/Styled";
import { theme } from "../styles/theme";
import { FaPlus } from "react-icons/fa";

const WorkoutList = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const WorkoutItem = styled(Link)`
  display: block;
  text-decoration: none;
  background: ${theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 5px solid ${theme.colors.secondary};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(142, 68, 173, 0.2);
  }

  h3 {
    color: ${theme.colors.text};
    font-size: 1.5rem;
  }
  p {
    color: ${theme.colors.textMuted};
    margin-top: 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`;

function MyWorkoutsPage() {
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyWorkouts()
      .then((data) => {
        setMyWorkouts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <AppContainer>
        <h2>Loading Your Workouts...</h2>
      </AppContainer>
    );

  return (
    <AppContainer>
      <Header>
        <Title>My Workouts</Title>
        <Button
          onClick={() => navigate("/workouts/create")}
          style={{ width: "auto" }}
        >
          <FaPlus /> Create New
        </Button>
      </Header>
      <WorkoutList>
        {myWorkouts.length === 0 && (
          <p>
            You haven't created any custom workouts yet. Click "Create New" to
            start!
          </p>
        )}
        {myWorkouts.map((workout) => (
          // We can link to the interactive workout page to let users DO their custom workouts
          <WorkoutItem key={workout._id} to={`/workout/start/${workout._id}`}>
            <h3>{workout.name}</h3>
            <p>{workout.exercises.length} exercises</p>
          </WorkoutItem>
        ))}
      </WorkoutList>
    </AppContainer>
  );
}

export default MyWorkoutsPage;
