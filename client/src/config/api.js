// Centralized API configuration
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://smart-campus-assistant-portal-1.onrender.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN:    `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,

  // Admin
  ADMIN_MEMBERS:   `${API_BASE_URL}/api/admin/members`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  ADMIN_STUDENTS:  `${API_BASE_URL}/api/admin/students`,
  ADMIN_NOTICES:   `${API_BASE_URL}/api/admin/notices`,
  ADMIN_EXAMS:     `${API_BASE_URL}/api/admin/exams`,
  ADMIN_EVENTS:    `${API_BASE_URL}/api/admin/events`,

  // Student
  STUDENT_DASHBOARD: `${API_BASE_URL}/api/student/profile`,
  STUDENT_NOTICES:   `${API_BASE_URL}/api/student/notices`,
  STUDENT_EXAMS:     `${API_BASE_URL}/api/student/exams`,
  STUDENT_EVENTS:    `${API_BASE_URL}/api/student/events`,

  // Chat
  CHAT: `${API_BASE_URL}/api/chat`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,

  // Finder (Campus Navigation)
  FINDER:         `${API_BASE_URL}/api/finder`,

  // MealMap (Food System)
  MEALMAP:        `${API_BASE_URL}/api/mealmap`,
  MEALMAP_WEEKLY: `${API_BASE_URL}/api/mealmap/weekly`,
};

export default API_BASE_URL;