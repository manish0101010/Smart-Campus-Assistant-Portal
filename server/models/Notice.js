const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true }, // 'all' or specific like 'CSE'
    date: { type: Date, required: true }
}, {
    timestamps: true
});

const Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice;
