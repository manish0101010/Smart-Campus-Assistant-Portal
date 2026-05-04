const MenuItem = require('../models/MenuItem');

// @desc  Add a menu item (mess or canteen)
// @route POST /api/mealmap
// @access Admin
const addMenuItem = async (req, res) => {
    try {
        const { type, day, mealTime, items, special, price } = req.body;

        if (!type || !day) {
            return res.status(400).json({ message: 'Type and day are required.' });
        }

        // Parse items: accept comma-separated string or array
        const parsedItems = Array.isArray(items)
            ? items
            : (items || '').split(',').map(s => s.trim()).filter(Boolean);

        const menuItem = await MenuItem.create({
            type, day, mealTime: mealTime || 'Lunch',
            items: parsedItems, special, price,
        });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error('addMenuItem error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc  Get menu items
// @route GET /api/mealmap?type=mess|canteen&day=Monday
// @access Public
const getMenu = async (req, res) => {
    try {
        const { type, day } = req.query;
        let filter = {};

        if (type && type !== 'all') filter.type = type;
        if (day) filter.$or = [{ day }, { day: 'Daily' }];

        const items = await MenuItem.find(filter).sort({ day: 1, mealTime: 1 });
        res.json(items);
    } catch (error) {
        console.error('getMenu error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc  Get full weekly menu (all days grouped)
// @route GET /api/mealmap/weekly
// @access Public
const getWeeklyMenu = async (req, res) => {
    try {
        const { type } = req.query;
        let filter = type && type !== 'all' ? { type } : {};

        const items = await MenuItem.find(filter).sort({ day: 1, mealTime: 1 });

        // Group by day
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.day]) grouped[item.day] = [];
            grouped[item.day].push(item);
        });

        res.json(grouped);
    } catch (error) {
        console.error('getWeeklyMenu error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc  Delete a menu item
// @route DELETE /api/mealmap/:id
// @access Admin
const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Menu item not found.' });
        }
        res.json({ message: 'Menu item deleted successfully.' });
    } catch (error) {
        console.error('deleteMenuItem error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { addMenuItem, getMenu, getWeeklyMenu, deleteMenuItem };
