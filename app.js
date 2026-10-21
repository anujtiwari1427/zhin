/* ====================================================
   GOVIND'S BIRTHDAY — AURORA INTERACTIVE ENGINE
   ==================================================== */

/* ── 1. WEB AUDIO SYNTHESIZER ────────────────────── */
class AudioSynth {
  constructor() { this.ctx = null; this.playing = false; this.timer = null; }

  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    } catch(e) { return false; }
  }

  tone(freq, dur = 0.3, type = 'sine', vol = 0.15) {
    this.init();
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }

  pop() {
    this.init();
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.10);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.11);
    } catch(e) {}
  }

  whoosh() {
    this.init();
    try {
      const sr  = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sr * 0.4, sr);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
      const src  = this.ctx.createBufferSource(); src.buffer = buf;
      const filt = this.ctx.createBiquadFilter(); filt.type='bandpass';
      filt.frequency.setValueAtTime(1100, this.ctx.currentTime);
      filt.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      src.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
      src.start();
    } catch(e) {}
  }

  fanfare() {
    const seq = [
      [523.25, 0.15, 0],
      [523.25, 0.15, 0.13],
      [523.25, 0.15, 0.26],
      [659.25, 0.45, 0.40],
      [783.99, 0.65, 0.84],
    ];
    seq.forEach(([f,d,t]) => setTimeout(() => this.tone(f,d,'triangle',0.26), t*1000));
  }

  startMelody() {
    this.playing = true;
    const btn = document.getElementById('music-btn');
    if (btn) btn.classList.add('music-on');
    // Happy Birthday notes
    const notes = [
      {f:261.63,p:.35},{f:261.63,p:.25},{f:293.66,p:.60},{f:261.63,p:.60},
      {f:349.23,p:.60},{f:329.63,p:.95},
      {f:261.63,p:.35},{f:261.63,p:.25},{f:293.66,p:.60},{f:261.63,p:.60},
      {f:392.00,p:.60},{f:349.23,p:.95},
      {f:261.63,p:.35},{f:261.63,p:.25},{f:523.25,p:.60},{f:440.00,p:.60},
      {f:349.23,p:.60},{f:329.63,p:.60},{f:293.66,p:.85},
      {f:466.16,p:.35},{f:466.16,p:.25},{f:440.00,p:.60},{f:349.23,p:.60},
      {f:392.00,p:.60},{f:349.23,p:1.25},
    ];
    let i = 0;
    const next = () => {
      if (!this.playing) return;
      const n = notes[i]; i = (i+1) % notes.length;
      this.tone(n.f, n.p * 0.88, 'sine', 0.16);
      this.tone(n.f * 0.5, n.p * 0.88, 'triangle', 0.06);
      this.timer = setTimeout(next, n.p * 1000);
    };
    next();
  }

  stopMelody() {
    this.playing = false; clearTimeout(this.timer);
    const btn = document.getElementById('music-btn');
    if (btn) btn.classList.remove('music-on');
  }

  toggle() { this.playing ? this.stopMelody() : this.startMelody(); }
}

const audio = new AudioSynth();

/* ── 2. CONFETTI ENGINE ────────────────────────────── */
class Confetti {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.parts  = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  burst(x, y, n = 75) {
    const colors = ['#f43f72','#fbbf24','#a855f7','#2dd4bf','#fb7185','#fde68a','#34d399'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 9 + 4;
      this.parts.push({
        x: x ?? window.innerWidth/2,
        y: y ?? window.innerHeight/2,
        vx: Math.cos(a)*s, vy: Math.sin(a)*s - 2,
        size: Math.random()*8+4,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360, rotV: (Math.random()-0.5)*8,
        life: 1, decay: Math.random()*0.014+0.008
      });
    }
  }
  loop() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let i = this.parts.length-1; i >= 0; i--) {
      const p = this.parts[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.22; p.rot+=p.rotV; p.life-=p.decay;
      if (p.life<=0||p.y>this.canvas.height+20){this.parts.splice(i,1);continue;}
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.translate(p.x,p.y); this.ctx.rotate(p.rot*Math.PI/180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      this.ctx.restore();
    }
    requestAnimationFrame(() => this.loop());
  }
}

