const mongoose = require('mongoose');

const chatLogSchema = mongoose.Schema({
    query: { type: String, required: true },
    intent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    department: { type: String }, // User's department
    resultFound: { type: Boolean, required: true, default: false }
}, {
    timestamps: true
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);
module.exports = ChatLog;
