const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['mess', 'canteen'],
            required: true,
        },
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily'],
            required: true,
        },
        mealTime: {
            type: String,
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'All Day'],
            default: 'Lunch',
        },
        items: [{ type: String, trim: true }],
        special: { type: String, trim: true },   // Today's special highlight
        price: { type: String, trim: true },       // For canteen items
    },
    { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
