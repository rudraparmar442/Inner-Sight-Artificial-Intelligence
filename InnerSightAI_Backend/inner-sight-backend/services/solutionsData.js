// ── services/solutionsData.js ─────────────────────────────────
// Full solution library — 3 solutions per mood (6 moods = 18 total)
// Each solution has: icon, name, description, tag, duration, category

const SOLUTIONS = {
  anxious: [
    {
      icon:     '🌬',
      name:     '4-7-8 Breathing',
      desc:     'Inhale for 4 counts, hold for 7, exhale slowly for 8. This pattern directly activates your parasympathetic nervous system — slowing your heart rate and quieting the mind within minutes.',
      tag:      '5 min · Breathing',
      duration: 5,
      category: 'breathing',
      steps:    ['Sit comfortably with your back straight', 'Exhale completely through your mouth', 'Inhale through your nose for 4 counts', 'Hold your breath for 7 counts', 'Exhale through your mouth for 8 counts', 'Repeat 3–4 times'],
    },
    {
      icon:     '📝',
      name:     'Thought Dump Journal',
      desc:     'Write everything that\'s circling in your mind — no structure, no punctuation needed. Moving thoughts from your head to paper creates immediate cognitive relief and distance from the spiral.',
      tag:      '10 min · Journaling',
      duration: 10,
      category: 'journaling',
      steps:    ['Open a notebook or notes app', 'Set a timer for 10 minutes', 'Write without stopping or editing', 'Let every worry, thought, and fear come out', 'When done, close the page without re-reading'],
    },
    {
      icon:     '🎵',
      name:     'Theta Wave Ambient',
      desc:     'Low-frequency ambient soundscapes (4–8Hz theta range) slow brainwave activity and reduce the physiological signs of anxiety. No headphones needed — just let it play.',
      tag:      'Ongoing · Music',
      duration: null,
      category: 'music',
      steps:    ['Search "theta wave ambient" on Spotify or YouTube', 'Lower the volume to a soft background level', 'Let it play while you breathe or rest', 'Don\'t try to focus on the music — just let it wash over you'],
    },
  ],

  sad: [
    {
      icon:     '🌿',
      name:     'Gentle Body Scan',
      desc:     'A slow, compassionate scan from head to toe. Not to fix or change anything — just to notice where the heaviness lives in your body. Witnessing without judgment is itself healing.',
      tag:      '8 min · Mindfulness',
      duration: 8,
      category: 'mindfulness',
      steps:    ['Lie down or sit in a comfortable position', 'Close your eyes and take 3 slow breaths', 'Start at the top of your head — notice any sensation', 'Slowly move attention down: face, neck, shoulders, chest…', 'At each area, breathe into it gently', 'End at your feet. Say inwardly: "I am here with myself"'],
    },
    {
      icon:     '📔',
      name:     'Gratitude Micro-Prompt',
      desc:     'Not toxic positivity — just one small, honest thing. "What was the last moment I felt okay, even briefly?" Write 3–5 sentences about that moment. Small anchors loosen heavy moods.',
      tag:      '5 min · Journaling',
      duration: 5,
      category: 'journaling',
      steps:    ['Don\'t try to feel grateful — just find one neutral moment', 'Write: "The last time I felt okay was when…"', 'Describe the scene, the feeling, who was there', 'Don\'t compare it to now — just let it exist'],
    },
    {
      icon:     '🎵',
      name:     'Lo-fi Comfort Playlist',
      desc:     'Warm, slow-tempo lo-fi music that meets you where you are. Research shows music matching our mood can paradoxically be more soothing than forced cheerfulness. No pressure to feel better.',
      tag:      'Ongoing · Music',
      duration: null,
      category: 'music',
      steps:    ['Search "lo-fi chill beats sad comfort" on Spotify', 'Pick whatever title resonates right now', 'Don\'t try to change how you feel — let the music sit with you'],
    },
  ],

  neutral: [
    {
      icon:     '🧘',
      name:     'Mindful Tea or Coffee',
      desc:     'Make your next drink with full, unhurried attention. Notice the warmth of the cup, the smell, each sip. A 5-minute grounding ritual that turns an ordinary moment into presence.',
      tag:      '5 min · Mindfulness',
      duration: 5,
      category: 'mindfulness',
      steps:    ['Make a warm drink slowly — don\'t rush', 'Hold the cup with both hands before drinking', 'Notice the warmth, the colour, the steam', 'Take the first 3 sips with full attention', 'Put your phone down while you drink'],
    },
    {
      icon:     '🚶',
      name:     '10-Minute Awareness Walk',
      desc:     'Walk with no destination and full attention. Notice 5 things you can see, 4 you can touch or feel, 3 sounds, 2 smells, 1 taste. The 5-4-3-2-1 method anchors you firmly in the present.',
      tag:      '10 min · Movement',
      duration: 10,
      category: 'movement',
      steps:    ['Step outside or walk to a different room', 'Name 5 things you can see', 'Touch 4 things and notice their texture', 'Listen for 3 distinct sounds', 'Notice 2 smells in the air', 'Notice 1 taste in your mouth'],
    },
    {
      icon:     '📖',
      name:     'Open Reflection Write',
      desc:     'What would you like this day to become? Write a paragraph with no judgement. Neutral states are actually optimal for this — you\'re not blocked by emotion, so clarity is available.',
      tag:      '7 min · Journaling',
      duration: 7,
      category: 'journaling',
      steps:    ['Open a blank page', 'Write: "What I\'d like the next few hours to feel like is…"', 'Write without editing or judging', 'Let it be vague or specific — whatever comes'],
    },
  ],

  calm: [
    {
      icon:     '🌊',
      name:     'Box Breathing',
      desc:     'Inhale 4, hold 4, exhale 4, hold 4. Box breathing deepens and sustains the calm state you\'re already in — extending it and reinforcing the neural pathways of regulation.',
      tag:      '5 min · Breathing',
      duration: 5,
      category: 'breathing',
      steps:    ['Sit quietly with your eyes softly closed', 'Inhale slowly for 4 counts', 'Hold for 4 counts', 'Exhale slowly for 4 counts', 'Hold empty for 4 counts', 'Repeat for 5 minutes'],
    },
    {
      icon:     '🎵',
      name:     'Nature Soundscape',
      desc:     'Rain, ocean waves, forest. Biophilic sound design deepens calm and extends it — connecting your nervous system to natural rhythms that our brains are wired to find safe.',
      tag:      'Ongoing · Music',
      duration: null,
      category: 'music',
      steps:    ['Search "rain sounds" or "forest ambience" on YouTube', 'Choose whatever environment resonates today', 'Let it play gently in the background', 'Use it while reading, stretching, or just sitting'],
    },
    {
      icon:     '✍️',
      name:     'Stream of Consciousness',
      desc:     'Write without stopping for 3 minutes. No topic, no rules, no structure. Calm states amplify creative output — let what\'s inside come out without overthinking.',
      tag:      '3 min · Journaling',
      duration: 3,
      category: 'journaling',
      steps:    ['Set a 3-minute timer', 'Start writing the first word that comes to mind', 'Never stop moving the pen / keys', 'If you get stuck, write "I don\'t know what to write" until something comes', 'Don\'t re-read until tomorrow'],
    },
  ],

  happy: [
    {
      icon:     '🎨',
      name:     'Creative Flow',
      desc:     'Sketch, doodle, write a poem, make something. Positive emotional states amplify creative output by up to 60% (research by Teresa Amabile, Harvard). This is the best time to make things.',
      tag:      '15 min · Creative',
      duration: 15,
      category: 'creative',
      steps:    ['Open a blank page, canvas, or note', 'Set a 15-minute timer — no interruptions', 'Make something with no purpose or goal', 'Let it be imperfect — that\'s the point', 'Enjoy the process more than the result'],
    },
    {
      icon:     '💌',
      name:     'Send a Kind Message',
      desc:     'Tell someone what they mean to you — 3 sentences is enough. Happiness amplifies when shared, and the act of expressing gratitude to others has measurable mood-compounding effects.',
      tag:      '3 min · Connection',
      duration: 3,
      category: 'connection',
      steps:    ['Think of someone who has made your life better recently', 'Open a message to them', 'Write: "I was just thinking about you because…"', 'Send it — no overthinking'],
    },
    {
      icon:     '🌞',
      name:     'Savouring Walk',
      desc:     'Walk outside and actively notice what\'s beautiful — a plant, light through a window, a sound. Intentional savouring extends positive emotional states by up to 40% (Fred Bryant, Loyola).',
      tag:      '10 min · Movement',
      duration: 10,
      category: 'movement',
      steps:    ['Go outside or to a window with a view', 'Walk slowly with no destination', 'Actively look for beauty in ordinary things', 'Pause when you notice something — really look at it', 'Say to yourself: "I\'m noticing this"'],
    },
  ],

  energised: [
    {
      icon:     '🧠',
      name:     'Tackle Your Hardest Task',
      desc:     'Your prefrontal cortex is primed and executive function is at its peak. This is the neurological window to do the task you\'ve been avoiding. It won\'t feel this manageable later.',
      tag:      '25 min · Focus',
      duration: 25,
      category: 'focus',
      steps:    ['Identify the one task you\'ve been procrastinating most', 'Close all tabs except what you need for it', 'Set a 25-minute Pomodoro timer', 'Start with the first concrete action — not planning', 'When the timer ends, take a 5-minute break'],
    },
    {
      icon:     '🏃',
      name:     'HIIT or Run',
      desc:     'Channel the physical energy outward. Even 15 minutes of vigorous movement converts nervous energy into endorphins, extends your energised window, and improves the quality of the peak.',
      tag:      '15 min · Movement',
      duration: 15,
      category: 'movement',
      steps:    ['Put on music with a fast BPM (120+)', 'Warm up for 2 minutes with light movement', 'Do 30 seconds on / 15 seconds rest intervals', 'Options: jumping jacks, high knees, burpees, sprinting', 'Cool down for 2 minutes with slow breathing'],
    },
    {
      icon:     '📋',
      name:     'Strategic Planning',
      desc:     'Capture the clarity you have right now. Write your top 3 goals for the week or month with specific first actions. Energised states produce the most decisive, clear-headed thinking.',
      tag:      '10 min · Planning',
      duration: 10,
      category: 'planning',
      steps:    ['Open a fresh page', 'Write: "My top 3 priorities this week are…"', 'For each, write one specific action you can take today', 'Add a deadline next to each one', 'Share it with someone for accountability (optional)'],
    },
  ],
};

/**
 * Get solutions for a given mood.
 * @param {string} mood
 * @returns {Array} solution objects
 */
function getSolutions(mood) {
  return SOLUTIONS[mood] || SOLUTIONS.neutral;
}

module.exports = { SOLUTIONS, getSolutions };
