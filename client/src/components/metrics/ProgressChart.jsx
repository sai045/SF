import React from "react";
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
import { theme } from "../../styles/theme";
import styled from "styled-components";

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
`;

const ProgressChart = ({ data }) => {
  // Format data for the chart
  const formattedData = data.map((metric) => ({
    // Format date to be more readable, e.g., "Mar 15"
    date: new Date(metric.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    Weight: metric.weight_kg,
    "Body Fat %": metric.bodyFatPercentage,
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.textMuted}
            strokeOpacity={0.2}
          />
          <XAxis dataKey="date" stroke={theme.colors.textMuted} />
          <YAxis
            yAxisId="left"
            stroke={theme.colors.primary}
            label={{
              value: "Weight (kg)",
              angle: -90,
              position: "insideLeft",
              fill: theme.colors.primary,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={theme.colors.danger}
            label={{
              value: "Body Fat %",
              angle: -90,
              position: "insideRight",
              fill: theme.colors.danger,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.colors.cardBackgroundSolid,
              border: `1px solid ${theme.colors.textMuted}`,
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Weight"
            stroke={theme.colors.primary}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Body Fat %"
            stroke={theme.colors.danger}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ProgressChart;
