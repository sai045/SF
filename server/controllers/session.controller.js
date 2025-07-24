const WorkoutSession = require("../models/WorkoutSession.model");
const { createPermanentWorkoutLog } = require("./workout.controller"); // We'll call the original log function at the end
const Workout = require("../models/Workout.model");

// @desc    Start a new workout session
// @route   POST /api/sessions/start
const startWorkoutSession = async (req, res) => {
  const { workoutId } = req.body;
  const userId = req.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    let session = await WorkoutSession.findOne({
      userId,
      workoutId,
      date: today,
      status: "in-progress",
    });
    if (session) {
      return res.status(200).json(session);
    }

    // Fetch the workout template to copy its exercises
    const workoutTemplate = await Workout.findById(workoutId);
    if (!workoutTemplate)
      return res.status(404).json({ message: "Workout template not found." });

    // Create a new session, copying the exercises from the template
    session = await WorkoutSession.create({
      userId,
      workoutId,
      date: today,
      exercises: workoutTemplate.exercises, // Copy the exercise list
    });
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting session:", error);
    res
      .status(500)
      .json({ message: "Error starting session", error: error.message });
  }
};

// @desc    Get a specific workout session by its ID
// @route   GET /api/sessions/:sessionId
const getWorkoutSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(
      req.params.sessionId
    ).populate("workoutId");
    if (!session || session.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Workout session not found." });
    }
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res
      .status(500)
      .json({ message: "Error fetching session", error: error.message });
  }
};

// @desc    Update the sets logged AND the exercise list in a session
// @route   PUT /api/sessions/:sessionId
const updateWorkoutSession = async (req, res) => {
  try {
    // Now accepts both setsLogged and the potentially modified exercises array
    const { setsLogged, exercises } = req.body;

    const updateData = {};
    if (setsLogged) updateData.setsLogged = setsLogged;
    if (exercises) updateData.exercises = exercises;

    const session = await WorkoutSession.findByIdAndUpdate(
      req.params.sessionId,
      { $set: updateData }, // Use $set to update only provided fields
      { new: true }
    ).populate("workoutId"); // Repopulate workoutId for the response

    res.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    res
      .status(500)
      .json({ message: "Error updating session", error: error.message });
  }
};

// @desc    Finish a workout session and create the final log
// @route   POST /api/sessions/:sessionId/finish
const finishWorkoutSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.sessionId);
    if (!session || session.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Session not found." });
    }

    session.status = "completed";
    session.endTime = new Date();
    await session.save();

    // Now, create the permanent historical log by calling our existing logWorkout function
    const duration = Math.round((session.endTime - session.startTime) / 1000);
    req.body = {
      // Mock the request body for the logWorkout function
      workoutId: session.workoutId,
      duration,
      setsLogged: session.setsLogged,
    };

    const result = await createPermanentWorkoutLog(
      req.user.id,
      session.workoutId,
      duration,
      session.setsLogged
    );

    // Pass the request and response objects to the logWorkout controller
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error finishing session:", error);
    res
      .status(500)
      .json({ message: "Error finishing session", error: error.message });
  }
};

module.exports = {
  startWorkoutSession,
  getWorkoutSession,
  updateWorkoutSession,
  finishWorkoutSession,
};