/* ── 3. FIREWORKS ENGINE ───────────────────────────── */
class Fireworks {
  constructor() {
    this.canvas = document.getElementById('fireworks-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.parts  = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  explode(x, y) {
    const colors = ['#f43f5e','#ec4899','#d946ef','#8b5cf6','#6366f1','#eab308','#22c55e'];
    const color  = colors[Math.floor(Math.random()*colors.length)];
    for (let i = 0; i < 55; i++) {
      const a = (Math.PI*2*i)/55;
      const s = Math.random()*5+2;
      this.parts.push({ x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, color, life:1, decay:Math.random()*0.02+0.012 });
    }
  }
  random() {
    const x = Math.random()*(this.canvas.width-200)+100;
    const y = Math.random()*(this.canvas.height*0.5)+80;
    this.explode(x,y);
    audio.tone(Math.random()*400+400,0.14,'triangle',0.09);
  }
  loop() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let i = this.parts.length-1; i >= 0; i--) {
      const p = this.parts[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.065; p.life-=p.decay;
      if (p.life<=0){this.parts.splice(i,1);continue;}
      this.ctx.save();
      this.ctx.globalAlpha=p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x,p.y,3,0,Math.PI*2);
      this.ctx.fillStyle=p.color;
      this.ctx.shadowBlur=10; this.ctx.shadowColor=p.color;
      this.ctx.fill(); this.ctx.restore();
    }
    requestAnimationFrame(()=>this.loop());
  }
}

let confetti, fireworks;

/* ── 4. TYPEWRITER ─────────────────────────────────── */
const phrases = [
  "To the one with the most radiant smile in any room! ✨",
  "The girl who turns ordinary days into core memories 🌸",
  "Unmatched park picnic energy & strawberry vibes 🍓",
  "Effortless elegance, hilarious pouts & absolute charisma 👑",
  "Here's to you, Govind — today is entirely yours! 🎉",
];

function startTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let pi = 0, ci = 0, del = false;
  function tick() {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0,ci-1) : cur.slice(0,ci+1);
    del ? ci-- : ci++;
    let wait = del ? 28 : 65;
    if (!del && ci===cur.length) { wait=2400; del=true; }
    else if (del && ci===0)      { del=false; pi=(pi+1)%phrases.length; wait=380; }
    setTimeout(tick, wait);
  }
  tick();
}

/* ── 5. CAKE CEREMONY ──────────────────────────────── */
let blown = false;

function blowCandles() {
  if (blown) return; blown = true;
  audio.whoosh();
  setTimeout(() => audio.fanfare(), 320);
  document.getElementById('cake-visual').classList.add('blown');
  const s = document.getElementById('cake-status');
  if (s) { s.textContent='✨ Wish Made! Candles Out 💨'; s.style.borderColor='#4ade80'; s.style.color='#86efac'; }
  const wb = document.getElementById('wish-reveal');
  if (wb) wb.classList.add('show');
  confetti.burst(window.innerWidth/2, window.innerHeight*0.42, 130);
  fireworks.random();
  setTimeout(()=>fireworks.random(), 420);
}

function relightCandles() {
  blown = false;
  document.getElementById('cake-visual').classList.remove('blown');
  const s = document.getElementById('cake-status');
  if (s) { s.textContent='🕯️ Candles Glowing — Ready to Wish'; s.style.borderColor=''; s.style.color=''; }
  const wb = document.getElementById('wish-reveal');
  if (wb) wb.classList.remove('show');
  audio.tone(600,0.2,'sine',0.2);
}

