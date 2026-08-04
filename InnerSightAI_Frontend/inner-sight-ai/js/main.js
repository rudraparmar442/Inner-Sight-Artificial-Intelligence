// ════════════════════════════════════════════════
//  INNER SIGHT AI — Main JS (Backend-Connected)
// ════════════════════════════════════════════════
(function () {
  'use strict';

  // Cursor
  const cursor=document.getElementById('cursor'), cursorDot=document.getElementById('cursorDot');
  let mx=0,my=0,cx=0,cy=0;
  if(cursor&&cursorDot){
    document.addEventListener('mousemove',(e)=>{mx=e.clientX;my=e.clientY;cursorDot.style.left=mx+'px';cursorDot.style.top=my+'px';});
    function animCursor(){cx+=(mx-cx)*0.12;cy+=(my-cy)*0.12;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(animCursor);}
    animCursor();
  }

  // Nav scroll
  const nav=document.getElementById('nav');
  if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40),{passive:true});

  // Reveal
  const reveals=document.querySelectorAll('.reveal');
  if(reveals.length){
    const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(el=>io.observe(el));
  }

  // Hero emoji cycle
  const moods=[{emoji:'🌊',label:'Calm',color:'var(--teal-light)'},{emoji:'😊',label:'Happy',color:'#F0A500'},{emoji:'😰',label:'Anxious',color:'#C0392B'},{emoji:'⚡',label:'Energised',color:'#27AE60'},{emoji:'😔',label:'Low',color:'#5D6D7E'},{emoji:'😐',label:'Neutral',color:'#7D8C9A'}];
  const heroEmoji=document.getElementById('heroEmoji'),moodLabel=document.getElementById('moodLabel');
  if(heroEmoji&&moodLabel){
    let idx=0;heroEmoji.style.transition='transform 0.3s ease';moodLabel.style.transition='opacity 0.3s ease';
    setInterval(()=>{idx=(idx+1)%moods.length;const m=moods[idx];heroEmoji.style.transform='scale(0)';moodLabel.style.opacity='0';setTimeout(()=>{heroEmoji.textContent=m.emoji;moodLabel.textContent=m.label;moodLabel.style.color=m.color;heroEmoji.style.transform='scale(1)';moodLabel.style.opacity='1';},300);},2800);
  }

  // Mood cards
  document.querySelectorAll('.mood-card').forEach(card=>{card.addEventListener('mouseenter',()=>{document.querySelectorAll('.mood-card').forEach(c=>c.classList.remove('active'));card.classList.add('active');});});

  // Email form — backend connected
  const emailForm=document.getElementById('emailForm');
  if(emailForm){
    emailForm.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const input=emailForm.querySelector('.email-input'),btn=emailForm.querySelector('button'),email=input.value.trim();
      if(!email)return;
      btn.innerHTML='<span>Joining…</span>';btn.disabled=true;
      let response={success:false,message:'Server se connect nahi ho pa raha.'};
      if(window.InnerSightAPI) response=await window.InnerSightAPI.subscribeEmail(email);
      if(response.success&&!response.duplicate){input.value='';btn.innerHTML='<span>You\'re in! ✓</span>';showToast('🌊 Welcome! Check your email.');}
      else if(response.duplicate){btn.innerHTML='<span>Already joined! ✓</span>';showToast('Tum already list mein ho! 🙏');}
      else{btn.innerHTML='<span>Try again →</span>';showToast(response.message||'Kuch galat hua.');}
      btn.disabled=false;
      setTimeout(()=>{btn.innerHTML='<span>Join Waitlist</span><span class="btn-arrow">→</span>';},4000);
    });
  }

  // Toast
  window.showToast=function(msg){
    let t=document.querySelector('.toast');
    if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}
    t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);
  };

  // Initial reveal
  setTimeout(()=>{document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top<window.innerHeight)el.classList.add('visible');});},100);
})();
