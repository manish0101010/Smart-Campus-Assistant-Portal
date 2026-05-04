const User = require('../models/User');
const { analyzeStudent, invalidateCache } = require('../utils/studentAnalyzer');

// ─── Student: Get Own Profile + AI Analysis ───────────────────────────────────

/**
 * GET /api/student/profile
 * Fetches the logged-in student's full profile and runs AI analysis.
 */
const getMyProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user._id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const analysis = analyzeStudent(student);

        res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            department: student.department,
            semester: student.semester,
            attendance: student.attendance,
            cgpa: student.cgpa,
            marks: student.marks,
            ...analysis  // hasData, insights, alerts, riskLevel, riskScore
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Get All Students ──────────────────────────────────────────────────

/**
 * GET /api/admin/students
 * Returns all users with role 'Student'.
 */
const getAdminStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Get Student By Id ─────────────────────────────────────────────────

/**
 * GET /api/admin/students/:id
 * Returns the selected student profile for admin inspection/editing.
 */
const getAdminStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student || student.role !== 'Student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            department: student.department,
            semester: student.semester,
            attendance: student.attendance ?? null,
            cgpa: student.cgpa ?? null,
            marks: student.marks || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Admin: Update Student Academic Data ─────────────────────────────────────

/**
 * PUT /api/admin/students/:id
 * Updates marks, attendance, and/or cgpa for a student.
 * Validates all values before saving.
 */
const updateStudentAcademics = async (req, res) => {
    const { attendance, cgpa, marks } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (attendance !== undefined && (attendance < 0 || attendance > 100)) {
        return res.status(400).json({ error: 'Attendance must be between 0 and 100' });
    }
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({ error: 'CGPA must be between 0 and 10' });
    }
    if (marks && Array.isArray(marks)) {
        const invalid = marks.find(m => m.score < 0 || m.score > 100);
        if (invalid) {
            return res.status(400).json({ error: `Marks for "${invalid.subject}" must be between 0 and 100` });
        }
    }

    try {
        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'Student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Build update object — only update what was sent
        const updates = {};
        if (attendance !== undefined) updates.attendance = attendance;
        if (cgpa !== undefined) updates.cgpa = cgpa;
        if (marks !== undefined) updates.marks = marks;

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        // Invalidate the analyzer cache for this student
        invalidateCache(req.params.id);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyProfile, getAdminStudents, getAdminStudentById, updateStudentAcademics };
