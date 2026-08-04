// ══════════════════════════════════════════════════════════════
//  INNER SIGHT AI — Main Server
//  Express API: mood analysis, email capture, sessions, admin
// ══════════════════════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const path       = require('path');
const fs         = require('fs');

const { generalLimiter }  = require('./middleware/rateLimiter');
const errorHandler        = require('./middleware/errorHandler');
const logger              = require('./middleware/logger');

// ── Route imports ─────────────────────────────────────────────
const moodRoutes     = require('./routes/mood');
const emailRoutes    = require('./routes/email');
const sessionRoutes  = require('./routes/sessions');
const adminRoutes    = require('./routes/admin');
const healthRoutes   = require('./routes/health');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Ensure data directory exists ──────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Security & Utility Middleware ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(morgan('dev'));

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5500',    // VS Code Live Server
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'null',                     // file:// origin for direct open
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, file://)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID','X-Admin-Key'],
}));

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Request Logging ────────────────────────────────────────────
app.use(logger);

// ── Rate Limiting ──────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ── Static (serves frontend if in same repo) ──────────────────
// Uncomment if you place your frontend files in /public
// app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/health',    healthRoutes);
app.use('/api/mood',      moodRoutes);
app.use('/api/email',     emailRoutes);
app.use('/api/sessions',  sessionRoutes);
app.use('/api/admin',     adminRoutes);

// ── 404 Catch ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'Route not found',
    path:    req.originalUrl,
  });
});

// ── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║   Inner Sight AI — Backend Running       ║`);
  console.log(`║   http://localhost:${PORT}                   ║`);
  console.log(`║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)}║`);
  console.log('╚══════════════════════════════════════════╝\n');
  console.log('  Routes active:');
  console.log('  GET  /api/health         → Server status');
  console.log('  POST /api/mood/analyse   → AI mood analysis');
  console.log('  POST /api/email/subscribe → Waitlist signup');
  console.log('  POST /api/sessions/save  → Save quiz session');
  console.log('  GET  /api/admin/stats    → Dashboard stats\n');
});

module.exports = app;
