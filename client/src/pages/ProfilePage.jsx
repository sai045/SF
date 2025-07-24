import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  AppContainer,
  Title,
  Button,
  FormCard,
  Input,
  ErrorMessage,
} from "../components/common/Styled";
import { getProfileStats, updateUserProfile } from "../api/user.api.js";
import StatBox from "../components/profile/StatBox";
import { theme } from "../styles/theme";
import { FaCrown, FaDumbbell } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const HunterRank = styled.span`
  display: inline-block;
  font-family: ${theme.fonts.heading};
  font-size: 3rem;
  color: ${theme.colors.accent};
  background-color: rgba(241, 196, 15, 0.1);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: 2px solid ${theme.colors.accent};
  margin-top: 0.5rem;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const SectionCard = styled.div`
  background: ${theme.colors.cardBackgroundSolid};
  padding: 2rem;
  border-radius: 8px;

  h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
`;

const PRList = styled.ul`
  list-style: none;
  padding: 0;
`;

const PRItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem;
  border-radius: 4px;

  &:nth-child(odd) {
    background: ${theme.colors.cardBackground};
  }

  span:first-child {
    font-weight: bold;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  span:last-child {
    font-family: ${theme.fonts.heading};
    font-size: 1.5rem;
    color: ${theme.colors.accent};
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  color: ${theme.colors.text};
  font-size: 1rem;
`;

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    age: user.physicalMetrics?.age || "",
    weight_kg: user.physicalMetrics?.weight_kg || "",
    height_cm: user.physicalMetrics?.height_cm || "",
    gender: user.physicalMetrics?.gender || "male",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    getProfileStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      // This call is now SAFE because the 'setUser' from useAuth() knows how to merge
      // the data without destroying the token.
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading)
    return (
      <AppContainer style={{ justifyContent: "center" }}>
        <LoadingSpinner />
      </AppContainer>
    );

  return (
    <AppContainer>
      <ProfileHeader>
        <Title>STATUS: {user.username}</Title>
        <p style={{ color: theme.colors.textMuted, fontStyle: "italic" }}>
          "{user.title}"
        </p>
        <p style={{ color: theme.colors.textMuted }}>LV. {user.level}</p>
        <HunterRank>{user.rank}-RANK HUNTER</HunterRank>
      </ProfileHeader>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <Link to="/achievements">
          <Button style={{ width: "auto", padding: "1rem 2rem" }}>
            View Achievements
          </Button>
        </Link>
        <Link to="/profile/metrics">
          <Button
            style={{
              width: "auto",
              padding: "1rem 2rem",
              background: theme.colors.secondary,
            }}
          >
            View Progress Charts
          </Button>
        </Link>
      </div>

      <ProfileGrid>
        {stats && (
          <>
            <SectionCard>
              <h2>Lifetime Statistics</h2>
              <StatsGrid>
                <StatBox
                  value={stats.totalWorkouts}
                  label="Workouts Completed"
                  color={theme.colors.primary}
                />
                <StatBox
                  value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
                  label="Total Volume (kg)"
                  color={theme.colors.danger}
                />
                <StatBox
                  value={user.streaks?.workout?.count || 0}
                  label="Workout Streak"
                  color={theme.colors.secondary}
                />
              </StatsGrid>
            </SectionCard>

            <SectionCard>
              <h2>
                <FaCrown /> Personal Records (e1RM)
              </h2>
              <PRList>
                {stats.topPRs.length > 0 ? (
                  stats.topPRs.map((pr) => (
                    <PRItem key={pr.exerciseName}>
                      <span>
                        <FaDumbbell /> {pr.exerciseName}
                      </span>
                      <span>{Math.round(pr.e1rm)} kg</span>
                    </PRItem>
                  ))
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      color: theme.colors.textMuted,
                    }}
                  >
                    Log some workouts to see your PRs here!
                  </p>
                )}
              </PRList>
            </SectionCard>
          </>
        )}

        <FormCard as="form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Update Physical Metrics
          </h2>

          <label>Age</label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <label>Weight (kg)</label>
          <Input
            type="number"
            name="weight_kg"
            step="0.1"
            value={formData.weight_kg}
            onChange={handleChange}
            required
          />

          <label>Height (cm)</label>
          <Input
            type="number"
            name="height_cm"
            value={formData.height_cm}
            onChange={handleChange}
            required
          />

          <label>Gender</label>
          <SelectInput
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectInput>

          <Button type="submit" disabled={formLoading}>
            {formLoading ? "UPDATING..." : "SAVE CHANGES"}
          </Button>
        </FormCard>
      </ProfileGrid>
    </AppContainer>
  );
}

export default ProfilePage;