/* ── 6. COMPLIMENT CAPSULE ─────────────────────────── */
const capsules = [
  "Your laughter is genuinely contagious — you light up every room you step into! ☀️",
  "The dramatic pout & expressions that could honestly win an Oscar 🏆🎬",
  "You wear traditional kurtas with pure grace and casual fits like a model ✨",
  "The most loyal, caring, and fiercely supportive presence anyone could ever ask for 💖",
  "Your music taste — from soulful Bollywood to cute chimes — is absolutely elite 🎶",
  "Never afraid to be your authentic, quirky, wonderful self around the people you love 🍓",
  "You have this rare gift of making someone feel seen, heard, and celebrated 🌷",
  "The ultimate adventure buddy for spontaneous plans, food runs &amp; late-night chats! 🍰",
  "May this year bring you massive wins, peaceful mornings &amp; endless beautiful moments 🌟",
  "You are not just someone's friend — you are their sunshine, their peace, their favourite 💫",
];
let capIdx = 0;

function nextCapsule() {
  capIdx = (capIdx+1) % capsules.length;
  const el  = document.getElementById('capsule-text');
  const num = document.getElementById('capsule-num');
  if (!el) return;
  el.classList.add('fade');
  audio.tone(587,0.14,'sine',0.18);
  setTimeout(()=>audio.tone(880,0.22,'triangle',0.22),100);
  setTimeout(()=>{
    el.textContent = `"${capsules[capIdx]}"`;
    if (num) num.textContent = `REASON #${capIdx+1} OF 10`;
    el.classList.remove('fade');
  }, 280);
  confetti.burst(window.innerWidth*0.5, window.innerHeight*0.65, 45);
}

/* ── 7. BALLOON MINI-GAME ──────────────────────────── */
let gameOn = false, score = 0, spawnInterval = null;
const popWords = ['Gorgeous! 🌸','Superstar! 🌟','+10 Vibes! 💖','Iconic! 👑','Snap! 🍓','Sunshine! ☀️'];

function startGame() {
  document.getElementById('arena-overlay').style.display = 'none';
  score = 0; updateScore(); gameOn = true;
  document.getElementById('arena').innerHTML = '';
  if (spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnBalloon, 900);
}

function spawnBalloon() {
  const arena = document.getElementById('arena');
  if (!arena||!gameOn) return;
  const b = document.createElement('div'); b.className='game-balloon';
  const colors  = ['#f43f72','#a855f7','#2dd4bf','#f59e0b','#ec4899','#10b981'];
  const emojis  = ['🎈','💖','🎂','🍓','✨','🌸'];
  const col = colors[Math.floor(Math.random()*colors.length)];
  b.style.backgroundColor = col; b.style.color = col;
  b.innerHTML = `<span>${emojis[Math.floor(Math.random()*emojis.length)]}</span>`;
  b.style.left = `${Math.random()*(arena.clientWidth-70)}px`;
  const dur = Math.random()*2.5+3.5;
  b.style.animationDuration = `${dur}s`;
  b.addEventListener('click', ()=>{
    audio.pop(); score+=10; updateScore();
    const rect = b.getBoundingClientRect();
    confetti.burst(rect.left+30, rect.top+30, 22);
    const msg = document.createElement('div');
    msg.textContent = popWords[Math.floor(Math.random()*popWords.length)];
    Object.assign(msg.style, {
      position:'absolute', left:`${b.offsetLeft}px`, top:`${b.offsetTop}px`,
      color:'#fff', fontWeight:'bold', pointerEvents:'none',
      transition:'all 0.6s ease', zIndex:'10', whiteSpace:'nowrap',
      fontSize:'0.9rem',
    });
    arena.appendChild(msg);
    setTimeout(()=>{ msg.style.transform='translateY(-30px)'; msg.style.opacity='0'; },20);
    setTimeout(()=>msg.remove(), 700);
    b.remove();
  });
  arena.appendChild(b);
  setTimeout(()=>{ if(b.parentNode) b.remove(); }, dur*1000);
}

function updateScore() {
  const el = document.getElementById('score');
  if (el) el.textContent = score;
}

/* ── 8. PHOTO UPLOAD ───────────────────────────────── */
function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    addPolaroid(ev.target.result, "Your Special Moment 📸✨", "Added Memory");
    savePhoto(ev.target.result);
    confetti.burst(window.innerWidth/2, window.innerHeight*0.55, 65);
    audio.fanfare();
  };
  reader.readAsDataURL(file);
}

