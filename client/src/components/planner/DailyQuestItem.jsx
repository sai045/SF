import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";
import { Link } from "react-router-dom";

const QuestContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 5px solid
    ${(props) =>
      props.status === "completed"
        ? theme.colors.accent
        : theme.colors.primary};
  transition: all 0.3s ease;

  ${(props) =>
    props.status === "completed" &&
    css`
      opacity: 0.6;
      background-color: rgba(0, 0, 0, 0.1);
    `}
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-right: 1.5rem;
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
  const isWorkout = type === "workout";
  const { name, muscleGroups, estimatedDuration, status, _id } = data;

  const content = (
    <QuestContainer status={status}>
      <Icon>{isWorkout ? "🏋️" : "🥦"}</Icon>
      <QuestDetails>
        <h4>{name}</h4>
        {isWorkout && (
          <p>
            {muscleGroups.join(" / ")} - Approx. {estimatedDuration} mins
          </p>
        )}
      </QuestDetails>
      <StatusIndicator status={status}>{status.toUpperCase()}</StatusIndicator>
    </QuestContainer>
  );

  // If it's a PENDING workout, wrap it in a link. Otherwise, it's not clickable.
  if (isWorkout && status === "pending") {
    return (
      <Link to={`/workout/${_id}`} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  // For completed items or non-workout items, just return the content.
  return content;
};

export default DailyQuestItem;
