const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeStudent } = require('../utils/studentAnalyzer');

const getNotifications = async (req, res) => {
    try {
        const user = req.user;
        const query = {
            $or: [
                { targetDepartment: new RegExp(`^${user.department}$`, 'i') },
                { targetDepartment: new RegExp('^all$', 'i') }
            ]
        };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(10);
        let analysisAlerts = [];

        if (user && user.role === 'Student') {
            const student = await User.findById(user._id);
            if (student) {
                const { alerts } = analyzeStudent(student);
                analysisAlerts = alerts.map((message) => ({ message, source: 'studentInsight' }));
            }
        }

        res.json({ notifications, analysisAlerts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsSeen = async (req, res) => {
    try {
        await Notification.updateMany({ seen: false }, { $set: { seen: true } });
        res.json({ message: 'Notifications marked as seen' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getNotifications, markAsSeen };
