// ── services/dataStore.js ─────────────────────────────────────
// Simple JSON file-based data persistence.
// No database needed — data lives in ./data/ folder.
// Easy to swap for SQLite / Postgres later.

const fs   = require('fs');
const path = require('path');

const FILES = {
  waitlist: process.env.DATA_FILE        || path.join(__dirname, '../data/waitlist.json'),
  sessions: process.env.SESSIONS_FILE    || path.join(__dirname, '../data/sessions.json'),
  feedback: path.join(__dirname, '../data/feedback.json'),
};

// ── Ensure file exists with default content ───────────────────
function ensureFile(filePath, defaultContent = []) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

// ── Read JSON file ────────────────────────────────────────────
function readFile(filePath) {
  ensureFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ── Write JSON file (atomic write via temp file) ──────────────
function writeFile(filePath, data) {
  ensureFile(filePath);
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

// ══════════════════════════════════════════════
//  WAITLIST OPERATIONS
// ══════════════════════════════════════════════

/**
 * Add email to waitlist.
 * @returns {{ added: boolean, duplicate: boolean }}
 */
function addToWaitlist(email, source = 'website') {
  const list = readFile(FILES.waitlist);
  const norm = email.toLowerCase().trim();

  const exists = list.find(e => e.email === norm);
  if (exists) return { added: false, duplicate: true };

  list.push({
    id:        list.length + 1,
    email:     norm,
    source,
    joinedAt:  new Date().toISOString(),
  });

  writeFile(FILES.waitlist, list);
  return { added: true, duplicate: false };
}

function getWaitlist() {
  return readFile(FILES.waitlist);
}

function getWaitlistCount() {
  return readFile(FILES.waitlist).length;
}

// ══════════════════════════════════════════════
//  SESSION OPERATIONS
// ══════════════════════════════════════════════

/**
 * Save a completed quiz session.
 */
function saveSession(sessionData) {
  const sessions = readFile(FILES.sessions);

  const record = {
    id:          sessions.length + 1,
    sessionId:   sessionData.sessionId,
    mood:        sessionData.mood,
    intensity:   sessionData.intensity,
    scores:      sessionData.scores,
    answers:     sessionData.answers,       // [{qId, optionText, scores}]
    aiUsed:      sessionData.aiUsed || false,
    completedAt: new Date().toISOString(),
  };

  sessions.push(record);
  writeFile(FILES.sessions, sessions);
  return record;
}

function getSessions({ limit = 50, offset = 0, mood = null } = {}) {
  let sessions = readFile(FILES.sessions);
  if (mood) sessions = sessions.filter(s => s.mood === mood);
  return sessions
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(offset, offset + limit);
}

function getSessionCount() {
  return readFile(FILES.sessions).length;
}

/**
 * Aggregate mood distribution from all sessions.
 */
function getMoodDistribution() {
  const sessions = readFile(FILES.sessions);
  const dist = { anxious: 0, sad: 0, neutral: 0, calm: 0, happy: 0, energised: 0 };
  sessions.forEach(s => {
    if (s.mood && dist[s.mood] !== undefined) dist[s.mood]++;
  });
  return dist;
}

/**
 * Get sessions per day for last N days.
 */
function getDailyActivity(days = 7) {
  const sessions = readFile(FILES.sessions);
  const result   = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result[d.toISOString().slice(0, 10)] = 0;
  }

  sessions.forEach(s => {
    const day = s.completedAt.slice(0, 10);
    if (result[day] !== undefined) result[day]++;
  });

  return result;
}

// ══════════════════════════════════════════════
//  FEEDBACK OPERATIONS
// ══════════════════════════════════════════════

function saveFeedback(data) {
  const list = readFile(FILES.feedback);
  list.push({
    id:          list.length + 1,
    sessionId:   data.sessionId,
    mood:        data.mood,
    helpful:     data.helpful,       // true / false
    rating:      data.rating,        // 1–5
    comment:     data.comment || '',
    savedAt:     new Date().toISOString(),
  });
  writeFile(FILES.feedback, list);
}

function getFeedbackStats() {
  const list = readFile(FILES.feedback);
  if (!list.length) return { total: 0, avgRating: 0, helpfulRate: 0 };

  const helpful = list.filter(f => f.helpful === true).length;
  const rated   = list.filter(f => typeof f.rating === 'number');
  const avg     = rated.length
    ? (rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1)
    : 0;

  return {
    total:       list.length,
    avgRating:   parseFloat(avg),
    helpfulRate: Math.round((helpful / list.length) * 100),
  };
}

module.exports = {
  // Waitlist
  addToWaitlist, getWaitlist, getWaitlistCount,
  // Sessions
  saveSession, getSessions, getSessionCount, getMoodDistribution, getDailyActivity,
  // Feedback
  saveFeedback, getFeedbackStats,
};
