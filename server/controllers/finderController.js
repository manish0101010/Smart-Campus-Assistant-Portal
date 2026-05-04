const CampusEntry = require('../models/CampusEntry');

// @desc  Add a faculty or location entry
// @route POST /api/finder
// @access Admin
const addEntry = async (req, res) => {
    try {
        const { type, name, department, cabin, building, block, description, landmark, directions, contact, floor } = req.body;

        if (!type || !name) {
            return res.status(400).json({ message: 'Type and name are required.' });
        }

        const entry = await CampusEntry.create({
            type, name, department, cabin, building, block,
            description, landmark, directions, contact, floor,
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error('addEntry error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc  Get all entries (optionally filtered)
// @route GET /api/finder?type=faculty|location&query=searchTerm
// @access Public
const getEntries = async (req, res) => {
    try {
        const { type, query } = req.query;
        let filter = {};

        if (type && type !== 'all') {
            filter.type = type;
        }

        if (query && query.trim()) {
            const regex = new RegExp(query.trim(), 'i');
            filter.$or = [
                { name: regex },
                { department: regex },
                { building: regex },
                { block: regex },
                { cabin: regex },
                { description: regex },
                { landmark: regex },
            ];
        }

        const entries = await CampusEntry.find(filter).sort({ type: 1, name: 1 });
        res.json(entries);
    } catch (error) {
        console.error('getEntries error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc  Delete an entry
// @route DELETE /api/finder/:id
// @access Admin
const deleteEntry = async (req, res) => {
    try {
        const entry = await CampusEntry.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found.' });
        }
        res.json({ message: 'Entry deleted successfully.' });
    } catch (error) {
        console.error('deleteEntry error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { addEntry, getEntries, deleteEntry };
