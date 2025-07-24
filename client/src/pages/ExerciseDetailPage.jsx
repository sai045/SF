import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getSingleExerciseHistory } from "../api/workout.api";
import { AppContainer, Title } from "../components/common/Styled";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { theme } from "../styles/theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateE1RM } from "../utils/fitnessCalculator";

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: ${theme.colors.cardBackgroundSolid};
  padding: 2rem 2rem 2rem 1rem; /* Add padding for axis labels */
  border-radius: 8px;
`;

// --- STYLES FOR THE DATA TABLE ---
const DataTableContainer = styled.div`
  background-color: ${theme.colors.cardBackgroundSolid};
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const TableHead = styled.thead`
  th {
    padding: 0.75rem;
    color: ${theme.colors.textMuted};
    border-bottom: 2px solid ${theme.colors.cardBackground};
    font-family: ${theme.fonts.heading};
    letter-spacing: 1px;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(odd) {
      background-color: ${theme.colors.cardBackground};
    }
  }
  td {
    padding: 0.75rem;
    color: ${theme.colors.text};
  }
`;
// --- END OF TABLE STYLES ---

function ExerciseDetailPage() {
  const { exerciseName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSingleExerciseHistory(exerciseName)
      .then(setData)
      .finally(() => setLoading(false));
  }, [exerciseName]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const workoutSessions = {};

    data.history.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString("en-CA"); // Use YYYY-MM-DD for sorting
      if (!workoutSessions[date]) {
        workoutSessions[date] = {
          date,
          totalVolume: 0,
          maxE1RM: 0,
          maxReps: 0,
        };
      }

      const weight = parseFloat(log.weight);
      const reps = parseInt(log.reps, 10);

      if (!isNaN(weight) && !isNaN(reps)) {
        workoutSessions[date].totalVolume += weight * reps;
        const e1rm = calculateE1RM(weight, reps);
        if (e1rm > workoutSessions[date].maxE1RM) {
          workoutSessions[date].maxE1RM = Math.round(e1rm);
        }
        if (reps > workoutSessions[date].maxReps) {
          workoutSessions[date].maxReps = reps;
        }
      }
    });

    // Sort by date to make the chart chronological
    return Object.values(workoutSessions).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [data]);

  if (loading)
    return (
      <AppContainer style={{ justifyContent: "center" }}>
        <LoadingSpinner />
      </AppContainer>
    );
  if (!data)
    return (
      <AppContainer>
        <h2>No history found for this exercise.</h2>
      </AppContainer>
    );

  const { masterExercise, history } = data;
  const isBodyweight = masterExercise.isBodyweight;
  const decodedName = decodeURIComponent(exerciseName);

  return (
    <AppContainer>
      <Title>Progress: {decodedName}</Title>
      <DetailGrid>
        <ChartContainer>
          <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {isBodyweight ? "Max Reps Over Time" : "Estimated 1RM Over Time"}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.textMuted}
                strokeOpacity={0.2}
              />
              <XAxis dataKey="date" stroke={theme.colors.textMuted} />
              <YAxis stroke={theme.colors.primary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.cardBackground,
                  border: "1px solid #444",
                }}
              />
              <Legend />
              {isBodyweight ? (
                <Line
                  type="monotone"
                  dataKey="maxReps"
                  name="Max Reps"
                  stroke={theme.colors.accent}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="maxE1RM"
                  name="Est. 1RM (kg)"
                  stroke={theme.colors.accent}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <DataTableContainer>
          <h2 style={{ textAlign: "center" }}>Complete Set History</h2>
          <Table>
            <TableHead>
              <tr>
                <th>Date</th>
                <th>Set</th>
                <th>Weight</th>
                <th>Reps</th>
              </tr>
            </TableHead>
            <TableBody>
              {history
                .slice()
                .reverse()
                .map(
                  (
                    log,
                    index // Reverse for most recent first
                  ) => (
                    <tr key={index}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.setNumber}</td>
                      <td>
                        {typeof log.weight === "number"
                          ? `${log.weight} kg`
                          : "N/A"}
                      </td>
                      <td>{log.reps}</td>
                    </tr>
                  )
                )}
            </TableBody>
          </Table>
        </DataTableContainer>
      </DetailGrid>
    </AppContainer>
  );
}

export default ExerciseDetailPage;
