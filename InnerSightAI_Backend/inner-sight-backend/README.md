# Inner Sight AI — Backend API

Complete Node.js + Express backend for the Inner Sight AI mood intelligence platform.

## Quick Start (3 steps)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (see Configuration below)

# 3. Start the server
npm run dev
```

Server runs at: **http://localhost:5000**

---

## Project Structure

```
inner-sight-backend/
├── server.js                  ← Entry point
├── package.json
├── .env.example               ← Copy to .env
├── api-connector.js           ← Copy this to your frontend /js/ folder
│
├── routes/
│   ├── health.js              ← GET  /api/health
│   ├── mood.js                ← POST /api/mood/analyse
│   │                             POST /api/mood/feedback
│   ├── email.js               ← POST /api/email/subscribe
│   │                             POST /api/email/result
│   ├── sessions.js            ← POST /api/sessions/save
│   │                             GET  /api/sessions
│   └── admin.js               ← GET  /api/admin/stats
│                                 GET  /api/admin/waitlist
│                                 GET  /api/admin/sessions
│
├── middleware/
│   ├── rateLimiter.js         ← Per-route rate limiting
│   ├── errorHandler.js        ← Global error handler
│   ├── logger.js              ← Request logging with timing
│   └── auth.js                ← Admin key authentication
│
├── services/
│   ├── aiService.js           ← OpenAI integration + local fallback
│   ├── emailService.js        ← Nodemailer (Gmail) + HTML templates
│   ├── dataStore.js           ← JSON file persistence (no DB needed)
│   └── solutionsData.js       ← All 18 mood solutions (6 moods × 3)
│
├── data/                      ← Auto-created on first run
│   ├── waitlist.json          ← Email subscribers
│   ├── sessions.json          ← Quiz sessions
│   └── feedback.json          ← User feedback
│
└── tests/
    └── test-api.js            ← Full API test suite
```

---

## Configuration (.env)

### Minimum (works immediately, no API key needed)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
With just this, the backend runs with **local mood scoring** (no OpenAI cost).

### Add OpenAI (recommended for better accuracy)
```env
OPENAI_API_KEY=sk-...your-key-here...
```
Get your key at: https://platform.openai.com/api-keys
Uses `gpt-4o-mini` — costs ~$0.0001 per quiz (very cheap).

### Add Email (Gmail)
```env
EMAIL_FROM=youremail@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=Inner Sight AI
ADMIN_EMAIL=youradmin@gmail.com
```
**How to get Gmail App Password:**
1. Go to your Google Account → Security
2. Turn on 2-Step Verification
3. Go to App Passwords → Create one for "Mail"
4. Use the 16-character password (with spaces) as EMAIL_APP_PASSWORD

### Add Admin Protection
```env
ADMIN_KEY=any-secret-key-you-choose
```
Then call admin routes with header: `X-Admin-Key: your-secret-key`

---

## API Reference

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "status": "ok",
  "uptime": "2m 34s",
  "features": { "openai": true, "email": false, "admin": true }
}
```

---

