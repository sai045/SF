import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const TimerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const TimerText = styled.h1`
  font-size: 8rem;
  color: ${theme.colors.accent};
  margin: 0;
`;

const SkipButton = styled.button`
  background: none;
  border: 1px solid ${theme.colors.textMuted};
  color: ${theme.colors.textMuted};
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 2rem;

  &:hover {
    border-color: ${theme.colors.accent};
    color: ${theme.colors.accent};
  }
`;

function RestTimer({ duration, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onFinish]);

  return (
    <TimerOverlay>
      <h2>REST</h2>
      <TimerText>{timeLeft}</TimerText>
      <SkipButton onClick={onFinish}>SKIP</SkipButton>
    </TimerOverlay>
  );
}

export default RestTimer;
