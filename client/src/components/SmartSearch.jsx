import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { FiSearch, FiX, FiUser, FiMapPin, FiCoffee, FiCalendar, FiBell } from 'react-icons/fi';
import './SmartSearch.css';

// Keyword-heuristic classifier
const classifyQuery = (q) => {
    const lower = q.toLowerCase();
    if (/faculty|professor|dr\.|hod|teacher|cabin|staff|lecturer/.test(lower)) return 'faculty';
    if (/block|building|lab|library|canteen location|auditorium|hostel|parking|ground|hall|office/.test(lower)) return 'location';
    if (/lunch|dinner|breakfast|mess|food|canteen menu|meal|eat|menu/.test(lower)) return 'menu';
    if (/event|fest|seminar|workshop|function|sports/.test(lower)) return 'events';
    if (/notice|circular|announcement|alert|update/.test(lower)) return 'notices';
    return 'all';
};

const categoryMeta = {
    faculty:   { icon: <FiUser />,     label: 'Faculty',   color: '#818cf8' },
    location:  { icon: <FiMapPin />,   label: 'Location',  color: '#34d399' },
    menu:      { icon: <FiCoffee />,   label: 'Food Menu', color: '#fb923c' },
    events:    { icon: <FiCalendar />, label: 'Event',     color: '#a78bfa' },
    notices:   { icon: <FiBell />,     label: 'Notice',    color: '#60a5fa' },
};

const SmartSearch = ({ onNavigate }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('all');
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const runSearch = async (q) => {
        if (!q.trim()) { setResults([]); return; }
        const cat = classifyQuery(q);
        setCategory(cat);
        setLoading(true);
        try {
            const combined = [];
            if (cat === 'all' || cat === 'faculty') {
                const { data } = await axios.get(`${API_ENDPOINTS.FINDER}?type=faculty&query=${encodeURIComponent(q)}`);
                data.slice(0,3).forEach(d => combined.push({ ...d, _cat: 'faculty' }));
            }
            if (cat === 'all' || cat === 'location') {
                const { data } = await axios.get(`${API_ENDPOINTS.FINDER}?type=location&query=${encodeURIComponent(q)}`);
                data.slice(0,3).forEach(d => combined.push({ ...d, _cat: 'location' }));
            }
            if (cat === 'all' || cat === 'menu') {
                const { data } = await axios.get(`${API_ENDPOINTS.MEALMAP}`);
                data.filter(d => d.items.some(i => i.toLowerCase().includes(q.toLowerCase())) || (d.special && d.special.toLowerCase().includes(q.toLowerCase())))
                    .slice(0,3).forEach(d => combined.push({ ...d, _cat: 'menu', name: `${d.type} — ${d.mealTime} (${d.day})` }));
            }
            setResults(combined.slice(0, 6));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(val), 350);
    };

    const handleResultClick = (result) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        if (onNavigate) onNavigate(result._cat, result);
    };

    return (
        <>
            <button className="smart-search-trigger" id="smart-search-open" onClick={() => setOpen(true)} title="Smart Search (Ctrl+K)">
                <FiSearch size={18} />
                <span>Search campus...</span>
                <kbd>Ctrl K</kbd>
            </button>

            {open && (
                <div className="smart-search-overlay" onClick={() => setOpen(false)}>
                    <div className="smart-search-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="smart-search-bar">
                            <FiSearch className="ss-icon" size={20} />
                            <input
                                ref={inputRef}
                                id="smart-search-input"
                                type="text"
                                placeholder="Search faculty, food, locations, events..."
                                value={query}
                                onChange={handleInput}
                            />
                            {query && <button className="ss-clear" onClick={() => { setQuery(''); setResults([]); }}><FiX /></button>}
                            <button className="ss-close" onClick={() => setOpen(false)}><FiX size={18} /></button>
                        </div>

                        {query && category !== 'all' && (
                            <div className="ss-category-banner" style={{ borderColor: categoryMeta[category]?.color }}>
                                <span style={{ color: categoryMeta[category]?.color }}>
                                    {categoryMeta[category]?.icon} Searching in: {categoryMeta[category]?.label}
                                </span>
                            </div>
                        )}

                        {loading && <div className="ss-loading">Searching...</div>}

                        {!loading && results.length > 0 && (
                            <div className="ss-results">
                                {results.map((r, i) => {
                                    const meta = categoryMeta[r._cat] || categoryMeta.notices;
                                    return (
                                        <button key={i} className="ss-result-item" id={`ss-result-${i}`} onClick={() => handleResultClick(r)}>
                                            <span className="ss-result-icon" style={{ color: meta.color }}>{meta.icon}</span>
                                            <div className="ss-result-text">
                                                <span className="ss-result-name">{r.name}</span>
                                                <span className="ss-result-sub">
                                                    {r._cat === 'faculty'  && [r.department, r.cabin, r.building].filter(Boolean).join(' • ')}
                                                    {r._cat === 'location' && [r.block, r.building, r.landmark].filter(Boolean).join(' • ')}
                                                    {r._cat === 'menu'     && r.items?.slice(0,3).join(', ')}
                                                </span>
                                            </div>
                                            <span className="ss-result-badge" style={{ background: meta.color + '22', color: meta.color }}>
                                                {meta.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && query && results.length === 0 && (
                            <div className="ss-no-results">No results found for "{query}"</div>
                        )}

                        <div className="ss-hints">
                            <span>Try: "Dr. Kumar", "CSE block", "lunch menu", "upcoming events"</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartSearch;
