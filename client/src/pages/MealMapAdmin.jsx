import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiPlus, FiTrash2, FiCoffee, FiStar } from 'react-icons/fi';
import './MealMapAdmin.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Daily'];
const MEAL_TIMES = ['Breakfast','Lunch','Dinner','Snacks','All Day'];

const defaultForm = { type: 'mess', day: 'Monday', mealTime: 'Lunch', items: '', special: '', price: '' };

const MealMapAdmin = () => {
    const { user } = useContext(AuthContext);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const [form, setForm] = useState(defaultForm);
    const [menuItems, setMenuItems] = useState([]);
    const [filterDay, setFilterDay] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const fetchMenu = async () => {
        try {
            let url = API_ENDPOINTS.MEALMAP;
            const params = [];
            if (filterType !== 'all') params.push(`type=${filterType}`);
            if (filterDay  !== 'all') params.push(`day=${filterDay}`);
            if (params.length) url += '?' + params.join('&');
            const { data } = await axios.get(url, config);
            setMenuItems(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchMenu(); }, [filterDay, filterType]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.MEALMAP, form, config);
            setForm(defaultForm);
            fetchMenu();
            showSuccess('Menu item added!');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_ENDPOINTS.MEALMAP}/${id}`, config);
            fetchMenu();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="mealmap-admin">
            <div className="mealmap-header">
                <h2>MealMap Management</h2>
                <p className="mealmap-subtitle">Manage mess and canteen menus</p>
            </div>

            {success && <div className="mealmap-success">{success}</div>}

            <div className="mealmap-body">
                {/* ── Form Panel ── */}
                <div className="mealmap-form-panel glass-panel">
                    <h3><FiCoffee /> Add Menu Item</h3>
                    <form onSubmit={handleAdd}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Menu Type</label>
                                <div className="type-toggle">
                                    <button type="button" id="type-mess"
                                        className={`toggle-btn ${form.type === 'mess' ? 'active' : ''}`}
                                        onClick={() => setForm({...form, type: 'mess'})}>
                                        🍛 Mess
                                    </button>
                                    <button type="button" id="type-canteen"
                                        className={`toggle-btn ${form.type === 'canteen' ? 'active' : ''}`}
                                        onClick={() => setForm({...form, type: 'canteen'})}>
                                        ☕ Canteen
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Meal Time</label>
                                <select value={form.mealTime} onChange={e => setForm({...form, mealTime: e.target.value})}>
                                    {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Day *</label>
                            <select id="menu-day" required value={form.day} onChange={e => setForm({...form, day: e.target.value})}>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Menu Items * <span className="hint">(comma-separated)</span></label>
                            <input id="menu-items" type="text" required
                                placeholder="e.g. Rice, Dal, Paneer Curry, Chapati"
                                value={form.items} onChange={e => setForm({...form, items: e.target.value})} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Today's Special <FiStar /></label>
                                <input id="menu-special" type="text" placeholder="e.g. Gulab Jamun"
                                    value={form.special} onChange={e => setForm({...form, special: e.target.value})} />
                            </div>
                            {form.type === 'canteen' && (
                                <div className="form-group">
                                    <label>Price Range</label>
                                    <input id="menu-price" type="text" placeholder="e.g. ₹30–₹80"
                                        value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                                </div>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary mealmap-submit" disabled={loading} id="add-menu-btn">
                            <FiPlus /> {loading ? 'Adding...' : 'Add to Menu'}
                        </button>
                    </form>
                </div>

                {/* ── List Panel ── */}
                <div className="mealmap-list-panel glass-panel">
                    <div className="list-header">
                        <h3>Existing Menu ({menuItems.length})</h3>
                        <div className="list-filters">
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="all">All Types</option>
                                <option value="mess">Mess</option>
                                <option value="canteen">Canteen</option>
                            </select>
                            <select value={filterDay} onChange={e => setFilterDay(e.target.value)}>
                                <option value="all">All Days</option>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {menuItems.length === 0 ? (
                        <p className="mealmap-empty">No menu items yet. Add one using the form.</p>
                    ) : (
                        <div className="menu-entries">
                            {menuItems.map(item => (
                                <div key={item._id} className={`menu-entry-card ${item.type}`}>
                                    <div className="menu-entry-header">
                                        <div className="menu-meta">
                                            <span className={`type-badge ${item.type}`}>
                                                {item.type === 'mess' ? '🍛' : '☕'} {item.type}
                                            </span>
                                            <span className="day-badge">{item.day}</span>
                                            <span className="time-badge">{item.mealTime}</span>
                                        </div>
                                        <button className="btn-icon danger" onClick={() => handleDelete(item._id)}
                                            id={`delete-menu-${item._id}`} title="Delete"><FiTrash2 /></button>
                                    </div>
                                    <div className="menu-items-list">
                                        {item.items.map((i, idx) => <span key={idx} className="food-chip">{i}</span>)}
                                    </div>
                                    {item.special && (
                                        <div className="menu-special"><FiStar /> Special: {item.special}</div>
                                    )}
                                    {item.price && <div className="menu-price">💰 {item.price}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealMapAdmin;
