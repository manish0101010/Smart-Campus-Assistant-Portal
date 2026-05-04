const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    year: { type: String, required: true },
    degree: { type: String, required: true },
    about: { type: String, required: true },
    hobbies: { type: String, required: true },
    contact: { type: String },
    certificate: { type: String },
    internship: { type: String },
    aim: { type: String, required: true },
    image: { type: String } // Base64 encoded image
}, {
    timestamps: true
});

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;
