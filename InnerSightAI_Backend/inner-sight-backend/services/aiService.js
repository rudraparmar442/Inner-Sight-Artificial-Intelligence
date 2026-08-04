// ── services/aiService.js ─────────────────────────────────────
// AI mood analysis using OpenAI API.
// Falls back to a local rule-based engine if no API key is set.

const fetch = require('node-fetch');

// ── Mood definitions (shared with fallback engine) ────────────
const MOOD_META = {
  anxious:   { emoji: '😰', color: '#C0392B', valence: 'negative', arousal: 'high'   },
  sad:       { emoji: '😔', color: '#5D6D7E', valence: 'negative', arousal: 'low'    },
  neutral:   { emoji: '😐', color: '#7D8C9A', valence: 'neutral',  arousal: 'medium' },
  calm:      { emoji: '🌊', color: '#1E7A8A', valence: 'positive', arousal: 'low'    },
  happy:     { emoji: '😊', color: '#F0A500', valence: 'positive', arousal: 'medium' },
  energised: { emoji: '⚡', color: '#27AE60', valence: 'positive', arousal: 'high'   },
};

// ── System prompt for OpenAI ──────────────────────────────────
function buildSystemPrompt() {
  return `You are Inner Sight AI's mood classification engine.

Your task: analyse the user's quiz answers and classify their current emotional state.

Available mood categories (choose EXACTLY ONE):
- anxious    → racing thoughts, tension, overwhelm, worry, on-edge
- sad        → heavy, low, withdrawn, disconnected, tearful, quiet
- neutral    → balanced, neither up nor down, steady, muted
- calm       → centred, still, at peace, relaxed, grounded
- happy      → light, positive, grateful, warm, content
- energised  → alert, motivated, high energy, excited, ready to go

Rules:
1. Respond ONLY with valid JSON — no prose, no markdown, no backticks.
2. Classify the PRIMARY mood (strongest signal).
3. Include a confidence score 0.0–1.0 (how certain you are).
4. Include a brief 1-sentence description personalised to their answers.
5. Include secondary mood if the signal is mixed (can be null).

Response format (strict JSON):
{
  "mood": "anxious",
  "confidence": 0.87,
  "secondary": "sad",
  "description": "Your responses suggest you're carrying significant mental tension right now, with racing thoughts making it hard to settle.",
  "signals": ["heavy body feeling", "racing thoughts", "wants distraction"]
}`;
}

// ── Format answers for the AI ─────────────────────────────────
function formatAnswersForAI(answers) {
  return answers.map((a, i) =>
    `Q${i + 1}: ${a.questionText}\nAnswer: ${a.selectedText}`
  ).join('\n\n');
}

// ══════════════════════════════════════════════
//  OPENAI ANALYSIS
// ══════════════════════════════════════════════

async function analyseWithOpenAI(answers) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const userContent = `Here are the user's quiz answers:\n\n${formatAnswersForAI(answers)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       'gpt-4o-mini',       // fast + cheap, great for classification
      max_tokens:  300,
      temperature: 0.3,                 // low temp for consistent classification
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user',   content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error ${response.status}: ${err.error?.message || 'Unknown'}`);
  }

  const data  = await response.json();
  const text  = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from OpenAI');

  // Strip accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  // Validate mood key
  if (!MOOD_META[parsed.mood]) {
    throw new Error(`Unknown mood from AI: ${parsed.mood}`);
  }

  return {
    mood:        parsed.mood,
    confidence:  Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.7)),
    secondary:   parsed.secondary && MOOD_META[parsed.secondary] ? parsed.secondary : null,
    description: parsed.description || '',
    signals:     Array.isArray(parsed.signals) ? parsed.signals : [],
    source:      'openai',
    meta:        MOOD_META[parsed.mood],
  };
}

// ══════════════════════════════════════════════
//  LOCAL FALLBACK ENGINE (no API key needed)
//  Scores-based classification — same logic as frontend
// ══════════════════════════════════════════════

