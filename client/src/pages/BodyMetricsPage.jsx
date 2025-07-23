import React, { useState, useEffect } from "react";
import {
  AppContainer,
  Title,
  FormCard,
  Input,
  Button,
  ErrorMessage,
} from "../components/common/Styled";
import ProgressChart from "../components/metrics/ProgressChart";
import { logBodyMetric, getBodyMetricsHistory } from "../api/metric.api.js";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
`;

function BodyMetricsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    weight_kg: "",
    bodyFatPercentage: "",
  });
  const [error, setError] = useState("");

  const { logout } = useAuth();

  const fetchHistory = async () => {
    try {
      const data = await getBodyMetricsHistory();
      setHistory(data);
    } catch (err) {
      setError("Could not fetch metric history.");
      if (err.response && err.response.status === 401) {
        // Handle unauthorized access, e.g., redirect to login
        console.error("Unauthorized access, redirecting to login.");
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.weight_kg) {
      setError("Weight is a required field.");
      return;
    }
    try {
      await logBodyMetric(formData);
      // Clear form and refetch history to update the chart
      setFormData({ weight_kg: "", bodyFatPercentage: "" });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log metrics.");
    }
  };

  return (
    <AppContainer>
      <Title>Track Your Progress</Title>
      <PageLayout>
        <FormCard as="form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Log Today's Metrics
          </h2>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <label>Weight (kg)</label>
          <Input
            type="number"
            step="0.1"
            name="weight_kg"
            value={formData.weight_kg}
            onChange={handleChange}
            required
          />

          <label>Body Fat (%) (Optional)</label>
          <Input
            type="number"
            step="0.1"
            name="bodyFatPercentage"
            value={formData.bodyFatPercentage}
            onChange={handleChange}
          />

          {/* Add other inputs for waist, arms, etc. here if desired */}
          <Button type="submit">LOG ENTRY</Button>
        </FormCard>

        {loading ? (
          <p>Loading chart data...</p>
        ) : history.length > 0 ? (
          <ProgressChart data={history} />
        ) : (
          <p>No data to display. Log your first entry to start tracking!</p>
        )}
      </PageLayout>
    </AppContainer>
  );
}

export default BodyMetricsPage;
