import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";
import { Toaster } from "react-hot-toast";

import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionDashboardPage from "./pages/NutritionDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BodyMetricsPage from "./pages/BodyMetricsPage";
import WorkoutStartPage from "./pages/WorkoutStartPage";
import WorkoutHistoryListPage from "./pages/WorkoutHistoryListPage";
import WorkoutLogDetailPage from "./pages/WorkoutLogDetailPage";
import AchievementsPage from "./pages/AchievementsPage";
import MyWorkoutsPage from "./pages/MyWorkoutsPage";
import WorkoutBuilderPage from "./pages/WorkoutBuilderPage";

function App() {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: theme.colors.cardBackgroundSolid,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.primary}`,
          },
        }}
      />
      {["/login", "/register"].includes(location.pathname) ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/:workoutId"
              element={
                <ProtectedRoute>
                  <WorkoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <NutritionDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/metrics"
              element={
                <ProtectedRoute>
                  <BodyMetricsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/start/:workoutId"
              element={
                <ProtectedRoute>
                  <WorkoutStartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/session/:sessionId"
              element={
                <ProtectedRoute>
                  <WorkoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/workouts"
              element={
                <ProtectedRoute>
                  <WorkoutHistoryListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/workouts/:logId"
              element={
                <ProtectedRoute>
                  <WorkoutLogDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <MyWorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/create"
            element={
              <ProtectedRoute>
                <WorkoutBuilderPage />
              </ProtectedRoute>
            }
          />
        </Layout>
      )}
    </ThemeProvider>
  );
}

export default App;
