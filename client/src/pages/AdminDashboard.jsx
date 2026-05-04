import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import FinderAdmin from './FinderAdmin';
import MealMapAdmin from './MealMapAdmin';
import SmartSearch from '../components/SmartSearch';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, events, exams, notices, students, team
    const [analytics, setAnalytics] = useState(null);
    const [dataList, setDataList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentForm, setStudentForm] = useState({ attendance: '', cgpa: '', marks: [] });

    const [formData, setFormData] = useState({ title: '', description: '', department: 'all', date: '' });

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_ANALYTICS, config);
            setAnalytics(data);
        } catch (error) { console.error(error); }
    };

    const fetchDataList = async () => {
        if (activeTab === 'analytics') return;
        try {
            const url = activeTab === 'students' ? API_ENDPOINTS.ADMIN_STUDENTS : `${API_BASE_URL}/api/admin/${activeTab}`;
            const { data } = await axios.get(url, config);
            setDataList(data);
        } catch (error) { console.error(error); }
    };

    const handleSelectStudent = async (studentId) => {
        try {
            const { data } = await axios.get(`${API_ENDPOINTS.ADMIN_STUDENTS}/${studentId}`, config);
            setSelectedStudent(data);
            setStudentForm({
                attendance: data.attendance !== null && data.attendance !== undefined ? data.attendance : '',
                cgpa: data.cgpa !== null && data.cgpa !== undefined ? data.cgpa : '',
                marks: (data.marks || []).map((item) => ({ subject: item.subject || '', score: item.score ?? '' }))
            });
        } catch (error) {
            console.error('Failed to load student details', error);
        }
    };

    const handleStudentFieldChange = (field, value) => {
        setStudentForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleMarkChange = (index, field, value) => {
        setStudentForm((prev) => {
            const updatedMarks = [...prev.marks];
            updatedMarks[index] = { ...updatedMarks[index], [field]: field === 'score' ? Number(value) : value };
            return { ...prev, marks: updatedMarks };
        });
    };

    const addMarkRow = () => {
        setStudentForm((prev) => ({ ...prev, marks: [...prev.marks, { subject: '', score: '' }] }));
    };

    const removeMarkRow = (index) => {
        setStudentForm((prev) => ({ ...prev, marks: prev.marks.filter((_, idx) => idx !== index) }));
    };

    const handleStudentUpdate = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        try {
            const payload = {
                attendance: studentForm.attendance === '' ? undefined : Number(studentForm.attendance),
                cgpa: studentForm.cgpa === '' ? undefined : Number(studentForm.cgpa),
                marks: studentForm.marks
                    .filter((item) => item.subject.trim().length > 0)
                    .map((item) => ({ subject: item.subject, score: Number(item.score) }))
            };

            await axios.put(`${API_ENDPOINTS.ADMIN_STUDENTS}/${selectedStudent._id}`, payload, config);
            fetchDataList();
            handleSelectStudent(selectedStudent._id);
        } catch (error) {
            console.error('Failed to update student', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchAnalytics();
        } else {
            fetchDataList();
        }
    }, [activeTab]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/${activeTab}`, formData, config);
            setFormData({ title: '', description: '', department: 'all', date: '' });
            fetchDataList();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/admin/${activeTab}/${id}`, config);
            fetchDataList();
        } catch (error) { console.error(error); }
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="admin-layout">
            <aside className="sidebar glass-panel">
                <div style={{ padding: '0.5rem 0 0.75rem' }}>
                    <SmartSearch onNavigate={(cat) => {
                        if (cat === 'faculty' || cat === 'location') setActiveTab('finder');
                        else if (cat === 'menu') setActiveTab('mealmap');
                        else if (cat === 'events') setActiveTab('events');
                        else if (cat === 'notices') setActiveTab('notices');
                    }} />
                </div>
                <div className="sidebar-header">
                    <h2>Admin Portal</h2>
                    <p>{user.name}</p>
                </div>
                <nav className="nav-menu">
                    <button className={activeTab === 'team' ? 'active' : ''} onClick={() => setActiveTab('team')}>TEAM 17</button>
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
                    <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>Students</button>
                    <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
                    <button className={activeTab === 'exams' ? 'active' : ''} onClick={() => setActiveTab('exams')}>Exams</button>
                    <button className={activeTab === 'notices' ? 'active' : ''} onClick={() => setActiveTab('notices')}>Notices</button>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.07)', margin: '0.5rem 0' }} />
                    <button id="admin-nav-finder" className={activeTab === 'finder' ? 'active' : ''} onClick={() => setActiveTab('finder')}>🗺️ Finder</button>
                    <button id="admin-nav-mealmap" className={activeTab === 'mealmap' ? 'active' : ''} onClick={() => setActiveTab('mealmap')}>🍽️ MealMap</button>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-danger w-100" onClick={logout}><FiLogOut /> Logout</button>
                </div>
            </aside>

            <main className="main-content fade-in">
                {activeTab === 'analytics' && analytics && (
                    <div className="analytics-view">
                        <div className="stats-cards">
                            <div className="stat-card glass-panel">
                                <h3>Total Queries</h3>
                                <p className="stat-value">{analytics.totalQueries}</p>
                            </div>
                            <div className="stat-card glass-panel">
                                <h3>Unanswered</h3>
                                <p className="stat-value danger">{analytics.unanswered}</p>
                            </div>
                        </div>

                        <div className="charts-grid">
                            <div className="chart-container glass-panel">
                                <h3>Frequent Intents</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={analytics.intentFreq}>
                                        <XAxis dataKey="_id" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container glass-panel">
                                <h3>Queries Per Day</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={analytics.queriesPerDay}>
                                        <XAxis dataKey="_id" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                        <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container glass-panel">
                                <h3>Department Usage</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={analytics.deptUsage} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                                            {analytics.deptUsage.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="students-view">
                        <div className="student-list glass-panel">
                            <h3>Students</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Attendance</th>
                                        <th>CGPA</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataList.map(student => (
                                        <tr key={student._id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{student.attendance ?? 'N/A'}</td>
                                            <td>{student.cgpa ?? 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-small" onClick={() => handleSelectStudent(student._id)}>Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="student-details glass-panel">
                            <h3>Student Profile</h3>
                            {selectedStudent ? (
                                <form onSubmit={handleStudentUpdate} className="student-form">
                                    <div className="input-row">
                                        <label>
                                            Attendance (%)
                                            <input type="number" min="0" max="100" value={studentForm.attendance} onChange={(e) => handleStudentFieldChange('attendance', e.target.value)} />
                                        </label>
                                        <label>
                                            CGPA
                                            <input type="number" min="0" max="10" step="0.01" value={studentForm.cgpa} onChange={(e) => handleStudentFieldChange('cgpa', e.target.value)} />
                                        </label>
                                    </div>

                                    <div className="marks-section">
                                        <h4>Marks</h4>
                                        {studentForm.marks.map((mark, index) => (
                                            <div key={index} className="mark-row">
                                                <input type="text" placeholder="Subject" value={mark.subject} onChange={(e) => handleMarkChange(index, 'subject', e.target.value)} />
                                                <input type="number" placeholder="Score" min="0" max="100" value={mark.score} onChange={(e) => handleMarkChange(index, 'score', e.target.value)} />
                                                <button type="button" className="btn btn-small danger" onClick={() => removeMarkRow(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-small" onClick={addMarkRow}>Add Subject</button>
                                    </div>

                                    <button type="submit" className="btn btn-primary">Save Student</button>
                                </form>
                            ) : (
                                <p>Select a student to view or update their academic profile.</p>
                            )}
                        </div>
                    </div>
                )}

                {['events', 'exams', 'notices'].includes(activeTab) && (
                    <div className="crud-view">
                        <div className="crud-form glass-panel">
                            <h3>Add New {activeTab.slice(0, -1)}</h3>
                            <form onSubmit={handleCreate}>
                                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                    <option value="all">All Departments</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">CIVIL</option>
                                    <option value="EE">EE</option>
                                </select>
                                <button type="submit" className="btn"><FiPlus /> Add</button>
                            </form>
                        </div>

                        <div className="data-list glass-panel">
                            <h3>Existing Records</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Dept.</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataList.map(item => (
                                        <tr key={item._id}>
                                            <td>{item.title}</td>
                                            <td>{item.department}</td>
                                            <td>{new Date(item.date).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn-icon danger" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="team-view centered-panel">
                        <div className="team-card glass-panel">
                            <h1>TEAM 17</h1>
                            <p className="team-welcome">Welcome to Team 17 Management</p>
                            <div className="team-btn-group">
                                <button className="btn btn-primary" onClick={() => navigate('/admin/add-member')}>
                                    <FiPlus /> Add Member
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate('/admin/view-members')}>
                                    View Members
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finder' && <FinderAdmin />}
                {activeTab === 'mealmap' && <MealMapAdmin />}
            </main>
        </div>
    );
};

export default AdminDashboard;
