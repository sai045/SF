import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/user.api.js";
import { theme } from "../../styles/theme";
import { Input, Button, FormCard, Title } from "../common/Styled";
import toast from "react-hot-toast";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  padding: 1rem;
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
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ECF0F1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.4-5.4-13z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 0.65em auto;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.glow};
  }
`;

function ProfileSetupWizard() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    age: "",
    weight_kg: "",
    height_cm: "",
    gender: "male",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      // This call is now SAFE because the 'setUser' from useAuth() knows how to merge
      // the data without destroying the token.
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <FormCard as="form" onSubmit={handleSubmit}>
        <Title>Welcome, Hunter!</Title>
        <p
          style={{
            textAlign: "center",
            color: theme.colors.textMuted,
            marginTop: "-1rem",
            marginBottom: "2rem",
          }}
        >
          Let's set up your physical stats to calculate your daily energy needs.
        </p>

        <label>Gender</label>
        <SelectInput
          name="gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </SelectInput>

        <label>Age</label>
        <Input
          type="number"
          placeholder="e.g., 25"
          name="age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          required
        />

        <label>Weight (kg)</label>
        <Input
          type="number"
          step="0.1"
          placeholder="e.g., 70.5"
          name="weight_kg"
          value={formData.weight_kg}
          onChange={(e) =>
            setFormData({ ...formData, weight_kg: e.target.value })
          }
          required
        />

        <label>Height (cm)</label>
        <Input
          type="number"
          placeholder="e.g., 180"
          name="height_cm"
          value={formData.height_cm}
          onChange={(e) =>
            setFormData({ ...formData, height_cm: e.target.value })
          }
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "CALCULATING..." : "SAVE & CONTINUE"}
        </Button>
      </FormCard>
    </ModalOverlay>
  );
}

export default ProfileSetupWizard;
