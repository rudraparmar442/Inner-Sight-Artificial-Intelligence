// ════════════════════════════════════════════════════════════════
//  INNER SIGHT AI — Mood Prediction Model (Backend)
//  services/moodModel.js
//
//  Multi-layer prediction engine:
//  Layer 1 → Weighted score aggregation (from quiz answers)
//  Layer 2 → Pattern recognition (keyword + phrase matching)
//  Layer 3 → Context rules (time of day, answer combinations)
//  Layer 4 → Confidence calibration
//  Layer 5 → OpenAI refinement (if API key available)
// ════════════════════════════════════════════════════════════════

// ── Mood definitions ──────────────────────────────────────────
const MOODS = {
  anxious: {
    name: 'Anxious',
    emoji: '😰',
    color: '#C0392B',
    valence: 'negative',
    arousal: 'high',
    description: (signals) =>
      `Your mind is busy and pressured right now${signals.length ? ' — we noticed ' + signals.slice(0,2).join(' and ') : ''}. The tension is real, but it is manageable. Let's bring you back to ground.`,
  },
  sad: {
    name: 'Low',
    emoji: '😔',
    color: '#5D6D7E',
    valence: 'negative',
    arousal: 'low',
    description: (signals) =>
      `There's a heaviness in your responses today${signals.length ? ' — things like ' + signals.slice(0,2).join(' and ') + ' came through clearly' : ''}. That's okay. Softness and gentleness is what you need right now.`,
  },
  neutral: {
    name: 'Neutral',
    emoji: '😐',
    color: '#7D8C9A',
    valence: 'neutral',
    arousal: 'medium',
    description: () =>
      `You're in a steady, balanced place — neither up nor down. This is actually a powerful state to be intentional from. Let's use it well.`,
  },
  calm: {
    name: 'Calm',
    emoji: '🌊',
    color: '#1E7A8A',
    valence: 'positive',
    arousal: 'low',
    description: (signals) =>
      `A real stillness comes through your answers${signals.length ? ' — words like ' + signals.slice(0,2).join(' and ') + ' stood out' : ''}. You're centred and present. Let's deepen and protect this state.`,
  },
  happy: {
    name: 'Happy',
    emoji: '😊',
    color: '#F0A500',
    valence: 'positive',
    arousal: 'medium',
    description: (signals) =>
      `There's a lightness and warmth in the way you answered${signals.length ? ' — ' + signals[0] + ' especially stood out' : ''}. You're open to the world today. Let's make the most of it.`,
  },
  energised: {
    name: 'Energised',
    emoji: '⚡',
    color: '#27AE60',
    valence: 'positive',
    arousal: 'high',
    description: (signals) =>
      `You're running at full voltage${signals.length ? ' — ' + signals.slice(0,2).join(', ') + ' came through strong' : ''}. Your mind and body are aligned. This is peak state — use it deliberately.`,
  },
};

// ── Layer 1: Answer score weights ─────────────────────────────
// Each quiz option carries a score map { mood → points }
// These weights are tuned for the 7-question quiz in quiz.js

const QUESTION_WEIGHTS = {
  // Q1 — Body on waking
  q1: [
    { anxious: 1, sad: 3 },          // Heavy and reluctant
    { anxious: 3, sad: 1 },          // Tense, carrying something
    { neutral: 2 },                   // Fine, just slow
    { happy: 2, energised: 1 },      // Light and ready
  ],
  // Q2 — Quality of thoughts
  q2: [
    { anxious: 4 },                   // Racing
    { anxious: 2, neutral: 1 },      // Scattered
    { sad: 2, calm: 1 },             // Quiet
    { calm: 2, happy: 1 },           // Clear and flowing
  ],
  // Q3 — Energy / walk test
  q3: [
    { sad: 4 },                       // Maybe later
    { anxious: 2, sad: 1 },          // Want to but held back
    { neutral: 2, calm: 1 },         // Sure why not
    { energised: 4, happy: 1 },      // Yes let's go
  ],
  // Q4 — People / social
  q4: [
    { sad: 3, anxious: 1 },          // Withdraw
    { anxious: 4 },                   // Awkward, on edge
    { neutral: 2 },                   // Depends
    { happy: 2, energised: 1 },      // Want to connect
  ],
  // Q5 — Image / metaphor
  q5: [
    { sad: 4 },                       // Grey drizzly
    { anxious: 4 },                   // Storm about to break
    { neutral: 3 },                   // Clouds not raining
    { happy: 2, calm: 1 },           // Warm afternoon sun
  ],
  // Q6 — Perfect next hour
  q6: [
    { sad: 2, calm: 1 },             // Lying down, soft music
    { anxious: 3 },                   // Distract/calm mind
    { calm: 3, neutral: 1 },         // Gentle quiet activity
    { energised: 2, happy: 1 },      // Active or creative
  ],
  // Q7 — One word
  q7: [
    { sad: 4 },                       // Heavy
    { anxious: 4 },                   // Spinning
    { neutral: 2, sad: 1 },          // Muted
    { calm: 4 },                      // Grounded
    { happy: 2, energised: 1 },      // Open
  ],
};

