// ════════════════════════════════════════════════
//  INNER SIGHT AI — API Test Suite
//  Run: node tests/test-api.js
//  Make sure the server is running first: npm run dev
// ════════════════════════════════════════════════

const BASE = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

// ── Test helpers ──────────────────────────────
function ok(label, cond, info = '') {
  if (cond) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}${info ? ' — ' + info : ''}`);
    failed++;
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── Test suites ───────────────────────────────
async function testHealth() {
  console.log('\n📡  Health Check');
  const { status, data } = await get('/health');
  ok('Status 200',      status === 200);
  ok('success: true',   data.success === true);
  ok('Has uptime',      typeof data.uptime === 'string');
  ok('Has features',    typeof data.features === 'object');
}

async function testMoodAnalyse() {
  console.log('\n🧠  POST /mood/analyse');

  const answers = [
    { questionText: 'How did you wake up?',       selectedText: 'Tense — like I was already carrying something' },
    { questionText: 'Quality of thoughts?',        selectedText: 'Racing — I can\'t slow them down' },
    { questionText: 'Could you go for a walk?',    selectedText: 'I want to, but something\'s holding me back' },
    { questionText: 'How about other people?',     selectedText: 'I feel awkward and a bit on edge' },
    { questionText: 'Pick an image for your mood', selectedText: '⚡ A storm about to break' },
    { questionText: 'Perfect next hour?',          selectedText: 'Something to distract or calm my mind' },
    { questionText: 'One word for today?',         selectedText: '🌀 "Spinning"' },
  ];
  const scores = { anxious: 18, sad: 1, neutral: 0, calm: 0, happy: 0, energised: 0 };

  const { status, data } = await post('/mood/analyse', { answers, scores });

  ok('Status 200',           status === 200);
  ok('success: true',        data.success === true);
  ok('Has sessionId',        typeof data.sessionId === 'string');
  ok('Has mood string',      typeof data.mood === 'string');
  ok('Mood is valid',        ['anxious','sad','neutral','calm','happy','energised'].includes(data.mood));
  ok('Detected anxious',     data.mood === 'anxious', `got: ${data.mood}`);
  ok('Has confidence',       typeof data.confidence === 'number');
  ok('Has description',      typeof data.description === 'string' && data.description.length > 0);
  ok('Has solutions array',  Array.isArray(data.solutions) && data.solutions.length > 0);
  ok('Solutions have names', data.solutions[0]?.name?.length > 0);
  ok('Has intensity',        typeof data.intensity === 'number');

  return data.sessionId;
}

async function testMoodValidation() {
  console.log('\n🛡️   Validation — /mood/analyse');

  const { status, data } = await post('/mood/analyse', { answers: [] });
  ok('Empty answers → 422',  status === 422);

  const { status: s2 } = await post('/mood/analyse', { answers: 'not-an-array' });
  ok('Wrong type → 422',     s2 === 422);
}

async function testFeedback(sessionId) {
  console.log('\n💬  POST /mood/feedback');

  const { status, data } = await post('/mood/feedback', {
    sessionId: sessionId || 'test-session-001',
    mood:      'anxious',
    helpful:   true,
    rating:    4,
    comment:   'The breathing exercise really helped.',
  });

  ok('Status 200',      status === 200);
  ok('success: true',   data.success === true);
}

async function testEmailSubscribe() {
  console.log('\n📧  POST /email/subscribe');

  const testEmail = `test_${Date.now()}@example.com`;
  const { status, data } = await post('/email/subscribe', { email: testEmail });

  ok('Status 201',          status === 201);
  ok('success: true',       data.success === true);
  ok('Not duplicate',       data.duplicate === false);
  ok('Has count',           typeof data.count === 'number');

  // Test duplicate
  const { status: s2, data: d2 } = await post('/email/subscribe', { email: testEmail });
  ok('Duplicate → 200',     s2 === 200);
  ok('Duplicate flag true', d2.duplicate === true);

  // Test invalid email
  const { status: s3 } = await post('/email/subscribe', { email: 'not-an-email' });
  ok('Bad email → 422',     s3 === 422);
}

async function testSessions() {
  console.log('\n📋  Sessions');

  // Save a session
  const { status, data } = await post('/sessions/save', {
    sessionId: `test-${Date.now()}`,
    mood:      'calm',
    intensity: 72,
    scores:    { anxious: 0, sad: 0, neutral: 1, calm: 8, happy: 2, energised: 0 },
    answers:   [{ questionText: 'Q1', selectedText: 'Grounded' }],
  });
  ok('Save session 201',  status === 201);

  // Get sessions
  const { status: s2, data: d2 } = await get('/sessions');
  ok('Get sessions 200',        s2 === 200);
  ok('Has total count',         typeof d2.total === 'number');
  ok('Has sessions array',      Array.isArray(d2.sessions));
  ok('Has distribution',        typeof d2.distribution === 'object');
}

async function testAdmin() {
  console.log('\n🔐  Admin');

  // Stats (no key needed in dev)
  const { status, data } = await get('/admin/stats');
  ok('Stats 200',                   status === 200);
  ok('Has waitlistSignups',         typeof data.overview?.waitlistSignups === 'number');
  ok('Has quizSessions',            typeof data.overview?.quizSessions === 'number');
  ok('Has moodDistribution',        typeof data.moodDistribution === 'object');
  ok('Has dailyActivity',           typeof data.dailyActivity === 'object');

  // Waitlist CSV
  const res = await fetch(`${BASE}/admin/waitlist?format=csv`);
  ok('Waitlist CSV 200',            res.status === 200);
  ok('Content-Type is csv',         res.headers.get('content-type')?.includes('text/csv'));
}

// ── Run all tests ─────────────────────────────
(async () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Inner Sight AI — API Test Suite        ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    await testHealth();
    const sessionId = await testMoodAnalyse();
    await testMoodValidation();
    await testFeedback(sessionId);
    await testEmailSubscribe();
    await testSessions();
    await testAdmin();
  } catch (err) {
    console.error('\n💥 Test runner error:', err.message);
    console.error('   Is the server running? → npm run dev');
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? '  🎉 All tests passed!\n' : '  ⚠️  Some tests failed.\n');
  process.exit(failed > 0 ? 1 : 0);
})();
