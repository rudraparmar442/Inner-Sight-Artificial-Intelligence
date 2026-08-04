// ── middleware/rateLimiter.js ─────────────────────────────────
// Different rate limits for different route sensitivity levels

const rateLimit = require('express-rate-limit');

const windowMs  = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const maxGeneral = parseInt(process.env.RATE_LIMIT_MAX)      || 100;
const maxAI      = parseInt(process.env.AI_RATE_LIMIT_MAX)   || 20;

// ── General API limit: 100 req / 15 min per IP ────────────────
const generalLimiter = rateLimit({
  windowMs,
  max: maxGeneral,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Too many requests. Please wait a moment before trying again.',
  },
  skip: (req) => req.path === '/api/health',
});

// ── AI endpoint: 20 req / 15 min per IP (costs money) ────────
const aiLimiter = rateLimit({
  windowMs,
  max: maxAI,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'AI analysis rate limit reached. Please wait 15 minutes before trying again.',
  },
});

// ── Email endpoint: 5 req / hour per IP (prevent spam) ───────
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Too many signup attempts. Please try again in an hour.',
  },
});

// ── Admin endpoint: 30 req / 15 min ──────────────────────────
const adminLimiter = rateLimit({
  windowMs,
  max: 30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Admin rate limit reached.',
  },
});

module.exports = { generalLimiter, aiLimiter, emailLimiter, adminLimiter };
