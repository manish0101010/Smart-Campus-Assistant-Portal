const mongoose = require('mongoose');

const examScheduleSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true }, // 'all' or specific like 'CSE'
    semester: { type: String }, // Optional, useful for exams
    date: { type: Date, required: true }
}, {
    timestamps: true
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
module.exports = ExamSchedule;
