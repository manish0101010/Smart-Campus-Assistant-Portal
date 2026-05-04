import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginRole, setLoginRole] = useState('Student');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Student', department: 'CSE', semester: '1'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const url = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
            const payload = isLogin ? { email: formData.email, password: formData.password, role: loginRole } : formData;
            const { data } = await axios.post(url, payload);
            login(data);
            navigate(data.role === 'Admin' ? '/admin' : '/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel fade-in">
                <h2 className="title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="subtitle">Smart Campus Assistant Portal</p>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
                        </div>
                    )}
                    <div className="input-group">
                        <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <select name="role" onChange={handleChange} value={formData.role}>
                                    <option value="Student">Student</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="input-row">
                                    <select name="department" onChange={handleChange} value={formData.department}>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="EE">EE</option>
                                    </select>
                                    <select name="semester" onChange={handleChange} value={formData.semester}>
                                        {[1,2,3,4,5,6,7,8].map(sem => (
                                            <option key={sem} value={sem}>Sem {sem}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                    {isLogin && (
                        <div className="role-switch">
                            <button type="button" className={loginRole === 'Student' ? 'active' : ''} onClick={() => setLoginRole('Student')}>Login as Student</button>
                            <button type="button" className={loginRole === 'Admin' ? 'active' : ''} onClick={() => setLoginRole('Admin')}>Login as Admin</button>
                        </div>
                    )}

                    <button type="submit" className="btn submit-btn">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                    
                    <p className="toggle-text">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                            {isLogin ? "Register" : "Login"}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
