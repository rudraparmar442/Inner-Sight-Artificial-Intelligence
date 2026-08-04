// ── routes/health.js ─────────────────────────────────────────
// GET /api/health  → Quick health check for monitoring tools

const express = require('express');
const router  = express.Router();

const START_TIME = Date.now();

router.get('/', (req, res) => {
  const uptimeMs  = Date.now() - START_TIME;
  const uptimeSec = Math.floor(uptimeMs / 1000);

  res.json({
    success: true,
    status:  'ok',
    service: 'Inner Sight AI API',
    version: '1.0.0',
    env:     process.env.NODE_ENV || 'development',
    uptime:  `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`,
    memory:  {
      used:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
    features: {
      openai:  !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'),
      email:   !!(process.env.EMAIL_FROM && process.env.EMAIL_APP_PASSWORD),
      admin:   !!process.env.ADMIN_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
