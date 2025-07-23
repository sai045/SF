import React from "react";
import styled, { keyframes } from "styled-components";
import { theme } from "../../styles/theme";
import { Button } from "./Styled";
import { playLevelUpSound } from "../utils/sounds";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(142, 68, 173, 0.5); /* A celebratory purple */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled.div`
  background: ${theme.colors.background};
  border: 2px solid ${theme.colors.accent};
  box-shadow: 0 0 20px ${theme.colors.accent};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
  color: ${theme.colors.text};
`;

const LevelText = styled.h1`
  font-size: 6rem;
  color: ${theme.colors.accent};
  margin: 1rem 0;
  text-shadow: 0 0 15px ${theme.colors.accent};
`;

function LevelUpModal({ oldLevel, newLevel, onClose }) {
  useEffect(() => {
    playLevelUpSound();
  }, []);
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: theme.colors.text, fontSize: "2.5rem" }}>
          LEVEL UP!
        </h2>
        <p>
          {oldLevel} → {newLevel}
        </p>
        <LevelText>{newLevel}</LevelText>
        <p>New skills and higher-rank quests may now be available.</p>
        <Button
          onClick={onClose}
          style={{
            background: theme.colors.accent,
            color: theme.colors.background,
            marginTop: "2rem",
          }}
        >
          CONTINUE
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
}

export default LevelUpModal;
