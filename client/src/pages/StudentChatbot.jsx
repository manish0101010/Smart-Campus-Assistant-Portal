import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { FiSend, FiLogOut, FiBell } from 'react-icons/fi';
import './StudentChatbot.css';

// Enhanced quick prompts with more variety
const QUICK_PROMPTS = [
    { label: '📅 Exams this week', text: 'exams this week' },
    { label: "🍽️ Today's menu", text: "what's for lunch today" },
    { label: '🗺️ Find CSE block', text: 'where is CSE block' },
    { label: '📋 Summarise exams', text: 'summarise exam schedule' },
    { label: '📢 Latest notices', text: 'latest announcements' },
    { label: '🎉 Upcoming events', text: 'any events this week' },
    { label: '👨‍🏫 Find faculty', text: 'where is Dr Rao cabin' },
];

const StudentChatbot = ({ showHeader = true }) => {
    const { user, logout } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { text: `Hello ${user.name}! 👋 Welcome to your Smart Campus Assistant!\n\nI can help you with:\n📅 Exam schedules\n🍽️ Today's menu\n🗺️ Faculty & location finder\n📢 Notices & announcements\n🎉 Upcoming events\n\nJust ask me anything!`, sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [lastIntent, setLastIntent] = useState(null); // context awareness
    const [lastEntity, setLastEntity] = useState(null); // store last entity for follow-up

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(API_ENDPOINTS.NOTIFICATIONS, config);
                const notificationList = Array.isArray(data) ? data : data.notifications || [];
                setNotifications(notificationList);
            } catch (error) {
                console.error("Failed to load notifications", error);
            }
        };
        fetchNotifications();
    }, [user.token]);

    const sendMessage = async (text) => {
        const userMsg = text.trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInput('');
        setIsTyping(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(API_ENDPOINTS.CHAT, {
                query: userMsg,
                lastIntent,  // pass context for follow-up queries
                lastEntity,  // pass last entity for context
            }, config);

            setTimeout(() => {
                setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
                // Update context if intent was recognised
                if (data.intent && data.intent !== 'fallback') {
                    setLastIntent(data.intent);
                }
                setIsTyping(false);
            }, 600);
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { text: "Error connecting to the server.", sender: 'bot' }]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        await sendMessage(input);
    };

    const handleQuickPrompt = (text) => {
        sendMessage(text);
    };

    return (
        <div className="chat-layout">
            {showHeader && (
                <header className="chat-header glass-panel">
                    <div className="header-info">
                        <h2>Smart Campus Assistant</h2>
                        <span className="badge">{user.department}</span>
                    </div>
                    <div className="header-actions">
                        <div className="notification-wrapper">
                            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <FiBell size={20} />
                                {notifications.filter(n => !n.seen).length > 0 && <span className="notification-dot"></span>}
                            </button>
                            {showNotifications && (
                                <div className="notification-dropdown glass-panel">
                                    <h4>Notifications</h4>
                                    {notifications.length === 0 ? <p>No new notifications</p> :
                                        notifications.map((n, i) => (
                                            <div key={i} className="notification-item">{n.message}</div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        <button className="icon-btn logout" onClick={logout} title="Logout">
                            <FiLogOut size={20} />
                        </button>
                    </div>
                </header>
            )}

            <main className="chat-container">
                {/* Quick prompt chips */}
                <div className="quick-prompts">
                    {QUICK_PROMPTS.map((p, i) => (
                        <button key={i} className="quick-chip" id={`quick-${i}`} onClick={() => handleQuickPrompt(p.text)}>
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="messages-area glass-panel">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-wrapper ${msg.sender}`}>
                            <div className={`message-bubble ${msg.sender}`}>
                                <pre>{msg.text}</pre>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="message-bubble bot typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form glass-panel" onSubmit={handleSend}>
                    <input
                        id="chat-input"
                        type="text"
                        placeholder="Ask about exams, faculty, today's menu, or events..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="btn send-btn" id="chat-send-btn"><FiSend size={18} /></button>
                </form>
            </main>
        </div>
    );
};

export default StudentChatbot;
