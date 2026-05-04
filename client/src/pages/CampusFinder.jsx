import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { FiSearch, FiUser, FiMapPin } from 'react-icons/fi';
import './CampusFinder.css';

const CampusFinder = () => {
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e && e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.append('query', query.trim());
            if (typeFilter !== 'all') params.append('type', typeFilter);
            const { data } = await axios.get(`${API_ENDPOINTS.FINDER}?${params.toString()}`);
            setResults(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Load all on mount
    useEffect(() => { handleSearch(); }, [typeFilter]);

    return (
        <div className="campus-finder">
            <div className="finder-hero">
                <h2>🗺️ Campus Finder</h2>
                <p>Search for faculty, labs, departments, and campus locations</p>
            </div>

            <form className="finder-search-bar glass-panel" onSubmit={handleSearch}>
                <div className="search-input-wrap">
                    <FiSearch className="search-icon" />
                    <input
                        id="finder-search-input"
                        type="text"
                        placeholder="Search faculty name, department, building..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <div className="type-filters">
                    {['all','faculty','location'].map(t => (
                        <button key={t} type="button" id={`filter-${t}`}
                            className={`filter-pill ${typeFilter === t ? 'active' : ''}`}
                            onClick={() => setTypeFilter(t)}>
                            {t === 'all' ? '🔍 All' : t === 'faculty' ? '👨‍🏫 Faculty' : '📍 Location'}
                        </button>
                    ))}
                </div>
                <button type="submit" className="btn btn-primary search-btn" id="finder-search-btn">Search</button>
            </form>

            {loading && <div className="finder-loading"><div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" /></div>}

            {!loading && searched && (
                <div className="finder-results">
                    {results.length === 0 ? (
                        <div className="finder-no-results glass-panel">
                            <span>🔍</span>
                            <p>No results found. Try a different search term.</p>
                        </div>
                    ) : (
                        <>
                            <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                            <div className="results-grid">
                                {results.map(entry => (
                                    <div key={entry._id} className={`result-card glass-panel ${entry.type}`}>
                                        <div className="result-card-header">
                                            <div className="result-icon-wrap">
                                                {entry.type === 'faculty' ? <FiUser size={20} /> : <FiMapPin size={20} />}
                                            </div>
                                            <div className="result-title-wrap">
                                                <h4>{entry.name}</h4>
                                                <span className={`result-type-badge ${entry.type}`}>
                                                    {entry.type === 'faculty' ? 'Faculty' : 'Location'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="result-details">
                                            {entry.department && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Department</span>
                                                    <span className="detail-value">{entry.department}</span>
                                                </div>
                                            )}
                                            {entry.cabin && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Cabin</span>
                                                    <span className="detail-value">{entry.cabin}</span>
                                                </div>
                                            )}
                                            {entry.building && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Building</span>
                                                    <span className="detail-value">{entry.building}</span>
                                                </div>
                                            )}
                                            {entry.floor && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Floor</span>
                                                    <span className="detail-value">{entry.floor}</span>
                                                </div>
                                            )}
                                            {entry.block && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Block</span>
                                                    <span className="detail-value">{entry.block}</span>
                                                </div>
                                            )}
                                            {entry.landmark && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Landmark</span>
                                                    <span className="detail-value">{entry.landmark}</span>
                                                </div>
                                            )}
                                            {entry.contact && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Contact</span>
                                                    <span className="detail-value">{entry.contact}</span>
                                                </div>
                                            )}
                                        </div>

                                        {entry.directions && (
                                            <div className="directions-box">
                                                <span className="directions-label">🗺️ Directions</span>
                                                <p>{entry.directions}</p>
                                            </div>
                                        )}
                                        {entry.description && (
                                            <p className="result-desc">{entry.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CampusFinder;
