const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'Student'], default: 'Student' },
    department: { type: String }, // e.g., CSE, ECE
    semester: { type: String },
    marks: [{ subject: { type: String }, score: { type: Number, min: 0, max: 100 } }],
    attendance: { type: Number, default: null, min: 0, max: 100 },
    cgpa: { type: Number, default: null, min: 0, max: 10 }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
