const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    message: { type: String, required: true },
    targetRole: { type: String, default: 'Student' }, // In case we want to target specific roles
    targetDepartment: { type: String, default: 'all' }, // To show dept specific notifications
    seen: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
