// ── routes/sessions.js ───────────────────────────────────────
// POST /api/sessions/save  → Save a quiz session (frontend calls this)
// GET  /api/sessions       → List sessions (admin use)

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { saveSession, getSessions, getSessionCount, getMoodDistribution } = require('../services/dataStore');

const router = express.Router();

// ══════════════════════════════════════════════
//  POST /api/sessions/save
//  Body: { sessionId, mood, intensity, scores, answers }
// ══════════════════════════════════════════════
router.post('/save', [
  body('sessionId').isString().trim().notEmpty(),
  body('mood').isIn(['anxious','sad','neutral','calm','happy','energised']),
  body('intensity').isInt({ min: 0, max: 100 }),
  body('scores').isObject(),
  body('answers').isArray({ min: 1, max: 10 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: 'Invalid session data', details: errors.array() });
    }

    const session = saveSession(req.body);

    res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      message: 'Session saved.',
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════
//  GET /api/sessions
//  Query: ?limit=20&offset=0&mood=anxious
// ══════════════════════════════════════════════
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('mood').optional().isIn(['anxious','sad','neutral','calm','happy','energised','']),
], async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, mood = null } = req.query;

    const sessions = getSessions({ limit, offset, mood: mood || null });
    const total    = getSessionCount();
    const dist     = getMoodDistribution();

    res.json({
      success: true,
      total,
      count:   sessions.length,
      distribution: dist,
      sessions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
