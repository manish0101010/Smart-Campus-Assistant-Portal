const Event = require('../models/Event');
const ExamSchedule = require('../models/ExamSchedule');
const Notice = require('../models/Notice');
const CampusEntry = require('../models/CampusEntry');
const MenuItem = require('../models/MenuItem');
const { extractSearchTerms } = require('../utils/textNormalizer');

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const todayName = () => DAYS[new Date().getDay()];

/**
 * Create fuzzy regex for partial matching
 * @param {string} term - Search term
 * @returns {RegExp} - Fuzzy regex
 */
const createFuzzyRegex = (term) => {
    if (!term || term.length < 2) return null;
    // Create a regex that matches partial strings (case insensitive)
    // e.g., "cse" matches "CSE Block", "CSE Department", etc.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
};

/**
 * Enhanced format response with better styling
 */
const formatResponse = (type, docs) => {
    if (docs.length === 0) return `No ${type}s found for your query.`;
    
    const emoji = {
        'Exam': '📅',
        'Event': '🎉',
        'Notice': '📢'
    }[type] || '📋';
    
    let response = `${emoji} ${type} Results (${docs.length} found):\n\n`;
    docs.slice(0, 5).forEach((doc, idx) => {
        response += `${idx + 1}. ${doc.title}\n`;
        response += `   📆 Date: ${new Date(doc.date).toLocaleDateString()}\n`;
        response += `   🏛️ Department: ${doc.department}\n`;
        if (doc.description) {
            response += `   📝 ${doc.description.substring(0, 100)}${doc.description.length > 100 ? '...' : ''}\n`;
        }
        response += '\n';
    });
    return response.trim();
};

/**
 * Enhanced summarize response with better styling
 */
const summarizeResponse = (type, docs) => {
    if (docs.length === 0) return `No ${type}s found.`;
    
    const emoji = {
        'Exam': '📅',
        'Event': '🎉',
        'Notice': '📢'
    }[type] || '📋';
    
    return `${emoji} ${type} Summary (${docs.length} total):\n` +
        docs.slice(0, 10).map((d, i) => `${i + 1}. ${d.title} — ${new Date(d.date).toLocaleDateString()}`).join('\n');
};

const getDateQuery = (entities) => {
    const dateEntity = entities.find(e => e.entity === 'date_keyword');
    const now = new Date();

    if (!dateEntity) return { $gte: new Date(now.setHours(0,0,0,0)) };

    const option = dateEntity.option;
    let targetDate = new Date(now);

    if (option === 'today') {
        return { $gte: new Date(now.setHours(0,0,0,0)), $lt: new Date(now.setHours(23,59,59,999)) };
    }
    if (option === 'tomorrow') {
        targetDate.setDate(now.getDate() + 1);
        return { $gte: new Date(targetDate.setHours(0,0,0,0)), $lt: new Date(targetDate.setHours(23,59,59,999)) };
    }
    if (option === 'this week') {
        const end = new Date(now); end.setDate(now.getDate() + 7);
        return { $gte: new Date(now.setHours(0,0,0,0)), $lt: end };
    }
    if (option === 'next week') {
        const start = new Date(now); start.setDate(now.getDate() + 7);
        const end = new Date(now); end.setDate(now.getDate() + 14);
        return { $gte: start, $lt: end };
    }
    if (option === 'first week') {
        // First 7 days of current month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay  = new Date(now.getFullYear(), now.getMonth(), 8);
        return { $gte: firstDay, $lt: lastDay };
    }
    return { $gte: new Date(now.setHours(0,0,0,0)) };
};

// ─── Main Handler ────────────────────────────────────────────────────────────

