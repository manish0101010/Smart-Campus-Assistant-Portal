import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { FiStar, FiCalendar } from 'react-icons/fi';
import './MealMapPage.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const MealMapPage = () => {
    const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const [view, setView] = useState('today'); // 'today' | 'weekly'
    const [menuType, setMenuType] = useState('all');
    const [todayItems, setTodayItems] = useState([]);
    const [weeklyItems, setWeeklyItems] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchToday = async () => {
        setLoading(true);
        try {
            const params = [`day=${today}`];
            if (menuType !== 'all') params.push(`type=${menuType}`);
            const { data } = await axios.get(`${API_ENDPOINTS.MEALMAP}?${params.join('&')}`);
            setTodayItems(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchWeekly = async () => {
        setLoading(true);
        try {
            const url = menuType !== 'all'
                ? `${API_ENDPOINTS.MEALMAP_WEEKLY}?type=${menuType}`
                : API_ENDPOINTS.MEALMAP_WEEKLY;
            const { data } = await axios.get(url);
            setWeeklyItems(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (view === 'today') fetchToday();
        else fetchWeekly();
    }, [view, menuType]);

    return (
        <div className="mealmap-page">
            <div className="mealmap-hero">
                <h2>🍽️ MealMap</h2>
                <p>Campus food services — mess &amp; canteen menus</p>
            </div>

            {/* Controls */}
            <div className="mealmap-controls glass-panel">
                <div className="view-toggle">
                    <button id="view-today" className={`view-btn ${view === 'today' ? 'active' : ''}`} onClick={() => setView('today')}>
                        📅 Today's Menu
                    </button>
                    <button id="view-weekly" className={`view-btn ${view === 'weekly' ? 'active' : ''}`} onClick={() => setView('weekly')}>
                        <FiCalendar /> Weekly Menu
                    </button>
                </div>
                <div className="type-toggle-bar">
                    {['all','mess','canteen'].map(t => (
                        <button key={t} id={`meal-type-${t}`}
                            className={`type-pill ${menuType === t ? 'active' : ''}`}
                            onClick={() => setMenuType(t)}>
                            {t === 'all' ? '🍽️ All' : t === 'mess' ? '🍛 Mess' : '☕ Canteen'}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <div className="meal-loading"><div className="meal-spinner" /></div>}

            {/* Today's View */}
            {!loading && view === 'today' && (
                <div className="today-view">
                    <h3 className="day-heading">📆 {today}'s Menu</h3>
                    {todayItems.length === 0 ? (
                        <div className="meal-empty glass-panel">
                            <span>🍽️</span>
                            <p>No menu found for today. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="meal-cards-grid">
                            {todayItems.map(item => (
                                <div key={item._id} className={`meal-card glass-panel ${item.type}`}>
                                    <div className="meal-card-header">
                                        <div className="meal-type-badge">
                                            {item.type === 'mess' ? '🍛' : '☕'} {item.type.toUpperCase()}
                                        </div>
                                        <div className="meal-time-badge">{item.mealTime}</div>
                                    </div>

                                    {item.special && (
                                        <div className="special-banner">
                                            <FiStar /> Today's Special: <strong>{item.special}</strong>
                                        </div>
                                    )}

                                    <ul className="meal-items-list">
                                        {item.items.map((food, i) => <li key={i}>{food}</li>)}
                                    </ul>

                                    {item.price && <div className="meal-price">💰 {item.price}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly View */}
            {!loading && view === 'weekly' && (
                <div className="weekly-view">
                    {Object.keys(weeklyItems).length === 0 ? (
                        <div className="meal-empty glass-panel">
                            <span>📅</span>
                            <p>No weekly menu data available yet.</p>
                        </div>
                    ) : (
                        DAYS.filter(d => weeklyItems[d] || weeklyItems['Daily']).map(day => {
                            const dayItems = [
                                ...(weeklyItems[day] || []),
                                ...(weeklyItems['Daily'] || [])
                            ];
                            if (dayItems.length === 0) return null;
                            return (
                                <div key={day} className={`weekly-day-block glass-panel ${day === today ? 'today-highlight' : ''}`}>
                                    <div className="day-block-header">
                                        <h4>{day} {day === today && <span className="today-tag">Today</span>}</h4>
                                    </div>
                                    <div className="day-meals">
                                        {dayItems.map(item => (
                                            <div key={item._id} className={`day-meal-row ${item.type}`}>
                                                <div className="day-meal-meta">
                                                    <span className={`mini-type-badge ${item.type}`}>
                                                        {item.type === 'mess' ? '🍛' : '☕'}
                                                    </span>
                                                    <span className="day-meal-time">{item.mealTime}</span>
                                                    {item.special && <span className="mini-special"><FiStar /> {item.special}</span>}
                                                </div>
                                                <div className="day-meal-items">
                                                    {item.items.join(' · ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {/* Show Daily items separately if only Daily exists */}
                    {weeklyItems['Daily'] && weeklyItems['Daily'].length > 0 && !DAYS.some(d => weeklyItems[d]) && (
                        <div className="weekly-day-block glass-panel">
                            <div className="day-block-header"><h4>Daily Menu</h4></div>
                            <div className="day-meals">
                                {weeklyItems['Daily'].map(item => (
                                    <div key={item._id} className={`day-meal-row ${item.type}`}>
                                        <div className="day-meal-meta">
                                            <span className={`mini-type-badge ${item.type}`}>{item.type === 'mess' ? '🍛' : '☕'}</span>
                                            <span className="day-meal-time">{item.mealTime}</span>
                                        </div>
                                        <div className="day-meal-items">{item.items.join(' · ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MealMapPage;
