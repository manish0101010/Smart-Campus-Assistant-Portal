import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import StudentChatbot from './StudentChatbot';
import CampusFinder from './CampusFinder';
import MealMapPage from './MealMapPage';
import SmartSearch from '../components/SmartSearch';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [analysisAlerts, setAnalysisAlerts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(API_ENDPOINTS.STUDENT_DASHBOARD, config);
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(API_ENDPOINTS.NOTIFICATIONS, config);
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
      setAnalysisAlerts(Array.isArray(data) ? [] : data.analysisAlerts || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const coursesEnrolled = profile?.marks?.length || 0;
  const attendance = profile?.attendance;
  const cgpa = profile?.cgpa;
  const hasAcademicData = profile?.hasData;

  return (
        <div className="student-dashboard-layout">
      <aside className="student-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>Student Portal</h2>
          <p>{user.name}</p>
          <span className="role-pill">{user.role}</span>
        </div>
        <div style={{padding:'0.4rem 0 0.6rem'}}>
          <SmartSearch onNavigate={(cat) => {
            if (cat === 'faculty' || cat === 'location') setActiveTab('finder');
            else if (cat === 'menu') setActiveTab('mealmap');
            else if (cat === 'events') setActiveTab('overview');
          }} />
        </div>
        <nav className="student-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'chatbot' ? 'active' : ''} onClick={() => setActiveTab('chatbot')}>Chatbot</button>
          <button id="student-nav-finder" className={activeTab === 'finder' ? 'active' : ''} onClick={() => setActiveTab('finder')}>🗺️ Finder</button>
          <button id="student-nav-mealmap" className={activeTab === 'mealmap' ? 'active' : ''} onClick={() => setActiveTab('mealmap')}>🍽️ MealMap</button>
        </nav>
        <div className="student-sidebar-footer">
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="student-main-content">
        {activeTab === 'overview' && (
          <div className="overview-panel fade-in">
            <header className="dashboard-header glass-panel">
              <div>
                <h1>Welcome back, {user.name}</h1>
                <p>{user.email} • {user.department} Department • Semester {user.semester}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('chatbot')}>Open Chatbot</button>
            </header>

            <section className="stats-grid">
              <div className="stat-card glass-panel">
                <h3>Courses Enrolled</h3>
                <p>{coursesEnrolled}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Attendance</h3>
                <p>{attendance !== null && attendance !== undefined ? `${attendance}%` : 'N/A'}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>CGPA</h3>
                <p>{cgpa !== null && cgpa !== undefined ? cgpa.toFixed(2) : 'N/A'}</p>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="dashboard-card glass-panel insights-card">
                <h3>Academic Insights</h3>
                {loading ? (
                  <p>Loading insights...</p>
                ) : !hasAcademicData ? (
                  <p className="empty-state">No academic data available yet.</p>
                ) : (
                  <ul>
                    {profile?.insights?.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="dashboard-card glass-panel alerts-card">
                <h3>Alerts</h3>
                {loading ? (
                  <p>Loading alerts...</p>
                ) : (!analysisAlerts || analysisAlerts.length === 0) ? (
                  <p className="empty-state">No predictive alerts right now.</p>
                ) : (
                  <div className="alert-list">
                    {analysisAlerts.map((alert, index) => (
                      <div key={index} className={`alert-item ${alert.message.includes('Critical') ? 'critical' : alert.message.includes('Warning') ? 'warning' : 'info'}`}>
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-card glass-panel announcements-card">
              <div className="section-header">
                <h3>Announcements</h3>
                <span>{notifications.length} recent</span>
              </div>
              {notifications.length === 0 ? (
                <p className="empty-state">No announcements available right now.</p>
              ) : (
                <ul className="announcement-list">
                  {notifications.map((note) => (
                    <li key={note._id || note.message} className="announcement-item">
                      <strong>{note.message}</strong>
                      <p>{new Date(note.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="chatbot-panel fade-in">
            <StudentChatbot showHeader={false} />
          </div>
        )}

        {activeTab === 'finder' && (
          <div className="finder-panel fade-in" style={{padding:'1.5rem',flex:1,overflowY:'auto'}}>
            <CampusFinder />
          </div>
        )}

        {activeTab === 'mealmap' && (
          <div className="mealmap-panel fade-in" style={{padding:'1.5rem',flex:1,overflowY:'auto'}}>
            <MealMapPage />
          </div>
        )}

        {error && <div className="page-error">{error}</div>}
      </main>
    </div>
  );
};

export default StudentDashboard;
