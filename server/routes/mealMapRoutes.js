const express = require('express');
const router = express.Router();
const { addMenuItem, getMenu, getWeeklyMenu, deleteMenuItem } = require('../controllers/mealMapController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.get('/', getMenu);
router.get('/weekly', getWeeklyMenu);

// Admin-only
router.post('/', protect, admin, addMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router;
