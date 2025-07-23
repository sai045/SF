import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer style={{ justifyContent: "center" }}>
      <FormCard as="form" onSubmit={handleSubmit}>
        <Title>HUNTER LOGIN</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "ENTERING..." : "LOGIN"}
        </Button>
        <FormLink>
          Not yet a hunter? <Link to="/register">Register</Link>
        </FormLink>
      </FormCard>
    </AppContainer>
  );
}

export default LoginPage;