function addPolaroid(src, note='A Cherished Moment 💖', tag='Memory') {
  const grid   = document.getElementById('polaroid-grid');
  const upload = document.getElementById('upload-card');
  if (!grid) return;
  const card = document.createElement('div'); card.className='polaroid';
  card.innerHTML=`
    <div class="tape"></div>
    <div class="polaroid-img"><img src="${src}" alt="Memory"/></div>
    <div class="polaroid-caption">
      <span class="polaroid-tag">${tag}</span>
      <p class="polaroid-note">${note}</p>
    </div>`;
  if (upload) grid.insertBefore(card, upload);
  else grid.appendChild(card);
}

function savePhoto(url) {
  try {
    const arr = JSON.parse(localStorage.getItem('bdyphotos')||'[]');
    arr.push(url);
    localStorage.setItem('bdyphotos', JSON.stringify(arr));
  } catch(e) {}
}

function loadPhotos() {
  try {
    JSON.parse(localStorage.getItem('bdyphotos')||'[]')
      .forEach((url,i)=>addPolaroid(url,`Govind's Memory #${i+1} 💖`,'Saved'));
  } catch(e) {}
}

/* ── 9. WISHES BOARD ───────────────────────────────── */
const seedWishes = [
  { name:'A Close Friend',   emoji:'💖', text:'Wishing you the most magical birthday ever! May every dream of yours bloom into reality this year. Love you so much! 🌸' },
  { name:'Your Person',      emoji:'✨', text:'Happy birthday to the most genuine, hilarious, and warmhearted soul I know. This day deserves to be as beautiful as you are! 🎂' },
  { name:'Someone Special',  emoji:'🎉', text:'Here's to you — to park outings, great music, the funniest photos and the sweetest memories yet to come! 🍓' },
];

function loadWishes() {
  const stream = document.getElementById('wishes-stream');
  if (!stream) return;
  stream.innerHTML = '';
  let list;
  try { list = JSON.parse(localStorage.getItem('bdywishes') || 'null') || seedWishes; }
  catch(e) { list = seedWishes; }
  list.forEach(w => renderWish(w, stream));
}

function renderWish(w, container) {
  const c = document.createElement('div'); c.className='wish-card';
  c.innerHTML=`
    <div class="wish-header">
      <span class="wish-name">${w.name}</span>
      <span class="wish-emoji">${w.emoji}</span>
    </div>
    <p class="wish-text">${w.text}</p>
    <div class="wish-time">${w.time||'Birthday Blessing'}</div>`;
  container.prepend(c);
}

function submitWish(e) {
  e.preventDefault();
  const name  = document.getElementById('wish-name').value.trim() || 'A Dear Friend';
  const text  = document.getElementById('wish-msg').value.trim();
  const emoji = document.querySelector('.emoji-chip.active')?.textContent || '💖';
  if (!text) return;
  const w = { name, emoji, text, time:'Just now' };
  renderWish(w, document.getElementById('wishes-stream'));
  try {
    const arr = JSON.parse(localStorage.getItem('bdywishes')||'null') || seedWishes;
    arr.unshift(w);
    localStorage.setItem('bdywishes', JSON.stringify(arr));
  } catch(err) {}
  document.getElementById('wish-name').value = '';
  document.getElementById('wish-msg').value  = '';
  confetti.burst(window.innerWidth*0.7, window.innerHeight*0.8, 55);
  audio.tone(659,0.2,'sine',0.2);
}

/* ── 10. LETTER EDITOR ─────────────────────────────── */
function toggleLetter() {
  const body = document.getElementById('letter-body');
  const btn  = document.getElementById('edit-btn');
  if (!body||!btn) return;
  if (body.isContentEditable) {
    body.contentEditable = 'false';
    btn.textContent = '✏️ Edit Letter';
    body.style.background=''; body.style.padding='';
    try { localStorage.setItem('bdyletter', body.innerHTML); } catch(e) {}
    audio.tone(523,0.18,'sine',0.15);
  } else {
    body.contentEditable = 'true';
    btn.textContent = '💾 Save Letter';
    body.style.background='rgba(255,238,235,0.5)';
    body.style.padding='10px';
    body.style.borderRadius='8px';
    body.focus();
  }
}

function loadLetter() {
  try {
    const saved = localStorage.getItem('bdyletter');
    if (saved) document.getElementById('letter-body').innerHTML = saved;
  } catch(e) {}
}

/* ── 11. PARTY MODE ────────────────────────────────── */
let partyInterval = null;
function toggleParty() {
  document.body.classList.toggle('party');
  const on  = document.body.classList.contains('party');
  const btn = document.getElementById('party-btn');
  if (on) {
    if (btn) { btn.classList.add('party-on'); btn.textContent='🎉 Party ON!'; }
    fireworks.random();
    partyInterval = setInterval(()=>{ fireworks.random(); if(Math.random()>0.55) confetti.burst(Math.random()*window.innerWidth, Math.random()*window.innerHeight*0.55, 45); }, 1800);
  } else {
    if (btn) { btn.classList.remove('party-on'); btn.textContent='🎉 Party'; }
    clearInterval(partyInterval);
  }
}

/* ── 12. INTRO REVEAL ──────────────────────────────── */
function openSurprise() {
  // ① Hide overlay IMMEDIATELY — guaranteed, nothing can block this
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    overlay.style.opacity    = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.pointerEvents = 'none';
    overlay.classList.add('hidden');
  }

  // ② Visual effects — each wrapped so one failure can't stop the next
  setTimeout(() => {
    try { if (confetti)  confetti.burst(window.innerWidth/2, window.innerHeight/2, 180); } catch(e) {}
    try { if (fireworks) fireworks.random(); }                                              catch(e) {}
    setTimeout(() => { try { if (fireworks) fireworks.random(); } catch(e) {} }, 420);
  }, 50);

  // ③ Audio — delayed so AudioContext is triggered well after user gesture
  setTimeout(() => { try { audio.fanfare();      } catch(e) {} }, 200);
  setTimeout(() => { try { audio.startMelody();  } catch(e) {} }, 1000);
}

