const { processQuery } = require('../nlp/nlpManager');
const { handleIntent } = require('../nlp/intentHandlers');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const { analyzeStudent } = require('../utils/studentAnalyzer');
const { normalizeText, extractSearchTerms, detectFollowUp } = require('../utils/textNormalizer');

// Smart fallback responses for unclear queries
const getSmartFallbackResponse = (query, lastIntent) => {
    const normalized = normalizeText(query);
    
    // Check if it's a follow-up question
    if (lastIntent) {
        const followUp = detectFollowUp(normalized, lastIntent);
        if (followUp.isFollowUp) {
            return {
                isFollowUp: true,
                contextType: followUp.contextType
            };
        }
    }
    
    // Generic smart fallback with suggestions
    const fallbacks = [
        "I'm not sure what you mean. Did you want help with:\n1. 📅 Exams\n2. 🍽️ Menu\n3. 🗺️ Faculty Finder\n4. 📢 Notices\n5. 🎉 Events",
        "Can you rephrase that? I'll try again. You can ask about:\n• Exam schedules\n• Today's menu\n• Faculty locations\n• Campus notices\n• Upcoming events",
        "Hmm, I didn't catch that. Try asking like:\n• 'When is my exam?'\n• 'What's for lunch?'\n• 'Where is CSE block?'\n• 'Latest notices'"
    ];
    
    return {
        isFollowUp: false,
        message: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    };
};

// Low confidence handling with clarifying questions
const getClarifyingQuestion = (query, intent) => {
    const clarifyingQuestions = {
        'exam.query': "Did you mean exam schedule or events?",
        'event.query': "Did you mean upcoming events or exam dates?",
        'notice.query': "Did you mean latest notices or announcements?",
        'menu.today': "Did you mean today's menu or weekly menu?",
        'finder.faculty': "Did you mean faculty location or faculty contact?",
        'finder.location': "Did you mean building location or room number?"
    };
    
    return clarifyingQuestions[intent] || null;
};

const handleChat = async (req, res) => {
    const { query, lastIntent, lastEntity } = req.body;
    const user = req.user; // from protect middleware

    try {
        // Process query with normalization
        const nlpResponse = await processQuery(query, lastIntent);
        let replyText = '';
        let intentName = 'fallback';
        let found = false;

        // ========== LOW CONFIDENCE HANDLING ==========
        if (nlpResponse.intent === 'None' || nlpResponse.score < 0.5) {
            // Check for follow-up context first
            if (lastIntent) {
                const followUp = detectFollowUp(normalizeText(query), lastIntent);
                if (followUp.isFollowUp) {
                    intentName = lastIntent;
                    const userCtx = { ...user, _rawQuery: query, _lastEntity: lastEntity };
                    const result = await handleIntent(intentName, nlpResponse.entities || [], userCtx);
                    replyText = result.text;
                    found = result.found;
                    
                    if (found) {
                        res.json({ reply: replyText, intent: intentName });
                        return;
                    }
                }
            }
            
            // Smart fallback response
            const fallback = getSmartFallbackResponse(query, lastIntent);
            if (fallback.isFollowUp) {
                // Continue with context
                intentName = fallback.contextType;
                const userCtx = { ...user, _rawQuery: query };
                const result = await handleIntent(intentName, [], userCtx);
                replyText = result.text;
                found = result.found;
            } else {
                replyText = fallback.message;
                found = false;
            }
        } 
        // ========== HIGH CONFIDENCE HANDLING ==========
        else {
            intentName = nlpResponse.intent;

            // Handle greetings with personalized response
            if (intentName === 'greeting') {
                // Use NLP answer if available, otherwise use personalized fallback
                if (nlpResponse.answer) {
                    replyText = nlpResponse.answer;
                } else {
                    // Fallback responses with variety
                    const greetings = [
                        `Hello ${user.name}! 👋 Welcome back! How can I help you today?`,
                        `Hi ${user.name}! 👋 What can I help you with?`,
                        `Hey there ${user.name}! 👋 Ready to assist you. Just ask!`,
                        `Hello! 👋 Hi ${user.name}! I'm here to help.`
                    ];
                    replyText = greetings[Math.floor(Math.random() * greetings.length)];
                }
                found = true;
            }
            // Handle goodbyes
            else if (intentName === 'goodbye') {
                replyText = nlpResponse.answer || "Goodbye! 👋 Have a great day! Feel free to come back if you need any help.";
                found = true;
            }
            // Handle thanks
            else if (intentName === 'thanks') {
                replyText = nlpResponse.answer || "You're welcome! 😊 Is there anything else I can help you with?";
                found = true;
            }
            // Handle academic queries
            else if (intentName === 'academic.query' || intentName === 'risk.query') {
                const fullUser = await User.findById(user._id);
                if (!fullUser.attendance && !fullUser.cgpa && (!fullUser.marks || fullUser.marks.length === 0)) {
                    replyText = "📋 No academic data is available for your profile yet. Please contact your admin.";
                    found = true;
                } else {
                    const { insights, alerts, riskLevel } = analyzeStudent(fullUser);
                    const lines = [...insights, ...alerts];
                    replyText = `📊 Academic Summary (Risk: ${riskLevel})\n\n` + (lines.length ? lines.join('\n') : "✅ Everything looks good!");
                    found = true;
                }
            }
            // Handle all other intents
            else {
                // Pass raw query for finder name-matching and context awareness
                const userCtx = { ...user, _rawQuery: query, _lastIntent: lastIntent };
                const result = await handleIntent(intentName, nlpResponse.entities || [], userCtx);
                replyText = result.text;
                found = result.found;
                
                // If not found but confidence is medium (0.5-0.7), ask clarifying question
                if (!found && nlpResponse.score >= 0.5 && nlpResponse.score < 0.7) {
                    const clarifyingQuestion = getClarifyingQuestion(query, intentName);
                    if (clarifyingQuestion) {
                        replyText += "\n\n" + clarifyingQuestion;
                    }
                }
            }
        }

        // Store log
        await ChatLog.create({
            query,
            intent: intentName,
            department: user.department,
            resultFound: found
        });

        res.json({ reply: replyText, intent: intentName });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ reply: 'Sorry, I am facing technical difficulties right now.', error: error.message });
    }
};

module.exports = { handleChat };
