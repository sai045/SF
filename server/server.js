const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cron = require("node-cron");

const connectDB = require("./config/db");
const { runDailySummaryJob } = require("./jobs/dailySummary");

const userRoutes = require("./routes/user.routes");
const workoutRoutes = require("./routes/workout.routes");
const plannerRoutes = require("./routes/planner.routes");
const mealRoutes = require("./routes/meal.routes");
const activityRoutes = require("./routes/activity.routes");
const metricRoutes = require("./routes/metric.routes");
const sessionRoutes = require("./routes/session.routes");
const habitRoutes = require("./routes/habit.routes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "[System] SoloFit Server is online." });
});

app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/habits", habitRoutes);

// Schedule the job to run once every day at 1:05 AM UTC server time
cron.schedule(
  "5 1 * * *",
  () => {
    runDailySummaryJob();
  },
  {
    timezone: "Etc/UTC",
  }
);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[System] Server is running on port: ${PORT}`);
  console.log(`[System] Awaiting Hunter actions...`);
});
