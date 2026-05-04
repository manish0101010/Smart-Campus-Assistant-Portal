const express = require('express');
const router = express.Router();
const { getMyProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getMyProfile);

module.exports = router;
