// ════════════════════════════════════════════════
//  INNER SIGHT AI — API Connector
//  Place this file in your frontend /js/ folder
//  It connects the quiz to the backend API
// ════════════════════════════════════════════════

const API_BASE = 'http://localhost:5000/api';

/**
 * Analyse mood via the backend (AI-powered).
 * Falls back gracefully if the server is unreachable.
 *
 * @param {Array}  answers  - [{questionText, selectedText}]
 * @param {Object} scores   - pre-computed score map from frontend
 * @returns {Object} mood analysis result
 */
async function analyseMoodAPI(answers, scores) {
  try {
    const res = await fetch(`${API_BASE}/mood/analyse`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ answers, scores }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;

  } catch (err) {
    console.warn('[API] Mood analyse failed, using frontend fallback:', err.message);
    return null; // quiz.js will use its own local engine
  }
}

/**
 * Subscribe email to waitlist.
 * @param {string} email
 * @returns {{ success, duplicate, message }}
 */
async function subscribeEmail(email) {
  try {
    const res = await fetch(`${API_BASE}/email/subscribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, source: 'landing-page' }),
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Email subscribe failed:', err.message);
    return { success: false, error: 'Could not reach server.' };
  }
}

/**
 * Save a completed quiz session to the backend.
 * @param {Object} sessionData
 */
async function saveSession(sessionData) {
  try {
    await fetch(`${API_BASE}/sessions/save`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(sessionData),
    });
  } catch (err) {
    console.warn('[API] Session save failed (non-critical):', err.message);
  }
}

/**
 * Send feedback on a mood result.
 * @param {Object} feedback - { sessionId, mood, helpful, rating, comment }
 */
async function sendFeedback(feedback) {
  try {
    const res = await fetch(`${API_BASE}/mood/feedback`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(feedback),
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Feedback send failed:', err.message);
    return { success: false };
  }
}

/**
 * Send mood result to user's email.
 * @param {string} email
 * @param {string} mood
 * @param {string} description
 * @param {string} sessionId
 */
async function emailResult(email, mood, description, sessionId) {
  try {
    const res = await fetch(`${API_BASE}/email/result`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, mood, description, sessionId }),
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Email result failed:', err.message);
    return { success: false };
  }
}

// Export for use in quiz.js and main.js
window.InnerSightAPI = {
  analyseMood:    analyseMoodAPI,
  subscribeEmail,
  saveSession,
  sendFeedback,
  emailResult,
};
