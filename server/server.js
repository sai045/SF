const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// --- Import Routes ---
const userRoutes = require("./routes/user.routes");
const workoutRoutes = require("./routes/workout.routes");
const plannerRoutes = require("./routes/planner.routes");

// --- Initialize Server & Database ---
const app = express();
connectDB(); // Connect to MongoDB

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Basic Test Route ---
app.get("/", (req, res) => {
  res.json({
    message: "[System] SoloFit Server is online.",
    status: "Operational",
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/planner", plannerRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[System] Server is running on port: ${PORT}`);
  console.log(`[System] Awaiting Hunter actions...`);
});
