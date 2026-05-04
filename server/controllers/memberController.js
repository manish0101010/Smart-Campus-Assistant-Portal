const Member = require('../models/Member');

// Create Member
const createMember = async (req, res) => {
    try {
        const { name, roll, year, degree, about, hobbies, contact, certificate, internship, aim, image } = req.body;
        
        // Validation
        if (!name || !roll || !year || !degree || !about || !hobbies || !aim) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const member = await Member.create({
            name,
            roll,
            year,
            degree,
            about,
            hobbies,
            contact,
            certificate,
            internship,
            aim,
            image
        });

        res.status(201).json(member);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Roll number already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

// Get All Members
const getMembers = async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get Single Member
const getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Member
const updateMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Member
const deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember
};
