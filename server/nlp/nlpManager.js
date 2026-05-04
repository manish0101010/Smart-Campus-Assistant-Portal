const { NlpManager } = require('node-nlp');
const fs = require('fs');
const { normalizeText, isGreeting, isGoodbye, isThankYou, extractSearchTerms, detectFollowUp } = require('../utils/textNormalizer');

const manager = new NlpManager({ languages: ['en'], forceNER: true, threshold: 0.5 });

const trainModel = async () => {
    // ========== EXPANDED GREETING PHRASES (15+) ==========
    ['hi', 'hii', 'hiii', 'hiiii', 'hiiiii', 'hiiiiii', 'hiiiiiii',
     'hello', 'helloo', 'hellooo', 'helloooo',
     'hey', 'heyy', 'heyyy', 'heyyyy', 'heyyyyy',
     'hiya', 'hiyaa', 'hiyaaa',
     'yo', 'yoo', 'yooo',
     'good morning', 'good evening', 'good afternoon',
     'greetings', 'greetings!', 'greetz',
     'howdy', 'sup', "what's up", 'whats up', 'wassup',
     'hi there', 'hello there', 'hey there',
     'start', 'begin', 'open', 'help'
    ].forEach(p => manager.addDocument('en', p, 'greeting'));

    // ========== EXPANDED EXAM PHRASES (20+) ==========
    ['exam schedule', 'exam dates', 'my exams', 'upcoming exams', 'exams this week',
     'when is exam', 'when are my exams', 'next exam', 'first exam', 'last exam',
     'test dates', 'midterm dates', 'final exam dates', 'semester exam',
     'exam timetable', 'exam calendar', 'exam list', 'exam timing',
     'do i have exams', 'any exams', 'exams coming up', 'exam this week',
     'exam next week', 'exam tomorrow', 'exam today', 'exam soon',
     'summarise exam schedule', 'summarize exams', 'exam summary', 'exam overview',
     'which exam first', 'which exam next', 'earliest exam', 'latest exam',
     'exam for cse', 'exam for ece', 'exam for mech', 'exam for civil',
     'internal exam', 'external exam', 'practical exam', 'viva exam'
    ].forEach(p => manager.addDocument('en', p, 'exam.query'));

    // ========== EXPANDED EVENT PHRASES (20+) ==========
    ['events', 'upcoming events', 'campus events', 'college events', 'department events',
     'what events', 'any events', 'new events', 'latest events', 'recent events',
     'cultural fest', 'tech fest', 'sports meet', 'seminar', 'workshop',
     'function', 'celebration', 'competition', 'hackathon', 'conference',
     'event this week', 'event next week', 'event today', 'event tomorrow',
     'list events', 'show events', 'tell me about events', 'what is happening',
     'any function', 'any celebration', 'any program', 'any activity',
     'summarise events', 'event summary', 'event overview'
    ].forEach(p => manager.addDocument('en', p, 'event.query'));

    // ========== EXPANDED NOTICE PHRASES (20+) ==========
    ['notices', 'notice', 'announcements', 'announcement', 'circular', 'circulars',
     'latest notice', 'new notice', 'recent notice', 'recent announcement',
     'any notice', 'any announcement', 'any new notice', 'any circular',
     'admin notice', 'department notice', 'college notice', 'official notice',
     'important notice', 'urgent notice', 'notice board', 'notice for students',
     'what notice', 'show notices', 'tell me notices', 'give me notices',
     'notice today', 'notice this week', 'notice yesterday',
     'summarise notices', 'notice summary', 'notice overview'
    ].forEach(p => manager.addDocument('en', p, 'notice.query'));

    // ========== EXPANDED FINDER - FACULTY PHRASES (20+) ==========
    ['faculty', 'faculties', 'professor', 'professors', 'teacher', 'teachers',
     'where is dr rao', 'where is dr smith', 'where is dr kumar', 'where is dr john',
     'find professor', 'find dr', 'find faculty', 'find teacher',
     'cabin of hod', 'cabin of head', 'cabin of professor',
     'which cabin', 'what cabin', 'room number', 'office location',
     'hod cabin', 'head cabin', 'dean cabin', 'principal cabin',
     'faculty location', 'teacher location', 'professor office',
     'contact of faculty', 'faculty contact', 'faculty phone', 'faculty email',
     'department head', 'hod cse', 'hod ece', 'hod mech', 'hod civil',
     'cse faculty', 'ece faculty', 'mech faculty', 'civil faculty',
     'show faculty', 'list faculty', 'all faculty', 'faculty details',
     'dr rao cabin', 'dr smith cabin', 'dr kumar cabin', 'professor cabin',
     'faculty building', 'faculty floor', 'which floor', 'what floor'
    ].forEach(p => manager.addDocument('en', p, 'finder.faculty'));

    // ========== EXPANDED FINDER - LOCATION PHRASES (20+) ==========
    ['location', 'where', 'find', 'reach', 'directions', 'how to get',
     'cse block', 'cse building', 'cse department', 'cse dept',
     'ece block', 'ece building', 'ece department', 'ece dept',
     'mech block', 'mech building', 'mech department', 'mech dept',
     'civil block', 'civil building', 'civil department', 'civil dept',
     'library', 'canteen', 'cafeteria', 'mess', 'hostel', 'hostels',
     'auditorium', 'auditorium', 'exam hall', 'examination hall',
     'principal office', 'admin block', 'admin office', 'office',
     'lab', 'labs', 'laboratory', 'laboratories',
     'classroom', 'classrooms', 'lecture hall', 'seminar hall',
     'gym', 'gymnasium', 'sports ground', 'playground',
     'parking', 'parking area', 'parking lot',
     'medical center', 'health center', 'hospital',
     'block a', 'block b', 'block c', 'main block', 'new block',
     'building', 'buildings', 'floor', 'floors',
     'where is', 'how to reach', 'directions to', 'location of',
     'find cse', 'find ece', 'find library', 'find canteen',
     'cse blk', 'ece blk', 'mech blk', 'civil blk', 'cse building'
    ].forEach(p => manager.addDocument('en', p, 'finder.location'));

    // ========== EXPANDED MENU - TODAY PHRASES (20+) ==========
    ['menu', 'food', 'lunch', 'breakfast', 'dinner', 'meal', 'meals',
     'today menu', 'todays menu', 'today food', 'todays food',
     'what is lunch', 'what is breakfast', 'what is dinner',
     'what for lunch', 'what for breakfast', 'what for dinner',
     'lunch today', 'breakfast today', 'dinner today',
     'mess menu', 'mess food', 'mess lunch', 'mess breakfast', 'mess dinner',
     'canteen menu', 'canteen food', 'cafeteria menu',
     'today special', 'todays special', 'special dish', 'special item',
     'today items', 'todays items', 'todays meal',
     'show menu', 'display menu', 'view menu',
     'what can i eat', 'what to eat', 'food available',
     'rice', 'dal', 'paneer', 'vegetables', 'curry', 'chapati', 'roti',
     'breakfast items', 'lunch items', 'dinner items',
     'north indian', 'south indian', 'chinese', 'continental',
     'veg', 'non veg', 'vegetarian', 'non vegetarian'
    ].forEach(p => manager.addDocument('en', p, 'menu.today'));

    // ========== EXPANDED MENU - WEEKLY PHRASES (20+) ==========
    ['weekly menu', 'week menu', 'full week', 'entire week', 'all week',
     'menu this week', 'food this week', 'meals this week',
     'menu next week', 'food next week', 'meals next week',
     'monday menu', 'tuesday menu', 'wednesday menu', 'thursday menu',
     'friday menu', 'saturday menu', 'sunday menu',
     'monday food', 'tuesday food', 'wednesday food', 'thursday food',
     'friday food', 'saturday food', 'sunday food',
     'show weekly menu', 'display weekly menu', 'full week menu',
     'weekly mess', 'weekly canteen', 'weekly food plan',
     'menu for week', 'food for week', 'meals for week',
     'mon menu', 'tue menu', 'wed menu', 'thu menu', 'fri menu', 'sat menu', 'sun menu',
     'day wise menu', 'day by day menu', 'menu schedule',
     'weekly schedule', 'menu timetable', 'food timetable'
    ].forEach(p => manager.addDocument('en', p, 'menu.weekly'));

    // Academic
    ['how am I doing','check my performance','am I doing well','show my academic progress',
     'how is my academic status','what is my academic report','give me my academic summary',
     'how are my grades','tell me about my studies','what is my attendance','am I passing',
     'show my marks','how is my cgpa','what is my score','academic overview'
    ].forEach(p => manager.addDocument('en', p, 'academic.query'));

    // Risk
    ['am I at risk','will I fail','am I in danger academically','is my attendance critical',
     'should I be worried','am I going to be barred','what is my risk level',
     'am I safe in exams','danger alert for my studies','how risky is my performance',
     'will I be detained','am I at risk of failing','check my risk status',
     'what is my academic risk','any academic warnings for me'
    ].forEach(p => manager.addDocument('en', p, 'risk.query'));

    // ========== EXPANDED ENTITIES - DEPARTMENTS ==========
    manager.addNamedEntityText('department', 'CSE', ['en'], ['CSE', 'computer science', 'cs', 'comp', 'computer sci']);
    manager.addNamedEntityText('department', 'ECE', ['en'], ['ECE', 'electronics', 'ec', 'ele', 'electronic']);
    manager.addNamedEntityText('department', 'EE',  ['en'], ['EE', 'electrical', 'electrical engineering']);
    manager.addNamedEntityText('department', 'MECH',['en'], ['MECH', 'mechanical', 'me', 'mech']);
    manager.addNamedEntityText('department', 'CIVIL',['en'], ['CIVIL', 'civil']);
    manager.addNamedEntityText('department', 'IT',   ['en'], ['IT', 'information technology']);

    // ========== EXPANDED ENTITIES - DATE KEYWORDS ==========
    manager.addNamedEntityText('date_keyword', 'today',      ['en'], ['today', 'this day', 'todays', 'todays']);
    manager.addNamedEntityText('date_keyword', 'tomorrow',   ['en'], ['tomorrow', 'next day', 'tmrw', 'tmrw']);
    manager.addNamedEntityText('date_keyword', 'this week',  ['en'], ['this week', 'current week', 'this wk']);
    manager.addNamedEntityText('date_keyword', 'next week',  ['en'], ['next week', 'upcoming week', 'next wk']);
    manager.addNamedEntityText('date_keyword', 'first week', ['en'], ['first week', 'week one', '1st week']);
    manager.addNamedEntityText('date_keyword', 'yesterday',  ['en'], ['yesterday', 'last day', 'yday']);
    manager.addNamedEntityText('date_keyword', 'this month', ['en'], ['this month', 'current month', 'this mnth']);

    // ========== EXPANDED ENTITIES - MEAL TIME ==========
    manager.addNamedEntityText('meal_time', 'Breakfast', ['en'], ['breakfast', 'morning meal', 'morning', 'bfast', 'b/fast']);
    manager.addNamedEntityText('meal_time', 'Lunch',     ['en'], ['lunch', 'afternoon meal', 'noon meal', 'lunchtime', 'lunch time']);
    manager.addNamedEntityText('meal_time', 'Dinner',    ['en'], ['dinner', 'evening meal', 'supper', 'tonight', 'night meal']);

    // ========== EXPANDED ENTITIES - MENU TYPE ==========
    manager.addNamedEntityText('menu_type', 'mess',    ['en'], ['mess', 'hostel food', 'dining hall', 'hostel mess', 'dh']);
    manager.addNamedEntityText('menu_type', 'canteen', ['en'], ['canteen', 'cafeteria', 'food court', 'cafe']);

    // ========== EXPANDED ENTITIES - QUERY MODIFIER ==========
    manager.addNamedEntityText('query_modifier', 'summarize', ['en'], ['summarise', 'summarize', 'summary', 'brief', 'overview', 'short']);
    manager.addNamedEntityText('query_modifier', 'first', ['en'], ['first', 'earliest', 'soonest', 'next', 'upcoming']);
    manager.addNamedEntityText('query_modifier', 'last',  ['en'], ['last', 'latest', 'final', 'end']);
    manager.addNamedEntityText('query_modifier', 'all',   ['en'], ['all', 'every', 'complete', 'full', 'everything']);

    // ========== EXPANDED ENTITIES - DAY OF WEEK ==========
    ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].forEach(day => {
        manager.addNamedEntityText('day_of_week', day, ['en'], [day, day.toLowerCase(), day.substring(0, 3).toLowerCase()]);
    });

    // ========== BETTER GREETING RESPONSES ==========
    // Multiple greeting responses for variety
    manager.addAnswer('en', 'greeting', "Hello! 👋 Welcome! How can I help you today?");
    manager.addAnswer('en', 'greeting', "Hi there! 👋 What can I help you with?");
    manager.addAnswer('en', 'greeting', "Hey! 👋 Ready to assist you. What do you need?");
    manager.addAnswer('en', 'greeting', "Hello! 👋 I'm here to help. Just ask!");

    if (fs.existsSync('./model.nlp')) fs.unlinkSync('./model.nlp');
    await manager.train();
    manager.save();
    console.log('NLP Model trained and saved with enhanced phrases.');
};

