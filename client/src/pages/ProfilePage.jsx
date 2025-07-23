import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  AppContainer,
  Title,
  FormCard,
  Input,
  Button,
  ErrorMessage,
} from "../components/common/Styled";
import { updateUserProfile } from "../api/user.api.js";
import { theme } from "../styles/theme";

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.colors.textMuted};
  border-radius: 4px;
  color: ${theme.colors.text};
  font-size: 1rem;
  font-family: ${theme.fonts.body};
`;

const StatDisplay = styled.div`
  background-color: ${theme.colors.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  h3 {
    color: ${theme.colors.accent};
    font-size: 2.5rem;
  }
  p {
    color: ${theme.colors.textMuted};
    font-size: 1rem;
    margin-top: -0.5rem;
  }
`;

function ProfilePage() {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    age: user.physicalMetrics?.age || "",
    weight_kg: user.physicalMetrics?.weight_kg || "",
    height_cm: user.physicalMetrics?.height_cm || "",
    gender: user.physicalMetrics?.gender || "male",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Title>HUNTER PROFILE: {user.username}</Title>
      <ProfileGrid>
        <FormCard as="form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Update Physical Metrics
          </h2>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <p style={{ color: "lime", textAlign: "center" }}>{success}</p>
          )}

          <label>Age</label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <label>Weight (kg)</label>
          <Input
            type="number"
            name="weight_kg"
            step="0.1"
            value={formData.weight_kg}
            onChange={handleChange}
            required
          />

          <label>Height (cm)</label>
          <Input
            type="number"
            name="height_cm"
            value={formData.height_cm}
            onChange={handleChange}
            required
          />

          <label>Gender</label>
          <SelectInput
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectInput>

          <Button type="submit" disabled={loading}>
            {loading ? "UPDATING..." : "UPDATE PROFILE"}
          </Button>
        </FormCard>

        <StatDisplay>
          <h3>{Math.round(user.physicalMetrics?.bmr) || "N/A"}</h3>
          <p>Calculated BMR (kcal/day)</p>
        </StatDisplay>
      </ProfileGrid>
    </AppContainer>
  );
}

export default ProfilePage;
