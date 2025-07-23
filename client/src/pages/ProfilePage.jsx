import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { AppContainer, Title } from "../components/common/Styled";
import { getProfileStats } from "../api/user.api.js";
import StatBox from "../components/profile/StatBox";
import { theme } from "../styles/theme";
import { FaCrown, FaDumbbell, FaWeight } from "react-icons/fa";

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
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

const EXPBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 1rem auto 0 auto;
  // ... (Styling for an EXP bar component would go here)
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
  }

  span:last-child {
    font-family: ${theme.fonts.heading};
    font-size: 1.5rem;
    color: ${theme.colors.accent};
  }
`;

function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats)
    return (
      <AppContainer>
        <h2>Loading Hunter Stats...</h2>
      </AppContainer>
    );

  return (
    <AppContainer>
      <ProfileHeader>
        <Title>STATUS: {user.username}</Title>
        <p style={{ color: theme.colors.textMuted }}>LV. {user.level}</p>
        <p style={{ color: theme.colors.textMuted, fontStyle: "italic" }}>
          "{user.title}"
        </p>
        <p style={{ color: theme.colors.textMuted }}>LV. {user.level}</p>
        <HunterRank>{user.rank}-RANK HUNTER</HunterRank>
      </ProfileHeader>

      <Link
        to="/achievements"
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <Button style={{ width: "auto", padding: "1rem 2rem" }}>
          View Achievements
        </Button>
      </Link>

      <ProfileGrid>
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
            {/* Add more stats like "Meals Logged" later */}
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
              <p style={{ textAlign: "center" }}>
                Log some workouts to see your PRs here!
              </p>
            )}
          </PRList>
        </SectionCard>
      </ProfileGrid>
    </AppContainer>
  );
}

export default ProfilePage;
