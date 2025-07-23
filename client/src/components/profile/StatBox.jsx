import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const Box = styled.div`
  background: ${theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-bottom: 4px solid ${(props) => props.color || theme.colors.primary};

  h3 {
    font-size: 2.5rem;
    color: ${theme.colors.text};
    margin: 0;
  }
  p {
    font-size: 0.9rem;
    color: ${theme.colors.textMuted};
    margin: 0;
    text-transform: uppercase;
  }
`;

function StatBox({ value, label, color }) {
  return (
    <Box color={color}>
      <h3>{value}</h3>
      <p>{label}</p>
    </Box>
  );
}

export default StatBox;
