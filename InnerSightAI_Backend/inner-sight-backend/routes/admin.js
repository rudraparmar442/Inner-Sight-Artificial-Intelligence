// ── routes/admin.js ───────────────────────────────────────────
// GET /api/admin/stats     → Full dashboard stats
// GET /api/admin/waitlist  → Download waitlist as JSON/CSV
// GET /api/admin/sessions  → Full session list

const express    = require('express');
const { query }  = require('express-validator');
const adminAuth  = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const {
  getWaitlist, getWaitlistCount,
  getSessions, getSessionCount,
  getMoodDistribution, getDailyActivity,
  getFeedbackStats,
} = require('../services/dataStore');

const router = express.Router();

// Apply auth + rate limit to all admin routes
router.use(adminLimiter);
router.use(adminAuth);

// ══════════════════════════════════════════════
//  GET /api/admin/stats
//  Returns full dashboard overview
// ══════════════════════════════════════════════
router.get('/stats', async (req, res, next) => {
  try {
    const waitlistCount  = getWaitlistCount();
    const sessionCount   = getSessionCount();
    const moodDist       = getMoodDistribution();
    const dailyActivity  = getDailyActivity(7);
    const feedbackStats  = getFeedbackStats();

    // Top mood
    const topMood = Object.entries(moodDist)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    // Completion estimate (all sessions completed)
    const completionRate = sessionCount > 0 ? '100%' : '0%';

    // AI usage rate
    const sessions = getSessions({ limit: 1000 });
    const aiUsed   = sessions.filter(s => s.aiUsed).length;
    const aiRate   = sessions.length > 0
      ? Math.round((aiUsed / sessions.length) * 100) + '%'
      : '0%';

    res.json({
      success: true,
      overview: {
        waitlistSignups: waitlistCount,
        quizSessions:    sessionCount,
        feedbackTotal:   feedbackStats.total,
        avgRating:       feedbackStats.avgRating,
        helpfulRate:     feedbackStats.helpfulRate + '%',
        aiUsageRate:     aiRate,
      },
      moodDistribution: moodDist,
      topMood,
      dailyActivity,
      feedback: feedbackStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════
//  GET /api/admin/waitlist
//  Query: ?format=json|csv
// ══════════════════════════════════════════════
router.get('/waitlist', async (req, res, next) => {
  try {
    const list   = getWaitlist();
    const format = req.query.format === 'csv' ? 'csv' : 'json';

    if (format === 'csv') {
      const csv = ['id,email,source,joinedAt',
        ...list.map(e => `${e.id},${e.email},${e.source},${e.joinedAt}`)
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
      return res.send(csv);
    }

    res.json({ success: true, count: list.length, waitlist: list });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════
//  GET /api/admin/sessions
//  Query: ?limit=50&offset=0&mood=calm
// ══════════════════════════════════════════════
router.get('/sessions', async (req, res, next) => {
  try {
    const limit  = parseInt(req.query.limit)  || 50;
    const offset = parseInt(req.query.offset) || 0;
    const mood   = req.query.mood || null;

    const sessions = getSessions({ limit, offset, mood });
    const total    = getSessionCount();

    res.json({
      success: true,
      total,
      count:   sessions.length,
      sessions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
