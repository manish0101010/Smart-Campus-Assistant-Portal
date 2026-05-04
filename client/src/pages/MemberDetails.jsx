import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiArrowLeft } from 'react-icons/fi';
import './MemberDetails.css';

const MemberDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_ENDPOINTS.ADMIN_MEMBERS}/${id}`, config);
            setMember(data);
        } catch (err) {
            setError('Failed to load member details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="member-details-container">
                <p className="loading">Loading member details...</p>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="member-details-container">
                <div className="error-state">
                    <p>{error || 'Member not found'}</p>
                    <button onClick={() => navigate('/admin/view-members')} className="btn btn-primary">
                        Back to Members
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="member-details-container">
            <div className="member-details-card glass-panel">
                <button onClick={() => navigate('/admin/view-members')} className="btn-back">
                    <FiArrowLeft /> Back to Members
                </button>

                <div className="details-header">
                    <h2>{member.name}</h2>
                    <span className="badge">{member.degree}</span>
                </div>

                {member.image && (
                    <div className="member-photo">
                        <img src={member.image} alt={member.name} />
                    </div>
                )}

                <div className="details-grid">
                    <div className="detail-section">
                        <h3>Basic Information</h3>
                        <div className="detail-item">
                            <label>Name</label>
                            <p>{member.name}</p>
                        </div>
                        <div className="detail-item">
                            <label>Roll Number</label>
                            <p>{member.roll}</p>
                        </div>
                        <div className="detail-item">
                            <label>Year</label>
                            <p>{member.year}</p>
                        </div>
                        <div className="detail-item">
                            <label>Degree</label>
                            <p>{member.degree}</p>
                        </div>
                        <div className="detail-item">
                            <label>Contact Info</label>
                            <p>{member.contact || 'Not specified'}</p>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Professional Details</h3>
                        <div className="detail-item">
                            <label>About Project</label>
                            <p>{member.about}</p>
                        </div>
                        <div className="detail-item">
                            <label>Hobbies</label>
                            <p>{member.hobbies}</p>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Additional Information</h3>
                        <div className="detail-item">
                            <label>Certificate</label>
                            <p>{member.certificate || 'Not specified'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Internship</label>
                            <p>{member.internship || 'Not specified'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Aim/Goal</label>
                            <p>{member.aim}</p>
                        </div>
                    </div>
                </div>

                <div className="details-footer">
                    <p className="timestamp">
                        Member since: {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemberDetails;
