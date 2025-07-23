const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    getProfileStats,
    getAchievements,
    setActiveTitle
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
// This single endpoint handles both initial setup and future updates.
router.put('/profile', protect, updateUserProfile);
router.get('/profile/stats', protect, getProfileStats);
router.get('/achievements', protect, getAchievements);
router.put('/profile/title', protect, setActiveTitle);

module.exports = router;