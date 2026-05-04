/**
 * studentAnalyzer.js
 * Modular AI Academic Intelligence Engine
 * Single source of truth for all student analysis logic.
 */

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
const cache = new Map(); // Map<userId, { result, timestamp }>
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Sub-Analyzers ────────────────────────────────────────────────────────────

/**
 * Analyze attendance and return insights, alerts, and a risk score contribution.
 */
function analyzeAttendance(attendance) {
    const insights = [];
    const alerts = [];
    let score = 0;

    if (attendance === null || attendance === undefined) {
        return { insights, alerts, score };
    }

    const deficit = 75 - attendance;

    if (attendance < 75) {
        score += deficit * 0.5;
        insights.push(`📉 Your attendance is ${attendance}% — below the required 75% minimum.`);

        if (attendance < 60) {
            alerts.push(`🔴 Critical: Attendance at ${attendance}% is severely low. You risk being barred from exams.`);
            insights.push(`💡 Action: You need to attend every remaining class without fail to recover.`);
        } else {
            alerts.push(`🟠 Warning: Attendance is below 75%. Attend at least 2 extra classes per week to recover.`);
            insights.push(`💡 Action: Increase attendance by ${Math.ceil(deficit)}% — aim for one additional class per subject per week.`);
        }
    } else if (attendance >= 75 && attendance < 78) {
        // Predictive / trend-based: near the edge
        score += 5;
        insights.push(`⚠️ Your attendance is ${attendance}% — just above the 75% minimum. Stay consistent.`);
        alerts.push(`🟡 Predictive Alert: Attendance is close to the danger zone. Missing even 1–2 classes could drop you below 75%.`);
    } else {
        insights.push(`✅ Attendance: ${attendance}% — Good. Keep attending regularly.`);
    }

    return { insights, alerts, score };
}

/**
 * Analyze subject-wise marks and return insights, alerts, and risk score contribution.
 */
function analyzeMarks(marks) {
    const insights = [];
    const alerts = [];
    let score = 0;
    const weakSubjects = [];

    if (!marks || marks.length === 0) {
        return { insights, alerts, score, weakSubjects };
    }

    const totalScore = marks.reduce((sum, m) => sum + m.score, 0);
    const avgMarks = totalScore / marks.length;
    const avgDeficit = 50 - avgMarks;

    marks.forEach(({ subject, score: s }) => {
        if (s < 35) {
            weakSubjects.push(subject);
            alerts.push(`🔴 Failing Risk: Score in ${subject} is ${s}% — critically low.`);
            insights.push(`💡 Action: Focus urgently on ${subject}. Aim to score at least 50% by revising fundamentals.`);
            score += (50 - s) * 0.5;
        } else if (s < 50) {
            weakSubjects.push(subject);
            alerts.push(`🟠 Weak Subject: ${subject} at ${s}% is below passing average.`);
            insights.push(`💡 Action: Spend additional study time on ${subject} — aim for 60%+ in the next assessment.`);
            score += (50 - s) * 0.3;
        } else if (s < 65) {
            insights.push(`📘 ${subject}: ${s}% — Average. There is room for improvement.`);
        } else {
            insights.push(`✅ ${subject}: ${s}% — Good performance.`);
        }
    });

    if (avgMarks < 50 && avgDeficit > 0) {
        insights.push(`📊 Overall average marks: ${avgMarks.toFixed(1)}% — below the 50% threshold.`);
    } else {
        insights.push(`📊 Overall average marks: ${avgMarks.toFixed(1)}%.`);
    }

    return { insights, alerts, score, weakSubjects };
}

/**
 * Analyze CGPA and return insights, alerts, and a risk score contribution.
 */
function analyzeCGPA(cgpa) {
    const insights = [];
    const alerts = [];
    let score = 0;

    if (cgpa === null || cgpa === undefined) {
        return { insights, alerts, score };
    }

    if (cgpa < 5) {
        score += (6 - cgpa) * 10;
        insights.push(`📉 CGPA: ${cgpa} — significantly below the 6.0 standard.`);
        alerts.push(`🔴 Academic Standing: CGPA of ${cgpa} puts you at high risk. Immediate improvement is needed.`);
        insights.push(`💡 Action: Consult your academic advisor and prioritize your lowest-scoring subjects.`);
    } else if (cgpa < 6) {
        score += (6 - cgpa) * 10;
        insights.push(`⚠️ CGPA: ${cgpa} — below the 6.0 threshold. Improvement required.`);
        alerts.push(`🟡 Predictive Alert: If CGPA continues to fall, you may face academic probation.`);
        insights.push(`💡 Action: Aim to score 70%+ in upcoming exams to raise your CGPA above 6.0.`);
    } else if (cgpa < 7.5) {
        insights.push(`📈 CGPA: ${cgpa} — Satisfactory. Push for 7.5+ to strengthen your academic profile.`);
    } else {
        insights.push(`✅ CGPA: ${cgpa} — Excellent academic standing.`);
    }

    return { insights, alerts, score };
}

/**
 * Map total risk score to a human-readable level.
 */
function calculateRiskLevel(totalScore) {
    if (totalScore <= 0) return 'None';
    if (totalScore <= 20) return 'Low';
    if (totalScore <= 50) return 'Medium';
    return 'High';
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeStudent(student)
 *
 * Central analysis function. Uses modular sub-analyzers and an in-memory
 * cache (5-minute TTL) to avoid redundant computation.
 *
 * @param {Object} student - Mongoose User document
 * @returns {{ insights: string[], alerts: string[], riskLevel: string, riskScore: number }}
 */
function analyzeStudent(student) {
    const userId = student._id?.toString();

    // Cache check
    if (userId) {
        const cached = cache.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.result;
        }
    }

    const { attendance, cgpa, marks } = student;

    // Check if ANY academic data exists
    const hasData =
        (attendance !== null && attendance !== undefined) ||
        (cgpa !== null && cgpa !== undefined) ||
        (marks && marks.length > 0);

    if (!hasData) {
        const result = { insights: [], alerts: [], riskLevel: 'Unknown', riskScore: 0, hasData: false };
        if (userId) cache.set(userId, { result, timestamp: Date.now() });
        return result;
    }

    // Run sub-analyzers
    const attResult = analyzeAttendance(attendance);
    const marksResult = analyzeMarks(marks);
    const cgpaResult = analyzeCGPA(cgpa);

    const riskScore = parseFloat((attResult.score + marksResult.score + cgpaResult.score).toFixed(2));
    const riskLevel = calculateRiskLevel(riskScore);

    const insights = [...attResult.insights, ...marksResult.insights, ...cgpaResult.insights];
    const alerts = [...attResult.alerts, ...marksResult.alerts, ...cgpaResult.alerts];

    const result = { insights, alerts, riskLevel, riskScore, hasData: true };

    // Store in cache
    if (userId) cache.set(userId, { result, timestamp: Date.now() });

    return result;
}

/**
 * Invalidate cache for a specific student (call after admin updates their data).
 */
function invalidateCache(userId) {
    if (userId) cache.delete(userId.toString());
}

module.exports = { analyzeStudent, invalidateCache };
