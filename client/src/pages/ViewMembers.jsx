import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiArrowLeft, FiTrash2, FiEye } from 'react-icons/fi';
import './ViewMembers.css';

const ViewMembers = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_MEMBERS, config);
            setMembers(data);
        } catch (err) {
            setError('Failed to load members');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await axios.delete(`${API_ENDPOINTS.ADMIN_MEMBERS}/${id}`, config);
                setMembers(members.filter(m => m._id !== id));
            } catch (err) {
                setError('Failed to delete member');
            }
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/admin/member/${id}`);
    };

    return (
        <div className="view-members-container">
            <div className="view-members-card glass-panel">
                <div className="members-header">
                    <div>
                        <button onClick={() => navigate('/admin')} className="btn-back">
                            <FiArrowLeft /> Back to Dashboard
                        </button>
                        <h2>Team Members</h2>
                        <p className="subtitle">Total Members: {members.length}</p>
                    </div>
                    <button onClick={() => navigate('/admin/add-member')} className="btn btn-primary">
                        + Add Member
                    </button>
                </div>

                {error && <div className="alert error">{error}</div>}

                {loading ? (
                    <p className="loading">Loading members...</p>
                ) : members.length === 0 ? (
                    <div className="empty-state">
                        <p>No team members found. Add one to get started!</p>
                    </div>
                ) : (
                    <div className="members-grid">
                        {members.map(member => (
                            <div key={member._id} className="member-card">
                                {member.image && (
                                    <div className="member-image">
                                        <img src={member.image} alt={member.name} />
                                    </div>
                                )}
                                <div className="member-header">
                                    <h3>{member.name}</h3>
                                    <button 
                                        className="btn-icon danger"
                                        onClick={() => handleDelete(member._id)}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="member-info">
                                    <p><strong>Roll:</strong> {member.roll}</p>
                                    <p><strong>Year:</strong> {member.year}</p>
                                    <p><strong>Degree:</strong> {member.degree}</p>
                                    {member.contact && <p><strong>Contact:</strong> {member.contact}</p>}
                                    <p className="about-preview"><strong>Project:</strong> {member.about.substring(0, 60)}...</p>
                                </div>
                                <button 
                                    className="btn btn-info"
                                    onClick={() => handleViewDetails(member._id)}
                                >
                                    <FiEye /> View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewMembers;
