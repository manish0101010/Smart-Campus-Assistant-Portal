import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiPlus, FiTrash2, FiUser, FiMapPin } from 'react-icons/fi';
import './FinderAdmin.css';

const DEPARTMENTS = ['CSE', 'ECE', 'EE', 'MECH', 'CIVIL', 'Admin', 'Other'];

const defaultFaculty  = { name: '', department: 'CSE', cabin: '', building: '', floor: '', contact: '', description: '' };
const defaultLocation = { name: '', building: '', block: '', description: '', landmark: '', directions: '' };

const FinderAdmin = () => {
    const { user } = useContext(AuthContext);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const [subTab, setSubTab] = useState('faculty'); // 'faculty' | 'location'
    const [entries, setEntries] = useState([]);
    const [facultyForm, setFacultyForm]   = useState(defaultFaculty);
    const [locationForm, setLocationForm] = useState(defaultLocation);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const fetchEntries = async () => {
        try {
            const { data } = await axios.get(`${API_ENDPOINTS.FINDER}?type=${subTab}`, config);
            setEntries(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEntries(); }, [subTab]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.FINDER, { type: 'faculty', ...facultyForm }, config);
            setFacultyForm(defaultFaculty);
            fetchEntries();
            showSuccess('Faculty added successfully!');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.FINDER, { type: 'location', ...locationForm }, config);
            setLocationForm(defaultLocation);
            fetchEntries();
            showSuccess('Location added successfully!');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_ENDPOINTS.FINDER}/${id}`, config);
            fetchEntries();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="finder-admin">
            <div className="finder-header">
                <h2>Campus Finder Management</h2>
                <p className="finder-subtitle">Manage faculty and campus location directory</p>
            </div>

            <div className="finder-subtab-bar">
                <button
                    className={`subtab-btn ${subTab === 'faculty' ? 'active' : ''}`}
                    onClick={() => setSubTab('faculty')}
                    id="finder-faculty-tab"
                >
                    <FiUser /> Faculty
                </button>
                <button
                    className={`subtab-btn ${subTab === 'location' ? 'active' : ''}`}
                    onClick={() => setSubTab('location')}
                    id="finder-location-tab"
                >
                    <FiMapPin /> Locations
                </button>
            </div>

            {success && <div className="finder-success">{success}</div>}

            <div className="finder-body">
                {/* ── Form Panel ── */}
                <div className="finder-form-panel glass-panel">
                    {subTab === 'faculty' ? (
                        <>
                            <h3><FiUser /> Add Faculty</h3>
                            <form onSubmit={handleAddFaculty}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input id="faculty-name" type="text" placeholder="e.g. Dr. Rajesh Kumar" required
                                            value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select value={facultyForm.department} onChange={e => setFacultyForm({...facultyForm, department: e.target.value})}>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cabin / Room No.</label>
                                        <input id="faculty-cabin" type="text" placeholder="e.g. Room 204"
                                            value={facultyForm.cabin} onChange={e => setFacultyForm({...facultyForm, cabin: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Building</label>
                                        <input id="faculty-building" type="text" placeholder="e.g. Block A"
                                            value={facultyForm.building} onChange={e => setFacultyForm({...facultyForm, building: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Floor</label>
                                        <input id="faculty-floor" type="text" placeholder="e.g. 2nd Floor"
                                            value={facultyForm.floor} onChange={e => setFacultyForm({...facultyForm, floor: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact</label>
                                        <input id="faculty-contact" type="text" placeholder="e.g. ext. 2041"
                                            value={facultyForm.contact} onChange={e => setFacultyForm({...facultyForm, contact: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description / Notes</label>
                                    <input id="faculty-desc" type="text" placeholder="e.g. HOD of CSE Department"
                                        value={facultyForm.description} onChange={e => setFacultyForm({...facultyForm, description: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary finder-submit" disabled={loading} id="add-faculty-btn">
                                    <FiPlus /> {loading ? 'Adding...' : 'Add Faculty'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h3><FiMapPin /> Add Location</h3>
                            <form onSubmit={handleAddLocation}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location Name *</label>
                                        <input id="loc-name" type="text" placeholder="e.g. CSE Department" required
                                            value={locationForm.name} onChange={e => setLocationForm({...locationForm, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Building</label>
                                        <input id="loc-building" type="text" placeholder="e.g. Academic Block B"
                                            value={locationForm.building} onChange={e => setLocationForm({...locationForm, building: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Block</label>
                                        <input id="loc-block" type="text" placeholder="e.g. Block B"
                                            value={locationForm.block} onChange={e => setLocationForm({...locationForm, block: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Landmark</label>
                                        <input id="loc-landmark" type="text" placeholder="e.g. Near Main Gate"
                                            value={locationForm.landmark} onChange={e => setLocationForm({...locationForm, landmark: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input id="loc-desc" type="text" placeholder="e.g. Ground floor of academic block"
                                        value={locationForm.description} onChange={e => setLocationForm({...locationForm, description: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Text Directions</label>
                                    <input id="loc-directions" type="text" placeholder="e.g. Enter from Main Gate → Block B → Room 101"
                                        value={locationForm.directions} onChange={e => setLocationForm({...locationForm, directions: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary finder-submit" disabled={loading} id="add-location-btn">
                                    <FiPlus /> {loading ? 'Adding...' : 'Add Location'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* ── List Panel ── */}
                <div className="finder-list-panel glass-panel">
                    <h3>Existing {subTab === 'faculty' ? 'Faculty' : 'Locations'} ({entries.length})</h3>
                    {entries.length === 0 ? (
                        <p className="finder-empty">No entries yet. Add one using the form.</p>
                    ) : (
                        <div className="finder-entries">
                            {entries.map(entry => (
                                <div key={entry._id} className="finder-entry-card">
                                    <div className="entry-info">
                                        <span className="entry-name">{entry.name}</span>
                                        {entry.department && <span className="entry-tag dept">{entry.department}</span>}
                                        {entry.cabin      && <span className="entry-tag">🚪 {entry.cabin}</span>}
                                        {entry.building   && <span className="entry-tag">🏛️ {entry.building}</span>}
                                        {entry.block      && <span className="entry-tag">📦 {entry.block}</span>}
                                        {entry.landmark   && <span className="entry-tag">📍 {entry.landmark}</span>}
                                    </div>
                                    <button className="btn-icon danger" onClick={() => handleDelete(entry._id)}
                                        id={`delete-entry-${entry._id}`} title="Delete">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinderAdmin;
