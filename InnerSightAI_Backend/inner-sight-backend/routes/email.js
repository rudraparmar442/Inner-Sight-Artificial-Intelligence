// ── routes/email.js ───────────────────────────────────────────
// POST /api/email/subscribe  → Join waitlist
// POST /api/email/result     → Send mood result to email

const express  = require('express');
const { body, validationResult } = require('express-validator');
const { emailLimiter } = require('../middleware/rateLimiter');
const { addToWaitlist, getWaitlistCount } = require('../services/dataStore');
const { sendWelcomeEmail, sendMoodResultEmail, sendAdminNotification } = require('../services/emailService');
const { getSolutions } = require('../services/solutionsData');

const router = express.Router();

// ══════════════════════════════════════════════
//  POST /api/email/subscribe
//  Body: { email, source? }
// ══════════════════════════════════════════════
router.post('/subscribe', emailLimiter, [
  body('email')
    .isEmail().normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('source')
    .optional()
    .isString().trim()
    .isLength({ max: 50 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error:   errors.array()[0].msg,
      });
    }

    const { email, source = 'website' } = req.body;
    const result = addToWaitlist(email, source);

    if (result.duplicate) {
      return res.status(200).json({
        success:   true,
        duplicate: true,
        message:   'You\'re already on the list! We\'ll be in touch.',
      });
    }

    // Get new count for admin notification
    const count = getWaitlistCount();

    // Send emails (non-blocking — don't fail request if email fails)
    Promise.allSettled([
      sendWelcomeEmail(email),
      sendAdminNotification(email, count),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`  [Email] Send failed (${i}):`, r.reason?.message);
        }
      });
    });

    res.status(201).json({
      success:   true,
      duplicate: false,
      message:   'You\'re on the list! Check your email for a welcome message.',
      count,
    });

  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════
//  POST /api/email/result
//  Body: { email, mood, description, sessionId }
//  Sends mood result to user's email
//
//  NOTE: This used to `await sendMoodResultEmail(...)` before responding,
//  which held the HTTP request open for the full SMTP round-trip
//  (worse on a cold Render instance) and regularly blew past the
//  frontend's 25s timeout. Now it responds immediately and sends the
//  email in the background, same pattern as /subscribe above.
// ══════════════════════════════════════════════
router.post('/result', emailLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('mood').isIn(['anxious','sad','neutral','calm','happy','energised']),
  body('description').isString().trim().isLength({ max: 500 }),
  body('sessionId').isString().trim().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, mood, description, sessionId } = req.body;
    const solutions = getSolutions(mood);

    // Respond immediately — don't make the client wait on SMTP.
    res.json({
      success: true,
      queued:  true,
      message: `We're sending your mood result to ${email}`,
    });

    // Send in the background; log failures instead of throwing into a
    // response that's already gone out.
    sendMoodResultEmail(email, mood, description, solutions)
      .then((result) => {
        if (result?.sent) {
          console.log(`  [Email] Result sent to ${email} (session ${sessionId})`);
        } else {
          console.warn(`  [Email] Result NOT sent to ${email} (session ${sessionId}) — reason: ${result?.reason || 'unknown'}`);
        }
      })
      .catch(err => {
        console.warn(`  [Email] Result send failed for ${email} (session ${sessionId}):`, err?.message);
      });

  } catch (err) {
    next(err);
  }
});

module.exports = router;