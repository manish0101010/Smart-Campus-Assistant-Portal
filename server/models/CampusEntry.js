const mongoose = require('mongoose');

const campusEntrySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['faculty', 'location'],
            required: true,
        },
        // Shared
        name: { type: String, required: true, trim: true },
        building: { type: String, trim: true },
        description: { type: String, trim: true },

        // Faculty-specific
        department: { type: String, trim: true },
        cabin: { type: String, trim: true },
        floor: { type: String, trim: true },
        contact: { type: String, trim: true },

        // Location-specific
        block: { type: String, trim: true },
        landmark: { type: String, trim: true },
        directions: { type: String, trim: true },
    },
    { timestamps: true }
);

// Full-text search index
campusEntrySchema.index({ name: 'text', department: 'text', building: 'text', block: 'text', description: 'text' });

module.exports = mongoose.model('CampusEntry', campusEntrySchema);