/**
 * Process user query with text normalization
 * @param {string} query - Raw user input
 * @param {string} lastIntent - Previous intent for context
 * @returns {Promise<object>} - NLP response with intent and entities
 */
const processQuery = async (query, lastIntent = null) => {
    if (!fs.existsSync('./model.nlp')) await trainModel();
    manager.load();
    
    // Normalize the input text
    const normalizedQuery = normalizeText(query);
    
    // Check for greetings first (before NLP)
    if (isGreeting(normalizedQuery)) {
        return {
            intent: 'greeting',
            score: 1.0,
            answer: `Hello 👋 Welcome back! How can I help you today? You can ask about exams, menu, faculty, notices, events, etc.`,
            entities: []
        };
    }
    
    // Check for goodbyes
    if (isGoodbye(normalizedQuery)) {
        return {
            intent: 'goodbye',
            score: 1.0,
            answer: "Goodbye! 👋 Have a great day! Feel free to come back if you need any help.",
            entities: []
        };
    }
    
    // Check for thank you
    if (isThankYou(normalizedQuery)) {
        return {
            intent: 'thanks',
            score: 1.0,
            answer: "You're welcome! 😊 Is there anything else I can help you with?",
            entities: []
        };
    }
    
    // Process through NLP
    const response = await manager.process('en', normalizedQuery);
    
    // Add normalized query for context
    response.normalizedQuery = normalizedQuery;
    response.rawQuery = query;
    
    return response;
};

module.exports = { trainModel, processQuery };