/* ── BOOT ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  confetti  = new Confetti();
  fireworks = new Fireworks();
  startTypewriter();
  loadPhotos();
  loadWishes();
  loadLetter();

  // Intro
  document.getElementById('open-btn')   ?.addEventListener('click', openSurprise);
  document.getElementById('gift-box')   ?.addEventListener('click', openSurprise);

  // Navbar
  document.getElementById('music-btn') ?.addEventListener('click', ()=>audio.toggle());
  document.getElementById('party-btn') ?.addEventListener('click', toggleParty);

  // Cake
  document.getElementById('blow-btn')    ?.addEventListener('click', blowCandles);
  document.getElementById('relight-btn') ?.addEventListener('click', relightCandles);
  document.querySelectorAll('.flame').forEach(f => f.addEventListener('click', blowCandles));

  // Capsule
  document.getElementById('capsule-btn')?.addEventListener('click', nextCapsule);

  // Game
  document.getElementById('start-btn')  ?.addEventListener('click', startGame);

  // Upload
  const uploadCard  = document.getElementById('upload-card');
  const photoInput  = document.getElementById('photo-input');
  if (uploadCard && photoInput) {
    uploadCard.addEventListener('click', ()=>photoInput.click());
    photoInput.addEventListener('change', handleUpload);
  }

  // Letter
  document.getElementById('edit-btn')   ?.addEventListener('click', toggleLetter);

  // Emoji chips
  document.querySelectorAll('.emoji-chip').forEach(btn => {
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.emoji-chip').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Wish form
  document.getElementById('wish-form')  ?.addEventListener('submit', submitWish);

  // Footer fireworks
  document.getElementById('fireworks-btn')?.addEventListener('click', ()=>{
    fireworks.random(); setTimeout(()=>fireworks.random(),300); setTimeout(()=>fireworks.random(),600);
    confetti.burst(window.innerWidth/2, window.innerHeight*0.7, 90);
    audio.fanfare();
  });
});
