import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppContainer,
  FormCard,
  Title,
  Input,
  Button,
  FormLink,
  ErrorMessage,
} from "../components/common/Styled";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer style={{ justifyContent: "center" }}>
      <FormCard as="form" onSubmit={handleSubmit}>
        <Title>BECOME A HUNTER</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 6 characters)"
          minLength="6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "AWAKENING..." : "REGISTER"}
        </Button>
        <FormLink>
          Already a hunter? <Link to="/login">Login</Link>
        </FormLink>
      </FormCard>
    </AppContainer>
  );
}

export default RegisterPage;