// ── Layer 2: Keyword/phrase signal detector ───────────────────
const SIGNAL_PATTERNS = {
  anxious: [
    'racing', 'spinning', 'tense', 'on edge', 'storm', 'worried',
    'carrying', 'pressure', 'distract', 'can\'t slow', 'overwhelm',
    'scattered', 'held back', 'awkward', 'spinning',
  ],
  sad: [
    'heavy', 'grey', 'drizzly', 'withdraw', 'alone', 'reluctant',
    'maybe later', 'low', 'muted', 'lying down', 'soft music',
    'disconnected', 'quiet inside', 'don\'t have it',
  ],
  calm: [
    'grounded', 'clear', 'flowing', 'still', 'gentle', 'soft',
    'open', 'at ease', 'afternoon sun', 'centred', 'quiet activity',
    'warm', 'present',
  ],
  happy: [
    'light', 'ready', 'warm', 'connect', 'positive', 'grateful',
    'open', 'good', 'sun', 'creative', 'love', 'smile',
  ],
  energised: [
    'yes let\'s go', 'active', 'motivated', 'alert', 'full voltage',
    'tackle', 'forward', 'fired up', 'excited', 'let\'s go',
    'ready', 'go',
  ],
  neutral: [
    'neutral', 'fine', 'okay', 'sure why not', 'balanced',
    'neither', 'depends', 'not much', 'muted',
  ],
};

// ── Layer 3: Context rules ────────────────────────────────────
// Rules that boost/reduce mood scores based on answer combinations
const CONTEXT_RULES = [
  // Anxious + Sad together → more anxious than sad (anxiety drives sadness here)
  {
    condition: (scores) => scores.anxious >= 6 && scores.sad >= 4,
    apply:     (scores) => { scores.anxious += 2; return scores; },
  },
  // Very high calm score → suppress neutral
  {
    condition: (scores) => scores.calm >= 8,
    apply:     (scores) => { scores.neutral = Math.max(0, scores.neutral - 2); return scores; },
  },
  // Very high energised → boost happy slightly (they co-occur)
  {
    condition: (scores) => scores.energised >= 6,
    apply:     (scores) => { scores.happy += 1; return scores; },
  },
  // Sad + Calm together (low arousal) → lean sad if negative signals present
  {
    condition: (scores) => scores.sad >= 3 && scores.calm >= 3 && scores.anxious < 3,
    apply:     (scores) => { scores.sad += 1; return scores; },
  },
  // All scores very low → push to neutral
  {
    condition: (scores) => Object.values(scores).every(v => v <= 2),
    apply:     (scores) => { scores.neutral += 3; return scores; },
  },
];

// ── Layer 4: Confidence calibration ──────────────────────────
function calibrateConfidence(scores, topMood) {
  const values = Object.values(scores);
  const total  = values.reduce((s, v) => s + v, 0);
  const top    = scores[topMood] || 0;

  if (total === 0) return 0.50;

  // Base: ratio of top score to total
  const base   = top / total;

  // Gap between top and second: larger gap = higher confidence
  const sorted = values.sort((a, b) => b - a);
  const gap    = sorted[0] - (sorted[1] || 0);
  const gapBonus = Math.min(0.15, gap * 0.025);

  // Minimum score floor: very low scores = less confidence
  const floorPenalty = top < 4 ? -0.10 : 0;

  const raw = base + gapBonus + floorPenalty;
  return Math.min(0.97, Math.max(0.42, parseFloat(raw.toFixed(2))));
}

