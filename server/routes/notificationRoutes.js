const express = require('express');
const router = express.Router();
const { getNotifications, markAsSeen } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications).put(protect, markAsSeen);

module.exports = router;
