// Text Normalization Utility
// Handles casual typing variations, spelling mistakes, and casual greetings

/**
 * Normalize user input text for better NLP matching
 * @param {string} text - Raw user input
 * @returns {string} - Normalized text
 */
const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    let normalized = text
        // Convert to lowercase
        .toLowerCase()
        // Trim leading/trailing spaces
        .trim()
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ');
    
    // Handle repeated characters (hiiiiii -> hi, heyyyy -> hey)
    normalized = normalized.replace(/(.)\1{2,}/gi, '$1$1');
    
    // Remove extra punctuation but keep sentence structure
    normalized = normalized
        .replace(/!+/g, '!')
        .replace(/\?+/g, '?')
        .replace(/\.+/g, '.')
        .replace(/,{2,}/g, ',');
    
    // Clean up spacing around punctuation
    normalized = normalized.replace(/\s*([,.!?])\s*/g, '$1 ');
    
    // Final trim
    return normalized.trim();
};

/**
 * Check if input is a greeting
 * @param {string} text - Normalized text
 * @returns {boolean}
 */
const isGreeting = (text) => {
    const greetingPatterns = [
        /^hi$/i, /^hii$/i, /^hiii$/i, /^hiiii+$/i,
        /^hello$/i, /^helloo+$/i,
        /^hey$/i, /^heyy+$/i, /^heya$/i,
        /^hiya$/i, /^yo$/i, /^hi there$/i,
        /^good morning$/i, /^good evening$/i, /^good afternoon$/i,
        /^greetings$/i, /^howdy$/i, /^sup$/i,
        /^what's up$/i, /^whats up$/i, /^wassup$/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(text));
};

/**
 * Check if input is a goodbye
 * @param {string} text - Normalized text
 * @returns {boolean}
 */
const isGoodbye = (text) => {
    const goodbyePatterns = [
        /^bye$/i, /^byee+$/i, /^goodbye$/i, /^see you$/i, /^see ya$/i,
        /^talk to you later$/i, /^catch you later$/i, /^logout$/i, /^exit$/i
    ];
    
    return goodbyePatterns.some(pattern => pattern.test(text));
};

/**
 * Check if input is a thank you
 * @param {string} text - Normalized text
 * @returns {boolean}
 */
const isThankYou = (text) => {
    const thankPatterns = [
        /^thanks$/i, /^thank you$/i, /^thx$/i, /^ty$/i,
        /^appreciate it$/i, /^great$/i, /^cool$/i, /^nice$/i
    ];
    
    return thankPatterns.some(pattern => pattern.test(text));
};

/**
 * Extract potential search terms from query for fuzzy matching
 * @param {string} text - Normalized text
 * @returns {string[]} - Array of potential search terms
 */
const extractSearchTerms = (text) => {
    const terms = [];
    
    // Remove common question words and filler words
    const fillerWords = ['where', 'what', 'when', 'how', 'is', 'are', 'the', 'a', 'an', 
                        'can', 'could', 'would', 'should', 'do', 'does', 'did', 
                        'show', 'find', 'get', 'tell', 'give', 'me', 'my', 'i', 'you'];
    
    const words = text.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(w => !fillerWords.includes(w) && w.length > 1);
    
    // Add full phrase
    if (meaningfulWords.length > 0) {
        terms.push(meaningfulWords.join(' '));
    }
    
    // Add individual significant words (length > 2)
    meaningfulWords.forEach(word => {
        if (word.length > 2) {
            terms.push(word);
        }
    });
    
    return terms;
};

/**
 * Check if query is a follow-up to previous context
 * @param {string} text - Current query
 * @param {string} lastIntent - Previous intent
 * @returns {object} - { isFollowUp: boolean, contextType: string }
 */
const detectFollowUp = (text, lastIntent) => {
    const followUpPatterns = {
        'exam.query': ['next', 'another', 'other', 'more', 'what about', 'also', 'and'],
        'menu.today': ['tomorrow', 'next', 'what about', 'also', 'other', 'day'],
        'menu.weekly': ['today', 'what about', 'tomorrow'],
        'finder.faculty': ['and', 'also', 'what about', 'more'],
        'finder.location': ['and', 'also', 'what about', 'more']
    };
    
    const patterns = followUpPatterns[lastIntent];
    if (!patterns) return { isFollowUp: false };
    
    const isFollowUp = patterns.some(pattern => text.toLowerCase().includes(pattern));
    
    return {
        isFollowUp,
        contextType: lastIntent.split('.')[0]
    };
};

module.exports = {
    normalizeText,
    isGreeting,
    isGoodbye,
    isThankYou,
    extractSearchTerms,
    detectFollowUp
};