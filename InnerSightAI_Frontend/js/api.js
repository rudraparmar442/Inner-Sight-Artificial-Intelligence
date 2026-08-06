// ════════════════════════════════════════════════════════════════
//  INNER SIGHT AI — Frontend API Connector
//  js/api.js
//
//  Ye file frontend aur backend ke beech ka bridge hai.
//  Sab API calls yahan se hote hain.
//  Quiz, email, feedback, session — sab kuch.
//
//  Backend chhala ho to local fallback automatically use hota hai.
// ════════════════════════════════════════════════════════════════
const InnerSightAPI = (() => {

  // ── Config ──────────────────────────────────────────────────
  const CONFIG = {
    // Apna backend URL yahan daalo
    BASE_URL: 'https://inner-sight-ai-backend.onrender.com',

    // Timeout: 8 seconds (AI call ke liye)
    TIMEOUT_MS: 8000,

    // How long to trust a previous isBackendAlive() result before
    // re-checking. Was permanent (cached for the whole page lifetime),
    // which meant a health check that hit during a Render cold start
    // would mark the backend "dead" for the rest of the session even
    // after it woke up. 45s keeps the health-check cost down without
    // getting stuck on a stale answer.
    BACKEND_ALIVE_TTL_MS: 45000,

    // Debug logs on/off
    DEBUG: true,
  };

  // ── Logging ──────────────────────────────────────────────────
  function log(msg, data) {
    if (CONFIG.DEBUG) {
      console.log('%c[InnerSightAPI]%c ' + msg, 'color:#F0B429;font-weight:bold', 'color:inherit', data || '');
    }
  }

  function warn(msg, err) {
    console.warn('%c[InnerSightAPI]%c ' + msg, 'color:#E84040;font-weight:bold', 'color:inherit', err?.message || err || '');
  }

  // ── HTTP helpers ─────────────────────────────────────────────

  // Timeout wrapper for fetch — throws a clear, readable error on timeout
  // instead of a bare "signal is aborted without reason" AbortError.
  async function fetchWithTimeout(url, options, ms = CONFIG.TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), ms);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } catch (err) {
      if (err.name === 'AbortError' || err === 'timeout') {
        throw new Error(`Request timed out after ${ms}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async function post(path, body, timeoutMs) {
    const url = `${CONFIG.BASE_URL}${path}`;
    log('POST ' + path, body);

    const res = await fetchWithTimeout(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }, timeoutMs);

    const data = await res.json();
    log('← ' + path, data);
    return { ok: res.ok, status: res.status, data };
  }

  async function get(path, timeoutMs) {
    const url = `${CONFIG.BASE_URL}${path}`;
    log('GET ' + path);
    const res = await fetchWithTimeout(url, {}, timeoutMs);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }

  // ── Connection check ─────────────────────────────────────────
  // Backend chal raha hai ya nahi check karta hai
  //
  // Cached with a TTL rather than forever — a single failed check
  // (e.g. during a Render cold start) no longer permanently marks
  // the backend "dead" for the rest of the page session. Any call
  // site can also force a fresh check with isBackendAlive(true),
  // which is used automatically as a retry when a live call fails
  // right after a cached "alive" reading.
  let _backendAlive = null;
  let _backendAliveCheckedAt = 0;

  async function isBackendAlive(forceRefresh = false) {
    const isFresh = _backendAlive !== null &&
      (Date.now() - _backendAliveCheckedAt) < CONFIG.BACKEND_ALIVE_TTL_MS;

    if (isFresh && !forceRefresh) return _backendAlive;

    try {
      const { ok } = await get('/api/health');
      _backendAlive = ok;
      _backendAliveCheckedAt = Date.now();
      log(_backendAlive ? '✅ Backend connected' : '❌ Backend not responding');
      return _backendAlive;
    } catch {
      _backendAlive = false;
      _backendAliveCheckedAt = Date.now();
      warn('Backend not reachable — using local fallback mode');
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  1. MOOD ANALYSIS
  //  Quiz ke baad call hota hai — backend model se mood predict karta hai
  // ════════════════════════════════════════════════════════════

  /**
   * Main mood analysis call.
   * @param {Array}  answers  - quiz ke answers [{questionText, selectedText, optionIndex}]
   * @param {Object} scores   - frontend se pre-computed score map {mood: number}
   * @returns {Object} full mood result ya null (agar backend down ho)
   */
  async function analyseMood(answers, scores) {
    const alive = await isBackendAlive();
    if (!alive) {
      warn('Backend down — quiz.js ka local engine use hoga');
      return null; // quiz.js handle kar lega
    }

    try {
      const { ok, data } = await post('/api/mood/analyse', {
        answers,
        scores,
        useAI: true,
      });

      if (!ok || !data.success) {
        warn('Mood analyse API failed', data.error);
        return null;
      }

      log('Mood result:', data.mood + ' (' + Math.round(data.confidence * 100) + '% confidence)');
      return data;

    } catch (err) {
      warn('Mood analyse error', err);
      return null;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  2. EMAIL SUBSCRIBE (Waitlist)
  //  Landing page ka email form yahan connect hota hai
  // ════════════════════════════════════════════════════════════

  /**
   * @param {string} email
   * @returns {{ success, duplicate, message, count }}
   */
  async function subscribeEmail(email) {
    const alive = await isBackendAlive();
    if (!alive) {
      warn('Backend down — email save nahi hua');
      return { success: false, offline: true, message: 'Server se connect nahi ho pa raha. Baad mein try karein.' };
    }

    try {
      const { ok, data } = await post('/api/email/subscribe', {
        email,
        source: 'landing-page',
      });

      if (!ok) {
        return { success: false, message: data.error || 'Kuch galat hua. Dobara try karein.' };
      }

      return data;

    } catch (err) {
      warn('Email subscribe error', err);
      return { success: false, message: 'Server se connect nahi ho pa raha.' };
    }
  }

  // ════════════════════════════════════════════════════════════
  //  3. SAVE SESSION
  //  Har completed quiz session backend mein save hota hai
  // ════════════════════════════════════════════════════════════

  /**
   * @param {Object} sessionData - { sessionId, mood, intensity, scores, answers }
   */
  async function saveSession(sessionData) {
    const alive = await isBackendAlive();
    if (!alive) return; // non-critical — quietly skip

    try {
      await post('/api/sessions/save', sessionData);
      log('Session saved:', sessionData.sessionId);
    } catch (err) {
      warn('Session save failed (non-critical)', err);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  4. FEEDBACK
  //  Result screen pe "Was this helpful?" button
  // ════════════════════════════════════════════════════════════

  /**
   * @param {Object} feedback - { sessionId, mood, helpful, rating, comment }
   * @returns {{ success, message }}
   */
  async function sendFeedback(feedback) {
    const alive = await isBackendAlive();
    if (!alive) return { success: false };

    try {
      const { data } = await post('/api/mood/feedback', feedback);
      return data;
    } catch (err) {
      warn('Feedback send failed', err);
      return { success: false };
    }
  }

  // ════════════════════════════════════════════════════════════
  //  5. EMAIL RESULT
  //  Result screen pe "Email me my result" button
  // ════════════════════════════════════════════════════════════

  /**
   * @param {string} email
   * @param {string} mood
   * @param {string} description
   * @param {string} sessionId
   */
  // The /api/email/result backend route now responds immediately and
  // sends the actual email in the background (fire-and-forget), so
  // this call no longer waits on SMTP — the old 25s allowance for a
  // cold Render instance + Gmail SMTP round-trip isn't needed anymore.
  // Falls back to the shared default (8000ms) like other calls.
  const EMAIL_TIMEOUT_MS = CONFIG.TIMEOUT_MS;

  async function emailResult(email, mood, description, sessionId) {
    const alive = await isBackendAlive();
    if (!alive) return { success: false, message: 'Server unavailable.' };

    try {
      const { data } = await post('/api/email/result', { email, mood, description, sessionId }, EMAIL_TIMEOUT_MS);
      // Backend now returns { success: true, queued: true, message }
      // meaning the email was accepted and queued, not necessarily
      // delivered yet.
      return data;
    } catch (err) {
      warn('Email result failed', err);
      if (err?.message?.includes('timed out')) {
        return { success: false, message: 'Could not reach the server. Please try again.' };
      }
      return { success: false };
    }
  }

  // ════════════════════════════════════════════════════════════
  //  6. GET SOLUTIONS
  //  Kisi mood ke liye solutions fetch karna
  // ════════════════════════════════════════════════════════════

  /**
   * @param {string} mood
   * @returns {Array} solutions
   */
  async function getSolutions(mood) {
    try {
      const { ok, data } = await get(`/api/mood/solutions/${mood}`);
      if (ok && data.solutions) return data.solutions;
    } catch (err) {
      warn('getSolutions failed', err);
    }
    return []; // quiz.js ka local solutions use hoga
  }

  // ════════════════════════════════════════════════════════════
  //  7. HEALTH CHECK (public)
  // ════════════════════════════════════════════════════════════

  async function checkHealth() {
    try {
      const { data } = await get('/api/health');
      return data;
    } catch {
      return { status: 'offline' };
    }
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    analyseMood,
    subscribeEmail,
    saveSession,
    sendFeedback,
    emailResult,
    getSolutions,
    checkHealth,
    isBackendAlive,
    setBaseUrl: (url) => { CONFIG.BASE_URL = url; _backendAlive = null; _backendAliveCheckedAt = 0; },
  };

})();

// Global mein expose karo taaki quiz.js aur main.js use kar sakein
window.InnerSightAPI = InnerSightAPI;

// Page load pe backend check karo (quietly)
InnerSightAPI.isBackendAlive().then(alive => {
  if (alive) {
    console.log('%c✅ Inner Sight AI — Backend connected', 'color:#27AE60;font-weight:bold');
  } else {
    console.log('%c⚠️ Inner Sight AI — Running in offline mode (local engine)', 'color:#F0A500;font-weight:bold');
  }
});