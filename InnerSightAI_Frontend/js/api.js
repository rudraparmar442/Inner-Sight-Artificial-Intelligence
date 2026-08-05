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
  let _backendAlive = null;

  async function isBackendAlive() {
    if (_backendAlive !== null) return _backendAlive;
    try {
      const { ok } = await get('/api/health');
      _backendAlive = ok;
      log(_backendAlive ? '✅ Backend connected' : '❌ Backend not responding');
      return _backendAlive;
    } catch {
      _backendAlive = false;
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
  // Emails (Gmail SMTP) can be slow, especially on a cold Render instance —
  // give this call much more time than the default 8s before giving up.
  const EMAIL_TIMEOUT_MS = 25000;

  async function emailResult(email, mood, description, sessionId) {
    const alive = await isBackendAlive();
    if (!alive) return { success: false, message: 'Server unavailable.' };

    try {
      const { data } = await post('/api/email/result', { email, mood, description, sessionId }, EMAIL_TIMEOUT_MS);
      return data;
    } catch (err) {
      warn('Email result failed', err);
      if (err?.message?.includes('timed out')) {
        return { success: false, message: 'Email is taking longer than usual — it may still arrive shortly.' };
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
    setBaseUrl: (url) => { CONFIG.BASE_URL = url; _backendAlive = null; },
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