### Analyse Mood
```
POST /api/mood/analyse
Content-Type: application/json
```
**Body:**
```json
{
  "answers": [
    { "questionText": "How did you wake up?", "selectedText": "Tense and already carrying something" },
    { "questionText": "Quality of your thoughts?", "selectedText": "Racing — I can't slow them down" }
  ],
  "scores": {
    "anxious": 18, "sad": 1, "neutral": 0,
    "calm": 0, "happy": 0, "energised": 0
  }
}
```
**Response:**
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "mood": "anxious",
  "moodName": "Anxious",
  "emoji": "😰",
  "color": "#C0392B",
  "confidence": 0.87,
  "secondary": "sad",
  "description": "Your mind is carrying a lot right now...",
  "intensity": 78,
  "solutions": [
    {
      "icon": "🌬",
      "name": "4-7-8 Breathing",
      "desc": "Inhale 4, hold 7, exhale 8...",
      "tag": "5 min · Breathing",
      "steps": ["Sit comfortably...", "..."]
    }
  ],
  "aiUsed": true
}
```

---

### Subscribe to Waitlist
```
POST /api/email/subscribe
Content-Type: application/json
```
**Body:** `{ "email": "user@example.com" }`

**Response:**
```json
{ "success": true, "duplicate": false, "message": "You're on the list!", "count": 42 }
```

---

### Save Feedback
```
POST /api/mood/feedback
Content-Type: application/json
```
**Body:**
```json
{
  "sessionId": "uuid-from-analyse",
  "mood": "anxious",
  "helpful": true,
  "rating": 4,
  "comment": "The breathing exercise really helped."
}
```

---

### Send Mood Result by Email
```
POST /api/email/result
Content-Type: application/json
```
**Body:**
```json
{
  "email": "user@example.com",
  "mood": "calm",
  "description": "You're centred and still...",
  "sessionId": "uuid-here"
}
```

---

### Admin Stats
```
GET /api/admin/stats
Headers: X-Admin-Key: your-secret-key
```
**Response:**
```json
{
  "success": true,
  "overview": {
    "waitlistSignups": 107,
    "quizSessions": 243,
    "feedbackTotal": 89,
    "avgRating": 4.2,
    "helpfulRate": "83%",
    "aiUsageRate": "91%"
  },
  "moodDistribution": {
    "anxious": 82, "sad": 31, "neutral": 44,
    "calm": 53, "happy": 19, "energised": 14
  },
  "dailyActivity": {
    "2026-03-22": 12,
    "2026-03-23": 18
  }
}
```

---

### Download Waitlist
```
GET /api/admin/waitlist?format=csv
Headers: X-Admin-Key: your-secret-key
```
Returns a downloadable CSV file with all email subscribers.

---

## Connecting to Your Frontend

1. Copy `api-connector.js` into your frontend's `/js/` folder
2. Add it to each HTML page **before** `quiz.js` and `main.js`:

```html
<script src="js/api-connector.js"></script>
<script src="js/quiz.js"></script>
<script src="js/main.js"></script>
```

3. The connector exposes `window.InnerSightAPI`:
```javascript
// In quiz.js — replace local analysis with API call:
const result = await window.InnerSightAPI.analyseMood(answers, scores);

// In main.js — replace console.log with real email save:
const result = await window.InnerSightAPI.subscribeEmail(email);
```

---

## Running Tests

```bash
# Start server in one terminal
npm run dev

# Run tests in another terminal
npm test
```

Tests cover: health, mood analysis, validation, feedback, email subscribe, sessions, admin stats.

---

## Rate Limits

| Endpoint | Limit |
|---|---|
| General API | 100 requests / 15 min per IP |
| `/mood/analyse` | 20 requests / 15 min per IP |
| `/email/subscribe` | 5 requests / hour per IP |
| `/admin/*` | 30 requests / 15 min per IP |

---

## Data Storage

All data is stored as JSON files in the `./data/` folder — no database setup needed.

| File | Contents |
|---|---|
| `data/waitlist.json` | Email subscribers |
| `data/sessions.json` | Quiz sessions with mood results |
| `data/feedback.json` | User feedback ratings |

To migrate to a real database (Supabase, PostgreSQL) later, only `services/dataStore.js` needs to be updated — all routes stay the same.

---

## Production Deployment (Render / Railway / Fly.io)

```bash
# Set environment variables on your platform:
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
OPENAI_API_KEY=sk-...
EMAIL_FROM=...
EMAIL_APP_PASSWORD=...
ADMIN_KEY=...

# Build command: npm install
# Start command: npm start
```

---

## Mood Categories

| Mood | Emoji | Valence | Arousal |
|---|---|---|---|
| anxious | 😰 | Negative | High |
| sad | 😔 | Negative | Low |
| neutral | 😐 | Neutral | Medium |
| calm | 🌊 | Positive | Low |
| happy | 😊 | Positive | Medium |
| energised | ⚡ | Positive | High |

Each mood maps to 3 curated solutions across: breathing, journaling, music, movement, mindfulness, creative, focus, connection, planning.
