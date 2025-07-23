import React from "react";
import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";
import { Link } from "react-router-dom";
import { FaDumbbell, FaUtensils, FaShoePrints } from "react-icons/fa";

const QuestWrapper = styled.div`
  a {
    text-decoration: none;
  }
`;

const QuestContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${theme.colors.cardBackground};
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 5px solid ${(props) => props.borderColor};
  transition: all 0.3s ease;

  ${(props) =>
    props.status === "completed" &&
    css`
      opacity: 0.6;
      background-color: rgba(0, 0, 0, 0.1);
      color: ${theme.colors.textMuted};
      h4 {
        color: ${theme.colors.textMuted};
      }
    `}

  ${(props) =>
    props.isClickable &&
    css`
      cursor: pointer;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }
    `}
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-right: 1.5rem;
  color: ${(props) => props.color};
`;

const QuestDetails = styled.div`
  flex-grow: 1;

  h4 {
    color: ${theme.colors.text};
    margin: 0;
    font-size: 1.3rem;
    font-family: ${theme.fonts.body};
    font-weight: 500;
  }

  p {
    margin: 0;
    color: ${theme.colors.textMuted};
    font-size: 0.9rem;
  }
`;

const StatusIndicator = styled.div`
  font-family: ${theme.fonts.heading};
  font-size: 1rem;
  letter-spacing: 1px;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  color: ${(props) =>
    props.status === "completed" ? theme.colors.background : theme.colors.text};
  background-color: ${(props) =>
    props.status === "completed" ? theme.colors.accent : "transparent"};
  border: 1px solid
    ${(props) =>
      props.status === "completed"
        ? theme.colors.accent
        : theme.colors.textMuted};
`;

const DailyQuestItem = ({ type, data }) => {
  // --- BUG FIX IS HERE ---
  // The 'isWorkout' variable is defined here and used correctly within this component's scope.
  const isWorkout = type === "workout";
  const { name, muscleGroups, estimatedDuration, status, _id, sessionId } =
    data || {}; // Use default empty object to prevent crashes if data is null

  let isClickable = true;
  let linkTo = "/";
  let displayText = name;
  let borderColor = theme.colors.primary;
  let iconComponent;

  // This check prevents the component from rendering if data is missing
  if (!data) {
    return null;
  }

  switch (type) {
    case "workout":
      iconComponent = <FaDumbbell />;
      if (status === "pending") {
        displayText = `Start: ${name}`;
        linkTo = `/workout/start/${_id}`;
        borderColor = theme.colors.primary;
      } else if (status === "in-progress") {
        displayText = `Resume: ${name}`;
        linkTo = `/workout/session/${sessionId}`;
        borderColor = theme.colors.accent;
      } else {
        // completed
        isClickable = false;
        borderColor = theme.colors.accent;
      }
      break;

    case "meal":
      iconComponent = <FaUtensils />;
      linkTo = "/nutrition";
      borderColor = theme.colors.danger;
      break;

    case "activity":
      iconComponent = <FaShoePrints />;
      linkTo = "/nutrition"; // Steps are on the nutrition/log page
      borderColor = theme.colors.secondary;
      break;

    default:
      isClickable = false;
  }

  const content = (
    <QuestContainer
      status={status}
      borderColor={borderColor}
      isClickable={isClickable}
    >
      <Icon color={borderColor}>{iconComponent}</Icon>
      <QuestDetails>
        <h4>{displayText}</h4>
        {/* The check 'isWorkout' is valid here because it's inside the render logic */}
        {isWorkout && (
          <p>
            {muscleGroups?.join(" / ")} - Approx. {estimatedDuration} mins
          </p>
        )}
      </QuestDetails>
      <StatusIndicator status={status}>{status?.toUpperCase()}</StatusIndicator>
    </QuestContainer>
  );

  return (
    <QuestWrapper>
      {isClickable ? <Link to={linkTo}>{content}</Link> : content}
    </QuestWrapper>
  );
};

export default DailyQuestItem;
