const express = require('express');
const router = express.Router();
const { 
    logWorkout, 
    getWorkoutById, 
    getExerciseHistory 
} = require('../controllers/workout.controller');
const { protect } = require('../middleware/auth.middleware');

// Log a completed workout session
router.post('/log', protect, logWorkout);

// Get a single workout template by its ID
router.get('/:id', protect, getWorkoutById);

// Get the last performance for a specific exercise for PR comparison
router.get('/history/:exerciseName', protect, getExerciseHistory);

module.exports = router;