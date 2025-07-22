import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const BarContainer = styled.div`
  width: 100%;
  height: 25px;
  background-color: #333;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid ${theme.colors.primary};
  margin-top: 0.5rem;
  position: relative;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.percent}%;
  background: linear-gradient(
    90deg,
    ${theme.colors.secondary},
    ${theme.colors.primary}
  );
  transition: width 0.5s ease-in-out;
`;

const EXPText = styled.span`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  text-align: center;
  color: ${theme.colors.text};
  font-weight: bold;
  font-size: 0.9rem;
  line-height: 25px;
  text-shadow: 1px 1px 2px black;
  font-family: ${theme.fonts.body};
`;

function EXPBar({ current = 0, required = 100 }) {
  const percent = required > 0 ? (current / required) * 100 : 0;

  return (
    <BarContainer>
      <EXPText>
        {current} / {required} EXP
      </EXPText>
      <BarFill percent={percent} />
    </BarContainer>
  );
}

export default EXPBar;