const SCORE_KEYWORDS = {
  anxious:   ['racing', 'spinning', 'tense', 'worried', 'edge', 'distract', 'storm', 'hold'],
  sad:       ['heavy', 'withdraw', 'grey', 'drizzly', 'alone', 'lying down', 'low', 'muted'],
  calm:      ['grounded', 'open', 'clear', 'light', 'flowing', 'gentle', 'quiet', 'soft'],
  happy:     ['ready', 'warm', 'sun', 'love', 'connect', 'positive', 'open', 'creative'],
  energised: ['go', 'yes', 'active', 'voltage', 'tackle', 'forward', 'alert', 'motivated'],
  neutral:   ['neutral', 'fine', 'okay', 'depends', 'muted', 'neither', 'balanced'],
};

const DESCRIPTIONS = {
  anxious:   'Your responses paint a picture of a busy, pressured mind. There\'s tension beneath the surface that needs release.',
  sad:       'You\'re in a quieter, heavier place right now. That\'s valid — and there are gentle ways through.',
  neutral:   'You\'re in a balanced, steady state. Neither high nor low — a good place to be intentional from.',
  calm:      'There\'s a stillness in your responses. You\'re centred and present — let\'s keep you here.',
  happy:     'A warmth and lightness comes through in your answers. You\'re open and positive today.',
  energised: 'Your responses radiate energy and readiness. You\'re firing on all cylinders right now.',
};

function localAnalyse(answers, scoresFromClient) {
  // If client sent pre-computed scores, use those (most accurate)
  if (scoresFromClient && typeof scoresFromClient === 'object') {
    const sorted = Object.entries(scoresFromClient)
      .sort((a, b) => b[1] - a[1]);
    const [topMood, topScore] = sorted[0];
    const totalScore = sorted.reduce((s, [, v]) => s + v, 0);
    const confidence = totalScore > 0 ? Math.min(0.95, topScore / totalScore + 0.2) : 0.5;
    const secondary  = sorted[1][1] > 0 && sorted[1][0] !== topMood ? sorted[1][0] : null;

    return {
      mood:        topMood,
      confidence:  parseFloat(confidence.toFixed(2)),
      secondary,
      description: DESCRIPTIONS[topMood] || '',
      signals:     [],
      source:      'local-scores',
      meta:        MOOD_META[topMood],
    };
  }

  // Text-based keyword scoring fallback
  const scores = Object.fromEntries(Object.keys(MOOD_META).map(k => [k, 0]));
  const fullText = answers.map(a => a.selectedText || '').join(' ').toLowerCase();

  Object.entries(SCORE_KEYWORDS).forEach(([mood, kws]) => {
    kws.forEach(kw => { if (fullText.includes(kw)) scores[mood]++; });
  });

  const sorted   = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topMood  = sorted[0][1] > 0 ? sorted[0][0] : 'neutral';
  const total    = sorted.reduce((s, [, v]) => s + v, 0);
  const conf     = total > 0 ? Math.min(0.85, sorted[0][1] / total + 0.25) : 0.5;

  return {
    mood:        topMood,
    confidence:  parseFloat(conf.toFixed(2)),
    secondary:   sorted[1][1] > 0 ? sorted[1][0] : null,
    description: DESCRIPTIONS[topMood] || '',
    signals:     [],
    source:      'local-keywords',
    meta:        MOOD_META[topMood],
  };
}

// ══════════════════════════════════════════════
//  MAIN EXPORT: analyse()
// ══════════════════════════════════════════════

/**
 * Analyse mood from quiz answers.
 * Tries OpenAI first, falls back to local engine on any error.
 *
 * @param {Array}  answers          - [{questionText, selectedText}]
 * @param {Object} scoresFromClient - pre-computed score map from frontend
 * @returns {Object} mood analysis result
 */
async function analyse(answers, scoresFromClient = null) {
  // Try OpenAI
  try {
    const result = await analyseWithOpenAI(answers);
    console.log(`  [AI] OpenAI classified mood: ${result.mood} (${result.confidence})`);
    return { ...result, aiUsed: true };
  } catch (err) {
    if (err.message !== 'NO_API_KEY') {
      console.warn(`  [AI] OpenAI failed: ${err.message} — using local fallback`);
    } else {
      console.log('  [AI] No API key — using local scoring engine');
    }
  }

  // Local fallback
  const result = localAnalyse(answers, scoresFromClient);
  console.log(`  [AI] Local engine classified mood: ${result.mood}`);
  return { ...result, aiUsed: false };
}

module.exports = { analyse, MOOD_META };
