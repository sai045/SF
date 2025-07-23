import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { isSameDay } from "date-fns";
import { getHabits, createHabit, checkinHabit } from "../../api/habit.api.js";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../styles/theme";
import { Input, Button } from "../common/Styled";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";

const HabitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const HabitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${theme.colors.cardBackground};
  padding: 1rem;
  border-radius: 4px;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 25px;
  height: 25px;
  cursor: pointer;
`;

const HabitInfo = styled.div`
  flex-grow: 1;
  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const Streak = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) =>
    props.active ? theme.colors.accent : theme.colors.textMuted};
  font-weight: bold;
`;

const AddHabitForm = styled.form`
  display: flex;
  gap: 1rem;
`;

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const { updateUserStats } = useAuth();

  useEffect(() => {
    getHabits().then(setHabits);
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const newHabit = await createHabit(newHabitName);
      setHabits([...habits, newHabit]);
      setNewHabitName("");
    } catch (error) {
      toast("Failed to add habit.");
    }
  };

  const handleCheckin = async (habitId) => {
    try {
      const response = await checkinHabit(habitId);
      // Update the specific habit in the local state
      setHabits(habits.map((h) => (h._id === habitId ? response.habit : h)));
      updateUserStats(response.updatedUserStatus);
      // toast(response.message); // Can be annoying, maybe a toast notification later
    } catch (error) {
      // If already completed, refresh state to ensure UI is correct
      if (error.response?.status === 400) {
        getHabits().then(setHabits);
      } else {
        toast("Failed to check in habit.");
      }
    }
  };

  return (
    <div>
      <HabitList>
        {habits.map((habit) => {
          const isCompletedToday =
            habit.lastCompleted &&
            isSameDay(new Date(), new Date(habit.lastCompleted));
          return (
            <HabitItem key={habit._id}>
              <Checkbox
                checked={isCompletedToday}
                onChange={() => handleCheckin(habit._id)}
                disabled={isCompletedToday}
              />
              <HabitInfo>
                <p>{habit.name}</p>
              </HabitInfo>
              <Streak active={habit.streak > 0 && isCompletedToday}>
                <FaFire /> {habit.streak}
              </Streak>
            </HabitItem>
          );
        })}
      </HabitList>
      <AddHabitForm onSubmit={handleAddHabit}>
        <Input
          type="text"
          placeholder="Add a new daily habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          style={{ margin: 0 }}
        />
        <Button type="submit" style={{ width: "auto" }}>
          ADD
        </Button>
      </AddHabitForm>
    </div>
  );
}

export default HabitTracker;
