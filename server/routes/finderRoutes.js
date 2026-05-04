const express = require('express');
const router = express.Router();
const { addEntry, getEntries, deleteEntry } = require('../controllers/finderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: anyone can search
router.get('/', getEntries);

// Admin-only: add and delete
router.post('/', protect, admin, addEntry);
router.delete('/:id', protect, admin, deleteEntry);

module.exports = router;
