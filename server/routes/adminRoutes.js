const express = require('express');
const router = express.Router();
const {
    createEvent, getEvents, deleteEvent,
    createExam, getExams, deleteExam,
    createNotice, getNotices, deleteNotice,
    getAnalytics
} = require('../controllers/adminController');
const { getAdminStudents, getAdminStudentById, updateStudentAcademics } = require('../controllers/studentController');
const { createMember, getMembers, getMemberById, updateMember, deleteMember } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get all members (no auth required)
router.get('/members', getMembers);

router.use(protect, admin); // Protect all other admin routes

router.route('/events').post(createEvent).get(getEvents);
router.route('/events/:id').delete(deleteEvent);

router.route('/exams').post(createExam).get(getExams);
router.route('/exams/:id').delete(deleteExam);

router.route('/notices').post(createNotice).get(getNotices);
router.route('/notices/:id').delete(deleteNotice);

router.route('/analytics').get(getAnalytics);

router.route('/students').get(getAdminStudents);
router.route('/students/:id').get(getAdminStudentById).put(updateStudentAcademics);

// Member routes
router.route('/members').post(createMember).get(getMembers);
router.route('/members/:id').get(getMemberById).put(updateMember).delete(deleteMember);

module.exports = router;