const handleIntent = async (intent, entities, userCtx) => {
    // Context mapping
    let targetDept = userCtx.department || 'all';
    const deptEntity = entities.find(e => e.entity === 'department');
    if (deptEntity) targetDept = deptEntity.option;

    const modifier = entities.find(e => e.entity === 'query_modifier');
    const modOption = modifier ? modifier.option : null;

    let deptQuery = { $or: [
        { department: new RegExp(`^${targetDept}$`, 'i') },
        { department: new RegExp('^all$', 'i') }
    ]};

    // ── Exam ─────────────────────────────────────────────────────
    if (intent === 'exam.query') {
        const dateFilter = { date: getDateQuery(entities) };
        const finalQuery = { ...deptQuery, ...dateFilter };
        const exams = await ExamSchedule.find(finalQuery).sort({ date: 1 });

        if (modOption === 'summarize') return { text: summarizeResponse('Exam', exams), found: exams.length > 0 };
        if (modOption === 'first') {
            if (exams.length === 0) return { text: 'No upcoming exams found.', found: false };
            const e = exams[0];
            return { text: `🥇 First upcoming exam:\n${e.title}\n📅 ${new Date(e.date).toLocaleDateString()}\nDept: ${e.department}`, found: true };
        }
        if (modOption === 'last') {
            if (exams.length === 0) return { text: 'No upcoming exams found.', found: false };
            const e = exams[exams.length - 1];
            return { text: `🔚 Last upcoming exam:\n${e.title}\n📅 ${new Date(e.date).toLocaleDateString()}\nDept: ${e.department}`, found: true };
        }
        return { text: formatResponse('Exam', exams), found: exams.length > 0 };
    }

    // ── Event ─────────────────────────────────────────────────────
    if (intent === 'event.query') {
        const dateFilter = { date: getDateQuery(entities) };
        const finalQuery = { ...deptQuery, ...dateFilter };
        const events = await Event.find(finalQuery).sort({ date: 1 });

        if (modOption === 'summarize') return { text: summarizeResponse('Event', events), found: events.length > 0 };
        return { text: formatResponse('Event', events), found: events.length > 0 };
    }

    // ── Notice ────────────────────────────────────────────────────
    if (intent === 'notice.query') {
        const notices = await Notice.find(deptQuery).sort({ date: -1 });
        return { text: formatResponse('Notice', notices), found: notices.length > 0 };
    }

    // ── Finder: Faculty ───────────────────────────────────────────
    if (intent === 'finder.faculty') {
        const rawQuery = userCtx._rawQuery || '';
        const deptEnt = entities.find(e => e.entity === 'department');
        let filter = { type: 'faculty' };

        if (deptEnt) {
            filter.department = new RegExp(deptEnt.option, 'i');
        } else if (rawQuery.trim()) {
            // Use fuzzy search with extracted terms
            const searchTerms = extractSearchTerms(rawQuery);
            if (searchTerms.length > 0) {
                // Try multiple search strategies
                const primaryTerm = searchTerms[0];
                const fuzzyRegex = createFuzzyRegex(primaryTerm);
                
                if (fuzzyRegex) {
                    filter.$or = [
                        { name: fuzzyRegex },
                        { department: fuzzyRegex },
                        { cabin: fuzzyRegex },
                        { building: fuzzyRegex }
                    ];
                }
            }
        }

        const entries = await CampusEntry.find(filter).limit(5);
        if (entries.length === 0) return { text: "I couldn't find that faculty member. Try searching on the Finder tab or ask with a different name.", found: false };

        let reply = `👨‍🏫 Faculty Found (${entries.length}):\n\n`;
        entries.forEach(e => {
            reply += `📌 ${e.name}\n`;
            if (e.department) reply += `   🏛️ Dept: ${e.department}\n`;
            if (e.cabin)      reply += `   🚪 Cabin: ${e.cabin}\n`;
            if (e.building)   reply += `   🏢 Building: ${e.building}\n`;
            if (e.floor)      reply += `   🪜 Floor: ${e.floor}\n`;
            if (e.contact)    reply += `   📞 Contact: ${e.contact}\n`;
            reply += '\n';
        });
        return { text: reply.trim(), found: true };
    }

    // ── Finder: Location ──────────────────────────────────────────
    if (intent === 'finder.location') {
        const rawQuery = userCtx._rawQuery || '';
        
        // Use fuzzy search with extracted terms
        const searchTerms = extractSearchTerms(rawQuery);
        let entries = [];
        
        if (searchTerms.length > 0) {
            const primaryTerm = searchTerms[0];
            const fuzzyRegex = createFuzzyRegex(primaryTerm);
            
            if (fuzzyRegex) {
                entries = await CampusEntry.find({
                    type: 'location',
                    $or: [
                        { name: fuzzyRegex },
                        { building: fuzzyRegex },
                        { block: fuzzyRegex },
                        { description: fuzzyRegex },
                        { landmark: fuzzyRegex }
                    ]
                }).limit(5);
            }
        }
        
        // If no results from fuzzy search, try broader search
        if (entries.length === 0 && rawQuery.trim()) {
            const broadRegex = new RegExp(rawQuery.trim(), 'i');
            entries = await CampusEntry.find({
                type: 'location',
                $or: [
                    { name: broadRegex },
                    { building: broadRegex },
                    { block: broadRegex },
                    { description: broadRegex }
                ]
            }).limit(5);
        }

        if (entries.length === 0) return { text: "I couldn't find that location. Try searching on the Finder tab or ask with a different name.", found: false };

        let reply = `📍 Location Found (${entries.length}):\n\n`;
        entries.forEach(e => {
            reply += `🏛️ ${e.name}\n`;
            if (e.building)    reply += `   🏢 Building: ${e.building}\n`;
            if (e.block)       reply += `   🏗️ Block: ${e.block}\n`;
            if (e.landmark)    reply += `   📍 Landmark: ${e.landmark}\n`;
            if (e.directions)  reply += `   ➡️ Directions: ${e.directions}\n`;
            if (e.description) reply += `   ℹ️ Info: ${e.description}\n`;
            reply += '\n';
        });
        return { text: reply.trim(), found: true };
    }

    // ── Menu: Today ───────────────────────────────────────────────
    if (intent === 'menu.today') {
        const day = todayName();
        const mealEnt  = entities.find(e => e.entity === 'meal_time');
        const typeEnt  = entities.find(e => e.entity === 'menu_type');
        let filter = { $or: [{ day }, { day: 'Daily' }] };
        if (mealEnt) filter.mealTime = mealEnt.option;
        if (typeEnt) filter.type = typeEnt.option;

        const items = await MenuItem.find(filter).sort({ mealTime: 1 });
        if (items.length === 0) return { text: `No menu found for today (${day}). Check back later!`, found: false };

        let reply = `🍽️ Today's Menu (${day}):\n\n`;
        items.forEach(item => {
            reply += `[${item.type.toUpperCase()} — ${item.mealTime}]\n`;
            reply += item.items.map(i => `  • ${i}`).join('\n') + '\n';
            if (item.special) reply += `  ⭐ Special: ${item.special}\n`;
            reply += '\n';
        });
        return { text: reply.trim(), found: true };
    }

    // ── Menu: Weekly ──────────────────────────────────────────────
    if (intent === 'menu.weekly') {
        const typeEnt = entities.find(e => e.entity === 'menu_type');
        const dayEnt  = entities.find(e => e.entity === 'day_of_week');
        let filter = {};
        if (typeEnt) filter.type = typeEnt.option;
        if (dayEnt)  filter.$or  = [{ day: dayEnt.option }, { day: 'Daily' }];

        const items = await MenuItem.find(filter).sort({ day: 1, mealTime: 1 });
        if (items.length === 0) return { text: 'No weekly menu data found.', found: false };

        // Group by day
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.day]) grouped[item.day] = [];
            grouped[item.day].push(item);
        });

        let reply = `📅 Weekly Menu:\n\n`;
        Object.entries(grouped).forEach(([day, dayItems]) => {
            reply += `── ${day} ──\n`;
            dayItems.forEach(item => {
                reply += `  [${item.type.toUpperCase()} — ${item.mealTime}]: ${item.items.slice(0,3).join(', ')}`;
                if (item.special) reply += ` | ⭐ ${item.special}`;
                reply += '\n';
            });
            reply += '\n';
        });
        return { text: reply.trim(), found: true };
    }

    return { text: "Sorry, I didn't understand. Ask about exams, events, notices, faculty locations, or today's menu.", found: false };
};

module.exports = { handleIntent };
