// ════════════════════════════════════════════════════════════════
//  INNER SIGHT AI — Mood Route (Updated)
//  POST /api/mood/analyse   → Full prediction pipeline
//  POST /api/mood/feedback  → Save user feedback
//  GET  /api/mood/solutions/:mood → Get solutions for a mood
// ════════════════════════════════════════════════════════════════

const express    = require('express');
const { body, validationResult } = require('express-validator');
const { aiLimiter }     = require('../middleware/rateLimiter');
const { predict }       = require('../services/moodModel');
const aiService         = require('../services/aiService');
const { getSolutions }  = require('../services/solutionsData');
const { saveSession, saveFeedback } = require('../services/dataStore');
const { v4: uuidv4 }    = require('uuid');

const router = express.Router();
const VALID_MOODS = ['anxious','sad','neutral','calm','happy','energised'];

const analyseValidation = [
  body('answers').isArray({ min: 1, max: 10 }),
  body('answers.*.questionText').isString().trim().notEmpty(),
  body('answers.*.selectedText').isString().trim().notEmpty(),
  body('answers.*.optionIndex').optional().isInt({ min: 0, max: 10 }),
  body('scores').optional().isObject(),
  body('useAI').optional().isBoolean(),
];

// POST /api/mood/analyse
router.post('/analyse', aiLimiter, analyseValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: 'Invalid input', details: errors.array() });
    }

    const { answers, scores, useAI = true } = req.body;

    const cleanAnswers = answers.map(a => ({
      questionText: String(a.questionText).trim().slice(0, 300),
      selectedText: String(a.selectedText).trim().slice(0, 300),
      optionIndex:  typeof a.optionIndex === 'number' ? a.optionIndex : undefined,
    }));

    // Step 1: Inner Sight Model (always runs, no cost)
    const modelResult = predict(cleanAnswers, scores || null);
    console.log('  [Model] Mood:', modelResult.mood, '| Confidence:', modelResult.confidence, '| Intensity:', modelResult.intensity + '%');

    // Step 2: OpenAI refinement (optional, if key present)
    let finalResult = { ...modelResult, aiUsed: false };

    if (useAI) {
      try {
        const aiResult = await aiService.analyse(cleanAnswers, scores);
        if (aiResult.aiUsed && aiResult.confidence >= 0.65) {
          finalResult = {
            ...modelResult,
            description: aiResult.description || modelResult.description,
            secondary:   aiResult.secondary   || modelResult.secondary,
            signals:     aiResult.signals?.length ? aiResult.signals : modelResult.signals,
            aiUsed:      true,
          };
        }
      } catch (e) {
        console.log('  [AI] Skipped:', e.message);
      }
    }

    // Step 3: Solutions
    const solutions = getSolutions(finalResult.mood);

    // Step 4: Save session
    const sessionId = uuidv4();
    saveSession({ sessionId, mood: finalResult.mood, intensity: finalResult.intensity,
                  scores: finalResult.scores, answers: cleanAnswers, aiUsed: finalResult.aiUsed });

    // Step 5: Respond
    res.status(200).json({
      success: true, sessionId,
      mood: finalResult.mood, moodName: finalResult.moodName,
      emoji: finalResult.emoji, color: finalResult.color,
      valence: finalResult.valence, arousal: finalResult.arousal,
      confidence: finalResult.confidence, intensity: finalResult.intensity,
      secondary: finalResult.secondary, signals: finalResult.signals,
      description: finalResult.description, solutions,
      aiUsed: finalResult.aiUsed, scores: finalResult.scores,
    });

  } catch (err) { next(err); }
});

// POST /api/mood/feedback
router.post('/feedback', [
  body('sessionId').isString().trim().notEmpty(),
  body('mood').isIn(VALID_MOODS),
  body('helpful').isBoolean(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().trim().isLength({ max: 500 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, error: errors.array()[0].msg });
    saveFeedback(req.body);
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) { next(err); }
});

// GET /api/mood/solutions/:mood
router.get('/solutions/:mood', (req, res) => {
  const { mood } = req.params;
  if (!VALID_MOODS.includes(mood)) return res.status(400).json({ success: false, error: 'Invalid mood' });
  res.json({ success: true, mood, solutions: getSolutions(mood) });
});

module.exports = router;
