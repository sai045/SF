import styled from "styled-components";
import { theme } from "../../styles/theme";

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 2rem;
  width: 100%;
`;

export const FormCard = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background-color: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  box-shadow: ${theme.glow};
  backdrop-filter: blur(5px);

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: ${theme.colors.textMuted};
  }
`;

export const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  color: ${theme.colors.text};
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  color: ${theme.colors.text};
  font-size: 1rem;
  font-family: ${theme.fonts.body};
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.glow};
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.background};
  font-family: ${theme.fonts.heading};
  font-size: 1.5rem;
  letter-spacing: 1px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
    box-shadow: ${theme.glow};
  }

  &:disabled {
    background-color: ${theme.colors.textMuted};
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.5);
  }
`;

export const FormLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: ${theme.colors.textMuted};

  a {
    color: ${theme.colors.accent};
    font-weight: bold;
  }
`;

export const ErrorMessage = styled.div`
  color: ${theme.colors.danger};
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid ${theme.colors.danger};
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: ${theme.dangerGlow};
`;

export const SystemMessageCard = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background-color: ${theme.colors.cardBackgroundSolid};
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  margin-top: 2rem;

  h2 {
    font-size: 2.5rem;
  }

  p {
    font-size: 1.1rem;
    color: ${theme.colors.textMuted};
    margin-bottom: 1rem;
  }
`;
