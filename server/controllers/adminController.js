const Event = require('../models/Event');
const ExamSchedule = require('../models/ExamSchedule');
const Notice = require('../models/Notice');
const ChatLog = require('../models/ChatLog');
const Notification = require('../models/Notification');

// Event Handlers
const createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        await Notification.create({ message: `New Event posted: ${event.title}`, targetDepartment: event.department });
        res.status(201).json(event);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 });
        res.json(events);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event removed' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Exam Handlers
const createExam = async (req, res) => {
    try {
        const exam = await ExamSchedule.create(req.body);
        await Notification.create({ message: `New Exam Schedule posted: ${exam.title}`, targetDepartment: exam.department });
        res.status(201).json(exam);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const getExams = async (req, res) => {
    try {
        const exams = await ExamSchedule.find().sort({ date: -1 });
        res.json(exams);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteExam = async (req, res) => {
    try {
        await ExamSchedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam removed' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Notice Handlers
const createNotice = async (req, res) => {
    try {
        const notice = await Notice.create(req.body);
        await Notification.create({ message: `New Notice posted: ${notice.title}`, targetDepartment: notice.department });
        res.status(201).json(notice);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.json(notices);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteNotice = async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notice removed' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// Analytics Data Handler
const getAnalytics = async (req, res) => {
    try {
        const totalQueries = await ChatLog.countDocuments();
        
        // Chat logs aggregate for intent frequencies (Most frequent queries)
        const intentFreq = await ChatLog.aggregate([
            { $group: { _id: "$intent", count: { $sum: 1 } } }
        ]);

        // Chat logs aggregate for queries per day
        const queriesPerDay = await ChatLog.aggregate([
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, 
                count: { $sum: 1 } 
            } },
            { $sort: { _id: 1 } }
        ]);

        // Department-wise usage
        const deptUsage = await ChatLog.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);

        const unanswered = await ChatLog.countDocuments({ resultFound: false });
        const allLogs = await ChatLog.find().sort({ timestamp: -1 }).limit(50); // Get recent 50
        
        res.json({ totalQueries, intentFreq, queriesPerDay, deptUsage, unanswered, recentLogs: allLogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createEvent, getEvents, deleteEvent,
    createExam, getExams, deleteExam,
    createNotice, getNotices, deleteNotice,
    getAnalytics
};
