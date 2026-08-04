// ════════════════════════════════════════════════════════════════
//  INNER SIGHT AI — Quiz Engine (Backend-Connected)
//  js/quiz.js
// ════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const QUESTIONS = [
    {
      id: 1, tag: 'Abhi is waqt',
      text: 'Aaj subah uthte waqt tumhara sharir kaisa feel kar raha tha?',
      options: [
        { text: '🪨 Bohot bhari — uthne ka mann hi nahi tha',           scores: { sad: 3, anxious: 1 } },
        { text: '⚡ Tense — jaise koi bojh pehle se utha rakha ho',     scores: { anxious: 3, sad: 1 } },
        { text: '😑 Theek, bas thodi si neend baaqi thi',               scores: { neutral: 2 } },
        { text: '✨ Halka aur tayaar',                                  scores: { happy: 2, energised: 1 } },
      ],
    },
    {
      id: 2, tag: 'Tumhara Mann',
      text: 'Abhi is waqt tumhare dimaag mein kya chal raha hai?',
      options: [
        { text: '🌀 Bahut kuch — race kar rahe hain thoughts',          scores: { anxious: 4 } },
        { text: '🌫 Bikre hue — ek cheez pe focus nahi ho raha',        scores: { anxious: 2, neutral: 1 } },
        { text: '🤫 Shant — khaas kuch nahi chal raha',                scores: { sad: 2, calm: 1 } },
        { text: '💧 Saaf aur smooth',                                  scores: { calm: 2, happy: 1 } },
      ],
    },
    {
      id: 3, tag: 'Energy',
      text: 'Agar main tumhe abhi 10 minute walk pe jaane ko bolun?',
      options: [
        { text: '😶 "Baad mein" — abhi taqat nahi',                    scores: { sad: 4 } },
        { text: '😟 "Chahta hoon par kuch rok raha hai"',              scores: { anxious: 2, sad: 1 } },
        { text: '🙂 "Theek hai, kyun nahi"',                            scores: { neutral: 2, calm: 1 } },
        { text: '🏃 "Haan! Chalte hain!"',                             scores: { energised: 4, happy: 1 } },
      ],
    },
    {
      id: 4, tag: 'Log-Baag',
      text: 'Abhi logon ke saath rehne ke baare mein kaisa feel ho raha hai?',
      options: [
        { text: '🚪 Akela rehna chahta/chahti hoon',                   scores: { sad: 3, anxious: 1 } },
        { text: '😬 Thoda awkward, edge pe hoon',                      scores: { anxious: 4 } },
        { text: '🤷 Koi fark nahi — depends karta hai',                scores: { neutral: 2 } },
        { text: '😊 Milna chahta hoon, connect karna achha lagega',    scores: { happy: 2, energised: 1 } },
      ],
    },
    {
      id: 5, tag: 'Ek Tasveer',
      text: 'Kaunsi tasveer tumhari andar ki feeling se match karti hai?',
      options: [
        { text: '🌧 Bhoori, barish waali dopahar',                     scores: { sad: 4 } },
        { text: '⛈ Toofan aane se pehle ka mahaul',                   scores: { anxious: 4 } },
        { text: '☁️ Badal hain, par barish nahi',                      scores: { neutral: 3 } },
        { text: '☀️ Dhup waali sundar dopahar',                        scores: { happy: 2, calm: 1 } },
      ],
    },
    {
      id: 6, tag: 'Tumhe Chahiye',
      text: 'Agli ek ghante ke liye sabse perfect kya hoga?',
      options: [
        { text: '🛋 Lait ke kuch soft sunna',                          scores: { sad: 2, calm: 1 } },
        { text: '🎮 Kuch aisa jo mann ko distract kare ya shant kare', scores: { anxious: 3 } },
        { text: '🌿 Koi halki, peaceful activity akele',                scores: { calm: 3, neutral: 1 } },
        { text: '🎨 Kuch active ya creative',                          scores: { energised: 2, happy: 1 } },
      ],
    },
    {
      id: 7, tag: 'Ek Shabd',
      text: 'Aaj ke din ko ek shabd mein — kaun sa closest lagta hai?',
      options: [
        { text: '💧 "Bhari"',    scores: { sad: 4 } },
        { text: '🌀 "Ghoomti"',  scores: { anxious: 4 } },
        { text: '🌫 "Mandi"',    scores: { neutral: 2, sad: 1 } },
        { text: '🌿 "Stable"',   scores: { calm: 4 } },
        { text: '☀️ "Khuli"',   scores: { happy: 2, energised: 1 } },
      ],
    },
  ];

  const LOCAL_MOODS = {
    anxious:   { name: 'Anxious',   emoji: '😰', color: '#C0392B', desc: 'Tumhara dimaag abhi bahut busy aur tense hai. Racing thoughts hain. Chalo breathe karte hain.' },
    sad:       { name: 'Low',       emoji: '😔', color: '#5D6D7E', desc: 'Aaj sab kuch thoda bhari feel ho raha hai. Koi baat nahi — gentleness chahiye bas.' },
    neutral:   { name: 'Neutral',   emoji: '😐', color: '#7D8C9A', desc: 'Tum ek balanced, steady jagah mein ho. Na upar na neeche. Yeh powerful hai.' },
    calm:      { name: 'Calm',      emoji: '🌊', color: '#1E7A8A', desc: 'Ek shukaun aur stillness feel ho rahi hai. Isko banaaye rakhein.' },
    happy:     { name: 'Happy',     emoji: '😊', color: '#F0A500', desc: 'Ek halkapan aur warmth hai tumhare andar aaj. Open ho aur is energy ko channel karo.' },
    energised: { name: 'Energised', emoji: '⚡', color: '#27AE60', desc: 'Tum full voltage pe ho! Mind aur body align hain. Is state ka pura use karo.' },
  };

  const LOCAL_SOLUTIONS = {
    anxious:   [
      { icon:'🌬', name:'4-7-8 Breathing', desc:'4 counts inhale, 7 hold, 8 exhale. Parasympathetic nervous system activate hota hai.', tag:'5 min · Breathing' },
      { icon:'📝', name:'Thought Dump', desc:'Jo bhi dimaag mein chal raha hai sab likho — no structure needed.', tag:'10 min · Journaling' },
      { icon:'🎵', name:'Theta Wave Ambient', desc:'Low-frequency sounds brainwave activity slow karte hain.', tag:'Ongoing · Music' },
    ],
    sad:       [
      { icon:'🌿', name:'Body Scan', desc:'Sar se pair tak slow scan. Heaviness notice karo bina kuch fix kiye.', tag:'8 min · Mindfulness' },
      { icon:'📔', name:'Gratitude Prompt', desc:'"Aakhri baar kab theek feel hua?" — sirf woh moment ke baare mein likhlo.', tag:'5 min · Journaling' },
      { icon:'🎵', name:'Lo-fi Comfort', desc:'Warm slow-tempo music jo tumhare saath baitha rahe.', tag:'Ongoing · Music' },
    ],
    neutral:   [
      { icon:'🧘', name:'Mindful Chai', desc:'Apna agla drink puri dhyan se banao aur piyo.', tag:'5 min · Mindfulness' },
      { icon:'🚶', name:'10-Min Walk', desc:'5 cheezein dekho, 4 chhuyo, 3 sounds suno — present mein aa jao.', tag:'10 min · Movement' },
      { icon:'📖', name:'Open Reflection', desc:'"Agli kuch ghante kaisi feel karni chahiye?" — bina judge kiye likhlo.', tag:'7 min · Journaling' },
    ],
    calm:      [
      { icon:'🌊', name:'Box Breathing', desc:'4 in, 4 hold, 4 out, 4 hold. Is calm state ko aur deepen karo.', tag:'5 min · Breathing' },
      { icon:'🎵', name:'Nature Soundscape', desc:'Barish, samundar, jungle — biophilic sounds calm ko extend karte hain.', tag:'Ongoing · Music' },
      { icon:'✍️', name:'Free Write', desc:'3 minute bina ruke likhte raho — koi topic nahi.', tag:'3 min · Journaling' },
    ],
    happy:     [
      { icon:'🎨', name:'Creative Flow', desc:'Sketch, likho, banao kuch. Happy state mein creativity 60% better hoti hai.', tag:'15 min · Creative' },
      { icon:'💌', name:'Kind Message', desc:'Kisi ko 3 sentences mein batao unka kya matlab hai tumhare liye.', tag:'3 min · Connection' },
      { icon:'🌞', name:'Savouring Walk', desc:'Bahar jao aur sundar cheezein dhundho — positive mood 40% extend hota hai.', tag:'10 min · Movement' },
    ],
    energised: [
      { icon:'🧠', name:'Hardest Task Pehle', desc:'Prefrontal cortex best condition mein hai. Woh kaam karo jo avoid kar rahe the.', tag:'25 min · Focus' },
      { icon:'🏃', name:'HIIT / Run', desc:'15 minute vigorous movement is peak state ko aur extend karta hai.', tag:'15 min · Movement' },
      { icon:'📋', name:'Strategic Planning', desc:'Week ke top 3 goals likhlo specific actions ke saath.', tag:'10 min · Planning' },
    ],
  };

  let currentQ = 0, history = [], localScores = { anxious:0, sad:0, neutral:0, calm:0, happy:0, energised:0 };
  let allAnswers = [], lastResult = null;

  const screens = {
    intro:    document.getElementById('screen-intro'),
    question: document.getElementById('screen-question'),
    loading:  document.getElementById('screen-loading'),
    result:   document.getElementById('screen-result'),
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s && s.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
  }

  window.startQuiz = function () {
    currentQ = 0; history = []; allAnswers = []; lastResult = null;
    localScores = { anxious:0, sad:0, neutral:0, calm:0, happy:0, energised:0 };
    window._quizLoadStart = Date.now();
    showQuestion(0);
    showScreen('question');
  };

  function showQuestion(idx) {
    const q = QUESTIONS[idx];
    document.getElementById('progressFill').style.width  = (idx / QUESTIONS.length * 100) + '%';
    document.getElementById('progressText').textContent  = `${idx+1} / ${QUESTIONS.length}`;
    document.getElementById('questionTag').textContent   = q.tag;
    document.getElementById('questionText').textContent  = q.text;
    document.getElementById('backBtn').style.display     = idx > 0 ? 'inline-flex' : 'none';

    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65+i)}</span><span>${opt.text}</span>`;
      btn.addEventListener('click', () => selectOption(idx, i, opt));
      grid.appendChild(btn);
    });
    // Animate
    const card = document.querySelector('.question-card');
    if (card) {
      card.style.transition='none'; card.style.opacity='0'; card.style.transform='translateY(14px)';
      requestAnimationFrame(()=>{ card.style.transition='opacity 0.4s ease,transform 0.4s ease'; card.style.opacity='1'; card.style.transform='translateY(0)'; });
    }
  }

  function selectOption(qIdx, optIdx, opt) {
    document.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
    document.querySelectorAll('.option-btn')[optIdx].classList.add('selected');
    Object.entries(opt.scores).forEach(([mood,pts])=>{ localScores[mood]+=pts; });
    allAnswers.push({ questionText: QUESTIONS[qIdx].text, selectedText: opt.text.replace(/[\u{1F000}-\u{1FFFF}]/gu,'').trim(), optionIndex: optIdx });
    history.push({ qId: QUESTIONS[qIdx].id, optIdx, scores:{...opt.scores} });
    setTimeout(()=>{
      const next = qIdx+1;
      if (next < QUESTIONS.length) { currentQ=next; showQuestion(next); }
      else { document.getElementById('progressFill').style.width='100%'; startLoading(); }
    }, 380);
  }

  window.goBack = function () {
    if (currentQ<=0) return;
    const last=history.pop(); allAnswers.pop();
    Object.entries(last.scores).forEach(([mood,pts])=>{ localScores[mood]=Math.max(0,localScores[mood]-pts); });
    currentQ--; showQuestion(currentQ);
  };

  function startLoading() {
    showScreen('loading');
    const steps=['loadStep1','loadStep2','loadStep3'];
    steps.forEach(id=>{ const el=document.getElementById(id); if(el){el.classList.remove('active','done');} });
    let s=0;
    function tick(){
      if(s>0){ const prev=document.getElementById(steps[s-1]); if(prev){prev.classList.remove('active');prev.classList.add('done');} }
      if(s<steps.length){ const cur=document.getElementById(steps[s]); if(cur)cur.classList.add('active'); s++; setTimeout(tick,850); }
    }
    tick();
    runPrediction();
  }

  async function runPrediction() {
    let result = null;
    if (window.InnerSightAPI) {
      result = await window.InnerSightAPI.analyseMood(allAnswers, localScores);
    }
    if (!result) { result = localPredict(); result.offline=true; }
    lastResult = result;

    if (!result.offline && window.InnerSightAPI && result.sessionId) {
      window.InnerSightAPI.saveSession({ sessionId:result.sessionId, mood:result.mood, intensity:result.intensity, scores:localScores, answers:allAnswers });
    }

    const MIN_LOAD=2600, elapsed=Date.now()-(window._quizLoadStart||Date.now());
    setTimeout(()=>renderResult(result), Math.max(0,MIN_LOAD-elapsed));
  }

  function localPredict() {
    const sorted=Object.entries(localScores).sort((a,b)=>b[1]-a[1]);
    const topMood=sorted[0][0], secondMood=sorted[1][1]>0?sorted[1][0]:null;
    const total=sorted.reduce((s,[,v])=>s+v,0), topVal=sorted[0][1];
    const intensity=total>0?Math.round(40+(topVal/total)*55):60;
    const conf=total>0?Math.min(0.88,topVal/total+0.25):0.55;
    const mood=LOCAL_MOODS[topMood];
    return { mood:topMood, moodName:mood.name, emoji:mood.emoji, color:mood.color, description:mood.desc,
             intensity, confidence:parseFloat(conf.toFixed(2)), secondary:secondMood, signals:[],
             solutions:LOCAL_SOLUTIONS[topMood]||[], scores:{...localScores} };
  }

  function renderResult(result) {
    const moodCard=document.getElementById('resultMoodCard');
    document.getElementById('resultEmoji').textContent  = result.emoji;
    document.getElementById('resultName').textContent   = result.moodName||result.mood;
    document.getElementById('resultDesc').textContent   = result.description;
    document.getElementById('meterPct').textContent     = result.intensity+'%';
    moodCard.style.borderColor=(result.color||'#1E7A8A')+'50';
    moodCard.style.background =(result.color||'#1E7A8A')+'0E';

    const confEl=document.getElementById('resultConfidence');
    if(confEl) confEl.textContent=Math.round((result.confidence||0.7)*100)+'% confident';

    const secEl=document.getElementById('resultSecondary');
    if(secEl){ secEl.style.display=result.secondary?'block':'none'; if(result.secondary) secEl.textContent='Secondary: '+result.secondary; }

    const srcEl=document.getElementById('resultSource');
    if(srcEl) srcEl.textContent=result.aiUsed?'🤖 AI-Enhanced':result.offline?'📱 Offline Mode':'🧠 Inner Sight Model';

    const grid=document.getElementById('solutionsGrid');
    grid.innerHTML='';
    (result.solutions||LOCAL_SOLUTIONS[result.mood]||[]).slice(0,3).forEach((sol,i)=>{
      const card=document.createElement('div');
      card.className='solution-card';
      card.style.animationDelay=(i*0.1)+'s';
      card.innerHTML=`<div class="solution-icon">${sol.icon}</div><div class="solution-body"><div class="solution-name">${sol.name}</div><div class="solution-desc">${sol.desc}</div><span class="solution-tag">${sol.tag}</span></div>`;
      grid.appendChild(card);
    });

    window._currentSessionId=result.sessionId;
    window._currentMood=result.mood;
    setTimeout(showFeedbackWidget,3000);

    showScreen('result');
    setTimeout(()=>{ const fill=document.getElementById('meterFill'); if(fill)fill.style.width=result.intensity+'%'; },300);
  }

  function showFeedbackWidget(){
    const w=document.getElementById('feedbackWidget');
    if(w)w.classList.add('visible');
  }

  window.submitFeedback=async function(helpful){
    if(window.InnerSightAPI&&window._currentSessionId){
      await window.InnerSightAPI.sendFeedback({ sessionId:window._currentSessionId, mood:window._currentMood||'neutral', helpful });
    }
    const w=document.getElementById('feedbackWidget');
    if(w) w.innerHTML='<div class="feedback-thanks">Shukriya! 🙏</div>';
  };

  window.handleEmailResult=async function(e){
    e.preventDefault();
    const input=document.getElementById('emailResultInput');
    if(!input||!input.value)return;
    const btn=document.getElementById('emailResultBtn');
    if(btn){btn.textContent='Sending…';btn.disabled=true;}
    const res=await window.InnerSightAPI?.emailResult(input.value,window._currentMood,lastResult?.description||'',window._currentSessionId||'unknown');
    if(btn){btn.textContent=res?.success?'✓ Bhej diya!':'Failed. Retry?';btn.disabled=false;}
    if(res?.success){input.value='';window.showToast?.('Result email pe bhej diya! 📧');}
  };

  window.retakeQuiz=function(){
    document.getElementById('meterFill').style.width='0%';
    const w=document.getElementById('feedbackWidget');
    if(w){w.classList.remove('visible');}
    showScreen('intro');
  };
})();
