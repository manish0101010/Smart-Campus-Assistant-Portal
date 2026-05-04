import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiArrowLeft } from 'react-icons/fi';
import './AddMember.css';

const AddMember = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        roll: '',
        year: '',
        degree: '',
        about: '',
        hobbies: '',
        contact: '',
        certificate: '',
        internship: '',
        aim: '',
        image: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // Compress image using canvas
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 500;
                    const maxHeight = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, image: compressedBase64 }));
                    setImagePreview(compressedBase64);
                    setError('');
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.roll || !formData.year || !formData.degree || !formData.about || !formData.hobbies || !formData.aim) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.ADMIN_MEMBERS, formData, config);
            setSuccess('Member added successfully!');
            setTimeout(() => {
                navigate('/admin/view-members');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-member-container">
            <div className="add-member-card glass-panel">
                <div className="back-button">
                    <button onClick={() => navigate('/admin')} className="btn-back">
                        <FiArrowLeft /> Back to Dashboard
                    </button>
                </div>

                <h2>Add New Team Member</h2>
                <p className="subtitle">Enter the details of the new team member</p>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleSubmit} className="member-form">
                    <div className="form-group">
                        <label>Member Photo</label>
                        <div className="image-upload-section">
                            <input
                                type="file"
                                id="image-input"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="image-input"
                            />
                            <label htmlFor="image-input" className="image-label">
                                Choose Photo
                            </label>
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Roll Number *</label>
                            <input
                                type="text"
                                name="roll"
                                value={formData.roll}
                                onChange={handleChange}
                                placeholder="Roll Number"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Year *</label>
                            <select name="year" value={formData.year} onChange={handleChange} required>
                                <option value="">Select Year</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Degree *</label>
                            <select name="degree" value={formData.degree} onChange={handleChange} required>
                                <option value="">Select Degree</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="B.E">B.E</option>
                                <option value="M.Tech">M.Tech</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>About Project *</label>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Describe the project..."
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Hobbies *</label>
                        <input
                            type="text"
                            name="hobbies"
                            value={formData.hobbies}
                            onChange={handleChange}
                            placeholder="e.g., Cricket, Photography, Coding"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Info</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="Phone or email address"
                        />
                    </div>

                    <div className="form-group">
                        <label>Certificate</label>
                        <input
                            type="text"
                            name="certificate"
                            value={formData.certificate}
                            onChange={handleChange}
                            placeholder="Certificates obtained (optional)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Internship</label>
                        <input
                            type="text"
                            name="internship"
                            value={formData.internship}
                            onChange={handleChange}
                            placeholder="Internship experience (optional)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Aim/Goal *</label>
                        <textarea
                            name="aim"
                            value={formData.aim}
                            onChange={handleChange}
                            placeholder="What is your goal or aim?"
                            rows="2"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                        {loading ? 'Adding Member...' : 'Add Member'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMember;