// ── Layer 5: Signal extraction ────────────────────────────────
function extractSignals(answers, topMood) {
  const text    = answers.map(a => (a.selectedText || '').toLowerCase()).join(' ');
  const patterns = SIGNAL_PATTERNS[topMood] || [];
  return patterns.filter(p => text.includes(p)).slice(0, 3);
}

// ════════════════════════════════════════════════════════════════
//  MAIN PREDICT FUNCTION
//  Input:  answers[]  — array of {questionText, selectedText, questionIndex}
//          clientScores — optional pre-computed scores from frontend
//  Output: full mood prediction object
// ════════════════════════════════════════════════════════════════

function predict(answers, clientScores = null) {
  // ── Start with base scores ────────────────────────────────
  const scores = { anxious: 0, sad: 0, neutral: 0, calm: 0, happy: 0, energised: 0 };

  // ── Layer 1: Weighted answer scores ───────────────────────
  if (clientScores && typeof clientScores === 'object') {
    // Use frontend scores as strong prior (they are question-weight based)
    Object.entries(clientScores).forEach(([mood, val]) => {
      if (scores[mood] !== undefined) scores[mood] += Number(val) || 0;
    });
  } else {
    // Compute from answer indices if frontend scores not sent
    answers.forEach((ans, idx) => {
      const qKey    = `q${idx + 1}`;
      const weights = QUESTION_WEIGHTS[qKey];
      if (!weights) return;

      // Try to match answer index from answer text
      const optIdx = ans.optionIndex !== undefined ? ans.optionIndex : -1;
      if (optIdx >= 0 && weights[optIdx]) {
        Object.entries(weights[optIdx]).forEach(([mood, pts]) => {
          if (scores[mood] !== undefined) scores[mood] += pts;
        });
      }
    });
  }

  // ── Layer 2: Keyword pattern boost ────────────────────────
  const fullText = answers.map(a => (a.selectedText || '').toLowerCase()).join(' ');
  Object.entries(SIGNAL_PATTERNS).forEach(([mood, patterns]) => {
    patterns.forEach(p => {
      if (fullText.includes(p) && scores[mood] !== undefined) {
        scores[mood] += 0.5; // gentle boost — doesn't override weighted scores
      }
    });
  });

  // ── Layer 3: Context rules ────────────────────────────────
  CONTEXT_RULES.forEach(rule => {
    if (rule.condition(scores)) rule.apply(scores);
  });

  // ── Round scores ──────────────────────────────────────────
  Object.keys(scores).forEach(k => { scores[k] = Math.round(scores[k] * 10) / 10; });

  // ── Determine top mood ────────────────────────────────────
  const sorted    = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topMood   = sorted[0][0];
  const secondMood = sorted[1][1] > 0 && sorted[1][0] !== topMood ? sorted[1][0] : null;

  // ── Layer 4: Confidence ───────────────────────────────────
  const confidence = calibrateConfidence({ ...scores }, topMood);

  // ── Intensity (40–95% range) ──────────────────────────────
  const total     = Object.values(scores).reduce((s, v) => s + v, 0);
  const topVal    = scores[topMood] || 0;
  const intensity = total > 0
    ? Math.round(40 + (topVal / total) * 55)
    : 60;

  // ── Layer 5: Signals ──────────────────────────────────────
  const signals = extractSignals(answers, topMood);

  // ── Build description ─────────────────────────────────────
  const moodDef    = MOODS[topMood];
  const description = moodDef.description(signals);

  return {
    mood:        topMood,
    moodName:    moodDef.name,
    emoji:       moodDef.emoji,
    color:       moodDef.color,
    valence:     moodDef.valence,
    arousal:     moodDef.arousal,
    confidence,
    intensity,
    secondary:   secondMood,
    description,
    signals,
    scores:      { ...scores },
    source:      'inner-sight-model-v1',
  };
}

// ── Utility: score breakdown for debugging ────────────────────
function debugScores(scores) {
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([mood, val]) => ({
      mood,
      score: val,
      pct:   total > 0 ? Math.round((val / total) * 100) + '%' : '0%',
    }));
}

module.exports = { predict, debugScores, MOODS, SIGNAL_PATTERNS };
