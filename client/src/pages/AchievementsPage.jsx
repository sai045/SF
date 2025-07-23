import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { getAchievements, setActiveTitle } from "../api/user.api.js";
import { AppContainer, Title, Button } from "../components/common/Styled";
import { theme } from "../styles/theme";
import { FaLock, FaUnlock, FaCheckCircle } from "react-icons/fa";
import toast from 'react-hot-toast';

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
`;

const AchievementCard = styled.div`
  background: ${(props) =>
    props.isUnlocked ? theme.colors.cardBackground : "rgba(0,0,0,0.3)"};
  opacity: ${(props) => (props.isUnlocked ? 1 : 0.5)};
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 5px solid
    ${(props) =>
      props.isUnlocked
        ? props.isTitle
          ? theme.colors.danger
          : theme.colors.accent
        : theme.colors.textMuted};
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  h3 {
    color: ${(props) =>
      props.isUnlocked ? theme.colors.text : theme.colors.textMuted};
    font-family: ${theme.fonts.body};
    flex-grow: 1;
  }
`;

function AchievementsPage() {
  const { user, setUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements().then((data) => {
      setAchievements(data);
      setLoading(false);
    });
  }, []);

  const handleSetTitle = async (key) => {
    try {
      const updatedUser = await setActiveTitle(key);
      setUser(updatedUser); // Update global user context with new title
      toast("Title updated!");
    } catch (error) {
      toast("Failed to set title.");
    }
  };

  if (loading)
    return (
      <AppContainer>
        <h2>Loading Achievements...</h2>
      </AppContainer>
    );

  return (
    <AppContainer>
      <Title>Achievements & Titles</Title>
      <AchievementsGrid>
        {achievements.map((ach) => (
          <AchievementCard
            key={ach.key}
            isUnlocked={ach.isUnlocked}
            isTitle={ach.isTitle}
          >
            <CardHeader isUnlocked={ach.isUnlocked}>
              {ach.isUnlocked ? (
                <FaUnlock color={theme.colors.accent} size="2em" />
              ) : (
                <FaLock size="2em" />
              )}
              <h3>{ach.name}</h3>
            </CardHeader>
            <p style={{ color: theme.colors.textMuted, flexGrow: 1 }}>
              {ach.description}
            </p>
            {ach.isUnlocked && ach.isTitle && (
              <Button
                onClick={() => handleSetTitle(ach.key)}
                disabled={user.title === ach.name}
                style={{ marginTop: "1rem" }}
              >
                {user.title === ach.name ? (
                  <>
                    <FaCheckCircle /> Active
                  </>
                ) : (
                  "Set as Title"
                )}
              </Button>
            )}
          </AchievementCard>
        ))}
      </AchievementsGrid>
    </AppContainer>
  );
}

export default AchievementsPage;
