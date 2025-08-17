/* Slot Frontend — clean build with RFID-gated start, themes, HUD, holds
 * Controls: S/D/F/G/H = HOLD 1..5 — Space = Spin — B = simulate RFID badge
 * Dev panel (Shift+W)
 */
(() => {
  // -------------------- Utils & DOM refs --------------------
  const $ = (s) => document.querySelector(s);
  let reelsEl, spinBtn, creditEl, betEl, winEl, holdBtns = [];

  // -------------------- Global state --------------------
  const state = {
    credits: 1000,
    bet: 10,
    win: 0,
    columns: 5,
    symbols: [],
    symbolType: 'emoji',  // 'emoji' | 'image'
    activeTheme: 'island-fortune',
    spinning: false,
    holds: new Set(),
    holdMode: false,      // allowed after a loss
    maxHolds: 3,
    currentMiddle: Array(5).fill(null),
    themeBasePath: '',    // prefix to resolve relative symbol paths
    themeIndex: [],       // loaded from assets/themes/index.json
    forcedSymbols: [],    // manual symbols for next spin (length 5, values or null)
    forceWinCount: 0,     // 0=off, 1-5: number of identical symbols from left
    _tempWinSymbol: null,
    rfidReady: false,     // gate gameplay until badge
    // Lose overlay control
    loseOverlayActive: false,
    loseOverlayTimerId: null,
    loseKeyHandler: null,
  };

  function setCSSVar(name, val){
    if(val!==undefined && val!==null){
      document.documentElement.style.setProperty(name, String(val));
    }
  }

  // -------------------- Audio (simple synth + theme buffers) --------------------
  const Sound = {
    ctx: null,
    master: null,
    volume: 0.8,
    muted: false,
    buffers: Object.create(null), // { key: AudioBuffer }
    themeAudio: null, // raw theme audio config
    _unlocked: false,
    ambientNode: null,

    init(){
      if(!this.ctx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return;
        this.ctx = new AC();
      }
      if(!this.master && this.ctx){
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.ctx.destination);
      }
      if(!this._unlocked){
        const unlock = () => {
          try{ this.ctx?.resume(); this._unlocked = true; document.removeEventListener('pointerdown', unlock); }catch{}
        };
        document.addEventListener('pointerdown', unlock, { once:true });
      }
    },
    setVolume(v){ this.volume = Math.max(0, Math.min(1, v)); if(this.master) this.master.gain.value = this.muted ? 0 : this.volume; },
    toggleMute(){ this.muted = !this.muted; if(this.master) this.master.gain.value = this.muted ? 0 : this.volume; return this.muted; },

    // Low-level synth helper
    beep(freq=440, dur=0.08, type='sine', gain=0.06){
      try{
        this.init();
        if(!this.ctx || !this.master) return;
        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gain, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
        osc.frequency.value = freq;
        osc.type = type;
        osc.connect(g).connect(this.master);
        osc.start(t0); osc.stop(t0+dur);
      }catch{}
    },

    // Buffer playback if available
    playBuffer(key, { rate=1, detune=0, loop=false, gain=1 }={}){
      try{
        this.init();
        const buf = this.buffers[key];
        if(!this.ctx || !this.master || !buf) return false;
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate; src.detune.value = detune; src.loop = loop;
        const g = this.ctx.createGain(); g.gain.value = gain;
        src.connect(g).connect(this.master); src.start(t);
        if(!loop) src.stop(t + buf.duration/Math.max(0.001, rate) + 0.01);
        return true;
      }catch{ return false; }
    },
    ambientPlay(){
      try{
        this.init();
        const buf = this.buffers['ambient'];
        if(!this.ctx || !this.master || !buf) return false;
        if(this.ambientNode){ return true; }
        const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const g = this.ctx.createGain(); g.gain.value = 0.25;
        src.connect(g).connect(this.master); src.start();
        this.ambientNode = src;
        return true;
      }catch{ return false; }
    },
    ambientStop(){ try{ this.ambientNode?.stop(); }catch{} this.ambientNode = null; },

    // Theme audio loading
    async loadThemeAudio(theme){
      this.init();
      this.buffers = Object.create(null);
      this.themeAudio = theme?.audio || null;
      if(!this.themeAudio) return; // optional
      const base = theme.basePath ? theme.basePath + '/' : '';
      const entries = [];
      const add = (key, rel) => { if(rel) entries.push([key, base + rel]); };
      add('uiClick', this.themeAudio?.effects?.buttonClick || this.themeAudio?.effects?.click);
      add('spin', this.themeAudio?.effects?.spin || this.themeAudio?.effects?.spinStart);
      add('reelStop', this.themeAudio?.effects?.reelStop);
      add('win', this.themeAudio?.effects?.win || this.themeAudio?.effects?.winSmall);
      add('bigWin', this.themeAudio?.effects?.bigWin);
      add('jackpot', this.themeAudio?.effects?.jackpot);
      add('error', this.themeAudio?.effects?.error);
      add('ambient', this.themeAudio?.ambient);
      for(const [key, url] of entries){
        try{
          const res = await fetch(url, { cache:'no-store' }); if(!res.ok) throw new Error(res.statusText);
          const arr = await res.arrayBuffer();
          const buf = await this.ctx.decodeAudioData(arr);
          this.buffers[key] = buf;
        }catch(e){ /* ignore, fallback to synth */ }
      }
    },

    // Event helpers with graceful fallback
    uiClick(){ if(this.playBuffer('uiClick')) return; this.beep(800,0.04,'triangle',0.05); },
    spinStart(){ if(this.playBuffer('spin')) return; this.beep(200,0.08,'triangle',0.05); setTimeout(()=>this.beep(260,0.07,'sine',0.045),60); setTimeout(()=>this.beep(320,0.06,'triangle',0.04),120); },
    reelStop(i=0){ if(this.playBuffer('reelStop')) return; const f = 360 + i*40; this.beep(f,0.07,'sine',0.045); setTimeout(()=>this.beep(f*0.8,0.05,'triangle',0.035),35); },
    winSmall(){ if(this.playBuffer('win')) return; this.beep(880,0.16,'square',0.06); setTimeout(()=>this.beep(1100,0.12,'sine',0.05),140); },
    winBig(){ if(this.playBuffer('bigWin') || this.playBuffer('win')) return; this.beep(660,0.16,'square',0.06); setTimeout(()=>this.beep(880,0.14,'square',0.055),130); setTimeout(()=>this.beep(1320,0.12,'sine',0.05),260); },
    jackpot(){ if(this.playBuffer('jackpot') || this.playBuffer('bigWin') || this.playBuffer('win')) return; [880,1175,1568].forEach((f,ix)=>setTimeout(()=>this.beep(f,0.18,'square',0.07), ix*140)); },
    error(){ if(this.playBuffer('error')) return; this.beep(220,0.14,'sawtooth',0.07); setTimeout(()=>this.beep(180,0.12,'square',0.06),80); setTimeout(()=>this.beep(140,0.18,'sawtooth',0.07),160); },
    ok(){ this.beep(540,0.10,'sine',0.06); setTimeout(()=>this.beep(760,0.10,'triangle',0.05),120); },

    // Back-compat wrappers
    spin(){ this.spinStart(); },
    win(){ this.winSmall(); },
  };

  // -------------------- RFID overlay --------------------
  function showRFIDOverlay(){
    document.body.classList.add('rfid-wait');
    const ov = document.getElementById('rfidOverlay');
    ov?.classList.add('show');
    ov?.setAttribute('aria-hidden','false');
  }
  function hideRFIDOverlay(){
    const ov = document.getElementById('rfidOverlay');
    ov?.classList.remove('show');
    ov?.setAttribute('aria-hidden','true');
    document.body.classList.remove('rfid-wait');
  }
  function onBadgeDetected(){
    if(state.rfidReady) return;
    state.rfidReady = true;
    hideRFIDOverlay();
    // Ne pas afficher automatiquement les contrôles : ils restent masqués tant qu'on ne les active pas
    $('.machine')?.classList.add('shake');
    setTimeout(()=>$('.machine')?.classList.remove('shake'), 700);
    try{ Sound.ok(); Sound.ambientPlay(); }catch{}
    devLog("Badge RFID détecté — UI masquée (Shift+W pour panel, UI via bouton 'UI on/off')");
  }

  // -------------------- Theme index & loading --------------------
  async function loadThemeIndex(){
    const url = 'assets/themes/index.json';
    try{
      const res = await fetch(url, { cache: 'no-store' });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (Array.isArray(json.themes) ? json.themes : []);
      state.themeIndex = list.filter(t=>t && t.id).map(t=>({ id:t.id, name:t.name||t.id }));
    }catch(err){
      devLog(`Index thèmes: fallback (${err.message||err})`);
      state.themeIndex = [
        {id:'island-fortune', name:'Island Fortune'},
        {id:'tiki', name:'Tiki Island'},
        {id:'west', name:'Wild West'},
        {id:'egypt', name:'Golden Sands'},
      ];
    }
    DEV.refresh();
  }
  function getThemeList(){
    return state.themeIndex?.length ? state.themeIndex : [
      {id:'island-fortune', name:'Island Fortune'},
      {id:'tiki', name:'Tiki Island'},
      {id:'west', name:'Wild West'},
      {id:'egypt', name:'Golden Sands'},
    ];
  }
  function normalizeLegacyTheme(raw){
    const t = { ...raw };
    if(!t.ui) t.ui = {};
    if(!t.ui.background && t.background){
      const b = t.background;
      if(b.type==='image' && b.url) t.ui.background = { image: b.url };
      else if(typeof b.css==='string') t.ui.background = { gradient: b.css };
    }
    if(t.palette){
      if(!t.ui.accent && t.palette.accent) t.ui.accent = t.palette.accent;
      if(!t.ui.accent2 && t.palette.accent2) t.ui.accent2 = t.palette.accent2;
    }
    if(t.symbols && !Array.isArray(t.symbols)){
      t.symbolsType = t.symbolsType || 'image';
      t.symbols = Object.values(t.symbols);
    }
    return t;
  }
  async function loadTheme(id){
    const base = `assets/themes/${id}`;
    let t;
    try{
      const res = await fetch(`${base}/theme.json`);
      t = await res.json();
      t = normalizeLegacyTheme(t);
      t.basePath = base;
    }catch(e){
      devLog(`Theme "${id}" erreur, fallback 'tiki'`);
      if(id!=='tiki') return loadTheme('tiki');
      t = {};
    }
    applyTheme(t, id);
  }
  function applyTheme(theme={}, id='tiki'){
    state.activeTheme = id;
    state.themeBasePath = theme.basePath || '';

    // Background
    const bg = theme?.ui?.background;
    if(bg?.image){
      document.body.style.background = `center / cover no-repeat url('${theme.basePath}/${bg.image}')`;
    }else if(bg?.gradient){
      document.body.style.background = bg.gradient;
    }else if(bg?.color){
      document.body.style.background = bg.color;
    }else{
      document.body.style.background = '';
    }

    // HUD variables
    const hud = theme?.ui?.hud || {};
    setCSSVar('--hud-bg', hud.bg);
    setCSSVar('--hud-border', hud.border);
    setCSSVar('--hud-blur', hud.blur!=null ? `${hud.blur}px` : null);
    setCSSVar('--hud-text', hud.text);
    setCSSVar('--hud-label', hud.label);
    setCSSVar('--hud-accent', hud.accent);

    // Font
    const font = hud.font;
    if(font?.files?.length){
      const faceCSS = font.files.map(f => `
@font-face{
  font-family:${font.family};
  src:url('${theme.basePath}/${f.src}') format('woff2');
  font-weight:${f.weight||'400'};
  font-style:${f.style||'normal'};
  font-display:swap;
}`).join('\n');
      const styleEl = document.createElement('style');
      styleEl.dataset.font = 'hud';
      styleEl.textContent = faceCSS;
      document.querySelectorAll('style[data-font="hud"]').forEach(n=>n.remove());
      document.head.appendChild(styleEl);
      setCSSVar('--hud-font', font.family);
    }else if(font?.family){
      setCSSVar('--hud-font', font.family);
    }else{
      setCSSVar('--hud-font', 'inherit');
    }

    // Glass & accents
    const glass = theme?.ui?.glass || {};
    if(glass.blur!=null) setCSSVar('--reels-blur', `${glass.blur}px`);
    if(glass.tint!=null) setCSSVar('--reels-tint', glass.tint);
    if(theme?.ui?.accent) setCSSVar('--accent', theme.ui.accent);
    if(theme?.ui?.accent2) setCSSVar('--accent-2', theme.ui.accent2);

    // Symbols
    if(Array.isArray(theme.symbols) && theme.symbols.length){
      state.symbols = theme.symbols.slice();
    }else{
      state.symbols = ['🍒','🍋','🔔','⭐','7️⃣','☘️','💎','🃏'];
    }
    state.symbolType = theme.symbolsType || 'emoji';

    // Load theme audio (optional); falls back to synth beeps
    Sound.loadThemeAudio(theme).catch(()=>{});

    // Rebuild reels & refresh dev panel options
    buildReels();
    DEV.refresh();
  }

  // -------------------- Reels build & helpers --------------------
  function ensureReelsHost(){
    if(!$('#reels')){
      let host = $('.machine');
      if(!host){
        let stage = $('.stage');
        if(!stage){ stage = document.createElement('div'); stage.className = 'stage'; document.body.appendChild(stage); }
        host = document.createElement('div'); host.className = 'machine'; stage.appendChild(host);
      }
      const r = document.createElement('div'); r.id='reels'; r.className='reels'; host.appendChild(r);
    }
    reelsEl = $('#reels');
  }
  function buildReels(){
    ensureReelsHost();
    if(!reelsEl){ devLog('#reels introuvable'); return; }
    reelsEl.innerHTML = '';
    for(let i=0;i<state.columns;i++){
      const reel = document.createElement('div'); reel.className='reel'; reel.dataset.index=String(i);
      const inner = document.createElement('div'); inner.className='reel-inner';
      const s1 = createSymbolEl(randomSymbol(), state.symbolType);
      const s2 = createSymbolEl(randomSymbol(), state.symbolType);
      const s3 = createSymbolEl(randomSymbol(), state.symbolType);
      inner.appendChild(s1); inner.appendChild(s2); inner.appendChild(s3);
      state.currentMiddle[i] = s2.dataset.key;
      reel.appendChild(inner); reelsEl.appendChild(reel);
    }
    updateHoldUI();
  }
  function createSymbolEl(sym, type='emoji'){
    const wrap = document.createElement('div');
    wrap.className = 'symbol' + (type==='emoji' ? ' emoji' : '');
    wrap.dataset.key = sym;
    if(type==='emoji'){
      const span = document.createElement('span'); span.textContent = sym; wrap.appendChild(span);
    }else{
      const img = document.createElement('img'); img.alt = sym; let src = sym;
      if(!/^https?:|^\/|^data:/.test(src)) src = (state.themeBasePath ? state.themeBasePath + '/' : '') + src;
      img.src = src; wrap.appendChild(img);
    }
    return wrap;
  }
  function randomSymbol(){ const a = state.symbols; return a[Math.floor(Math.random()*a.length)]; }
  function getFinalSymbol(pos){
    if(state.forcedSymbols.length > pos && state.forcedSymbols[pos] !== null){ return state.forcedSymbols[pos]; }
    if(state.forceWinCount > 0 && pos < state.forceWinCount){
      if(pos===0){ const s = randomSymbol(); state._tempWinSymbol = s; return s; }
      return state._tempWinSymbol;
    }
    return randomSymbol();
  }
  function getSymbolH(){
    const live = reelsEl?.querySelector('.symbol');
    if(live){ const h = live.getBoundingClientRect().height; if(Number.isFinite(h) && h>0) return h; }
    const tmp = document.createElement('div'); tmp.className='symbol'; tmp.style.position='absolute'; tmp.style.visibility='hidden'; tmp.style.height='var(--symbol-size)';
    document.body.appendChild(tmp); const h2 = tmp.getBoundingClientRect().height || 150; tmp.remove(); return h2;
  }

  // -------------------- Spin logic --------------------
  function startSpin(){
    // If a lose overlay is visible, first press just dismisses it (no spin)
    if(state.loseOverlayActive){ hideLoseMessage(); return; }
    if(!state.rfidReady){ devLog("En attente d'un badge RFID… (B pour simuler)"); try{Sound.error();}catch{} showRFIDOverlay(); return; }
    if(state.spinning) return;
    if(state.credits < state.bet){ Sound.error(); return; }

    state.spinning = true; state.win = 0; updateHUD(); Sound.spinStart();
    state.credits -= state.bet; updateHUD();

    let symbolH = getSymbolH(); if(!Number.isFinite(symbolH) || symbolH<=0) symbolH = 150;
    const finalMiddles = new Array(state.columns); let pending = 0;

    for(let i=0; i<state.columns; i++){
      const reel = reelsEl.children[i];
      if(state.holds.has(i)){ finalMiddles[i] = state.currentMiddle[i]; continue; }
      const inner = reel.querySelector('.reel-inner');
      const finalMid = getFinalSymbol(i); finalMiddles[i] = finalMid;

      // Add 15 new symbols on top, slide down to stop
      const newSymbols = []; for(let k=0;k<15;k++){ newSymbols.push(createSymbolEl(randomSymbol(), state.symbolType)); }
      newSymbols.reverse().forEach(el => inner.insertBefore(el, inner.firstChild));
      inner.style.transition='none'; inner.style.transform = `translate3d(0, ${-15*symbolH}px, 0)`;
      inner.children[15+1].replaceWith(createSymbolEl(finalMid, state.symbolType));

      pending++; reel.classList.add('spinning'); reelsEl.classList.add('spinning-active');
      const duration = 2.5 + i*0.4;
      setTimeout(()=>{
        inner.style.transition = `transform ${duration}s cubic-bezier(0.25,0.46,0.45,0.94)`;
        inner.style.transform = 'translate3d(0,0,0)';
        setTimeout(()=>{
          try{ Sound.reelStop(i); }catch{}
          reel.classList.remove('spinning'); pending--;
          if(pending===0){ reelsEl.classList.remove('spinning-active'); onSpinEnd(finalMiddles); }
        }, duration*1000);
      }, i*100);
    }
    if(pending===0) onSpinEnd(finalMiddles);
  }
  function onSpinEnd(finalMiddles){
    for(let i=0;i<state.columns;i++) state.currentMiddle[i] = finalMiddles[i];
    state.forcedSymbols = []; state.forceWinCount = 0; state._tempWinSymbol = null;

    const res = calcWin(finalMiddles); state.win = res.amount;
    const machine = $('.machine'); const reels = $('.reels');

    if(state.win>0){
      state.credits += state.win; 
      // choose win sound variant
      const big = state.win >= state.bet*10 && state.win < state.bet*20;
      const jack = state.win >= state.bet*20;
      try{ jack ? Sound.jackpot() : (big ? Sound.winBig() : Sound.winSmall()); }catch{}
      highlightWin(finalMiddles, res); state.holdMode=false; state.holds.clear();
      machine?.classList.add('victory');
      if(state.win >= state.bet*20) reels?.classList.add('jackpot','big-win'); else if(state.win >= state.bet*10) reels?.classList.add('big-win');
      setTimeout(()=>{ machine?.classList.remove('victory'); reels?.classList.remove('jackpot','big-win'); document.querySelectorAll('.symbol.mega-win').forEach(s=>s.classList.remove('mega-win')); }, 2500);
    }else{
      state.holdMode = true; state.holds.clear(); machine?.classList.add('defeat'); reels?.classList.add('defeat');
      setTimeout(()=>{ for(let i=0;i<state.columns;i++){ const reel = reelsEl.children[i]; const inner = reel.querySelector('.reel-inner'); const symbol = inner.children[inner.children.length-2]; symbol.classList.add('lose-fade'); } }, 300);
      // Show encouragement message overlay
      showLoseMessage();
      setTimeout(()=>{ machine?.classList.remove('defeat'); reels?.classList.remove('defeat'); document.querySelectorAll('.symbol.lose-fade').forEach(s=>s.classList.remove('lose-fade')); }, 2000);
    }
    updateHoldUI(); updateHUD(); state.spinning = false;
  }
  function calcWin(m){
    let best = { len:1, symbol:m[0], end:0 }; let cur=1;
    for(let i=1;i<m.length;i++){
      if(m[i]===m[i-1]){ cur++; if(cur>best.len) best={len:cur, symbol:m[i], end:i}; }
      else cur=1;
    }
    let mult = 0; if(best.len>=5) mult=20; else if(best.len===4) mult=10; else if(best.len===3) mult=5;
    const amount = state.bet * mult; const start = best.end - best.len + 1; return { amount, len:best.len, start, end:best.end, symbol:best.symbol };
  }
  function highlightWin(_m, info){
    document.querySelectorAll('.symbol.win-highlight').forEach(n=>n.classList.remove('win-highlight'));
    document.querySelectorAll('.win-particles').forEach(n=>n.remove());
    if(info.amount<=0 || info.len<3) return;
    for(let c=info.start;c<=info.end;c++){
      const reel = reelsEl.children[c]; const inner = reel.querySelector('.reel-inner'); const el = inner.children[inner.children.length-2];
      el.classList.add('win-highlight'); createWinParticles(reel);
    }
  }
  function createWinParticles(reel){
    const particles = document.createElement('div'); particles.className='win-particles'; reel.appendChild(particles);
    for(let i=0;i<12;i++){
      setTimeout(()=>{ const p = document.createElement('div'); p.className='particle'; p.style.left = Math.random()*100+'%'; p.style.top = (Math.random()*80+20)+'%'; particles.appendChild(p); setTimeout(()=>{ p.remove(); }, 2500); }, i*100);
    }
    setTimeout(()=>{ particles.remove(); }, 4000);
  }

  // -------------------- Lose message overlay --------------------
  function showLoseMessage(){
    // remove existing first
    hideLoseMessage();
    const messages = [
      "Presque ! Tentez votre chance à nouveau !",
      "La chance tourne... Relancez !",
      "Prochain tour sera le bon !",
      "Ne lâchez rien ! Rejouez !",
      "Votre victoire vous attend !",
      "Un autre essai pour le jackpot !",
      "La fortune sourit aux audacieux !",
    ];
    const msg = messages[Math.floor(Math.random()*messages.length)];

    const overlay = document.createElement('div');
    overlay.className = 'lose-message-overlay';
    overlay.innerHTML = `
      <div class="lose-message">
        <div class="lose-icon">😔</div>
        <div class="lose-text">${msg}</div>
        <div class="lose-hint">Appuyez sur START ou ESPACE pour fermer</div>
      </div>
    `;
    document.body.appendChild(overlay);

    state.loseOverlayActive = true;

    const closeMessage = () => {
      if(state.loseKeyHandler){ document.removeEventListener('keydown', state.loseKeyHandler); state.loseKeyHandler = null; }
      hideLoseMessage();
    };
    const keyHandler = (e) => {
      if(e.key === ' ' || e.key === 'Escape'){
        e.preventDefault();
        closeMessage();
      }
    };
    state.loseKeyHandler = keyHandler;

    overlay.addEventListener('click', closeMessage);
    document.addEventListener('keydown', keyHandler);

    // Auto dismiss after 2 seconds
    state.loseOverlayTimerId = setTimeout(closeMessage, 2000);

    // animate in
    setTimeout(()=> overlay.classList.add('show'), 50);
  }
  function hideLoseMessage(){
    if(state.loseOverlayTimerId){ clearTimeout(state.loseOverlayTimerId); state.loseOverlayTimerId = null; }
    if(state.loseKeyHandler){ document.removeEventListener('keydown', state.loseKeyHandler); state.loseKeyHandler = null; }
    const existing = document.querySelector('.lose-message-overlay');
    if(existing){
      existing.classList.remove('show');
      setTimeout(()=>{ existing.remove(); }, 300);
    }
    state.loseOverlayActive = false;
  }

  // -------------------- Holds --------------------
  function toggleHold(i){ if(!state.holdMode) return; if(state.holds.has(i)) state.holds.delete(i); else{ if(state.holds.size>=state.maxHolds) return; state.holds.add(i);} updateHoldUI(); }
  function updateHoldUI(){
    if(!reelsEl) return;
    for(let i=0;i<state.columns;i++){ const reel = reelsEl.children[i]; reel?.classList.toggle('held', state.holds.has(i)); }
    holdBtns.forEach(btn => { const i = parseInt(btn.dataset.hold,10); btn.classList.toggle('active', state.holds.has(i)); btn.disabled = !state.holdMode; });
  }

  // -------------------- HUD --------------------
  function updateHUD(){ if(creditEl) creditEl.textContent = state.credits; if(betEl) betEl.textContent = state.bet; if(winEl) winEl.textContent = state.win; }

  // -------------------- Dev panel --------------------
  function renderThemeOptionsHTML(){ return getThemeList().map(t=>`<option value="${t.id}">${t.name}</option>`).join(''); }
  function refreshDevPanelOptions(){ const sel = $('#devTheme'); if(!sel) return; const prev = sel.value || state.activeTheme; sel.innerHTML = renderThemeOptionsHTML(); sel.value = getThemeList().some(t=>t.id===prev) ? prev : state.activeTheme; }
  function populateSymbolSelectors(panel){
    const container = panel?.querySelector('#devManualSymbols'); if(!container) return;
    const options = ['<option value="">Auto</option>'].concat(state.symbols.map(s=>`<option value="${s}">${s}</option>`)).join('');
    for(let i=0;i<5;i++){ const sel = panel.querySelector(`#devSymbol${i}`); if(sel){ const prev = sel.value; sel.innerHTML = options; sel.value = prev || ''; } }
  }
  function devLog(msg){ const p = $('#devPanel'); const box = p?.querySelector('.dev-msg'); if(box){ const line = document.createElement('div'); line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`; box.appendChild(line); box.scrollTop = box.scrollHeight; } else { console.log('[DEV]', msg); } }
  window.addEventListener('error', e => devLog(`Erreur: ${e.message}`));
  window.addEventListener('unhandledrejection', e => devLog(`Rejection: ${e.reason?.message || e.reason}`));

  const DEV = (()=>{
    function ensureDevPanel(){
      let p = $('#devPanel');
      if(!p){ p = document.createElement('div'); p.id='devPanel'; p.className='dev-panel hidden'; document.body.appendChild(p); }
      if(!p.dataset.mounted || p.children.length===0){
        p.innerHTML = `
          <div class="dev-row">
            <label>Thème</label>
            <select id="devTheme">${renderThemeOptionsHTML()}</select>
          </div>
          <div class="dev-row">
            <button id="devImm" class="btn small">Immersive</button>
            <button id="devUI"  class="btn small">UI on/off</button>
            <button id="devFS"  class="btn small">Fullscreen</button>
            <button id="devSpin" class="btn small primary">Lancer</button>
          </div>
          <div class="dev-row">
            <label>Forcer victoire:</label>
            <select id="devForceWin">
              <option value="0">Désactivé</option>
              <option value="3">3 symboles</option>
              <option value="4">4 symboles</option>
              <option value="5">5 symboles (Jackpot)</option>
            </select>
            <button id="devClearForce" class="btn small">Clear</button>
          </div>
          <div class="dev-row">
            <label>Symboles manuels:</label>
            <div id="devManualSymbols">
              <select id="devSymbol0" class="symbol-select"><option value="">Auto</option></select>
              <select id="devSymbol1" class="symbol-select"><option value="">Auto</option></select>
              <select id="devSymbol2" class="symbol-select"><option value="">Auto</option></select>
              <select id="devSymbol3" class="symbol-select"><option value="">Auto</option></select>
              <select id="devSymbol4" class="symbol-select"><option value="">Auto</option></select>
            </div>
          </div>
          <div class="dev-msg" style="max-height:160px; overflow:auto;"></div>
        `;
        p.dataset.mounted = '1';
        const $l = s => p.querySelector(s);
        $l('#devTheme').value = state.activeTheme;
        $l('#devTheme').addEventListener('change', e => UI.setTheme(e.target.value));
        $l('#devImm').addEventListener('click', () => UI.immersiveToggle());
        $l('#devUI').addEventListener('click', () => UI.toggleControls());
        $l('#devFS').addEventListener('click', () => { if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(()=>{}); });
        $l('#devSpin').addEventListener('click', () => startSpin());
        $l('#devForceWin').addEventListener('change', e => { state.forceWinCount = parseInt(e.target.value,10)||0; if(state.forceWinCount>0) devLog(`Forçage: ${state.forceWinCount} symboles`); });
        $l('#devClearForce').addEventListener('click', () => { state.forcedSymbols = []; state.forceWinCount = 0; $l('#devForceWin').value='0'; for(let i=0;i<5;i++){ $l(`#devSymbol${i}`).value=''; } devLog('Forçage désactivé'); });
        for(let i=0;i<5;i++){
          $l(`#devSymbol${i}`).addEventListener('change', e => { if(!state.forcedSymbols.length) state.forcedSymbols = new Array(5).fill(null); const v = e.target.value; state.forcedSymbols[i] = v ? v : null; devLog(`Position ${i+1}: ${v || 'auto'}`); });
        }
        populateSymbolSelectors(p);
      }
      return p;
    }
    function refresh(){ refreshDevPanelOptions(); populateSymbolSelectors($('#devPanel')); }
    return { ensureDevPanel, refresh };
  })();

  // -------------------- UI helpers --------------------
  const UI = {
    setTheme(id){ loadTheme(id); },
    toggleControls(){ document.body.classList.toggle('ui-hidden'); updateHoldUI(); },
    showControls(){ document.body.classList.remove('ui-hidden'); updateHoldUI(); },
    hideControls(){ document.body.classList.add('ui-hidden'); updateHoldUI(); },
    immersiveToggle(){
      const isImmersive = document.body.classList.toggle('immersive');
      const sb = $('#spinBtn');
      if(isImmersive){ sb?.classList.remove('btn','small'); sb?.classList.add('primary'); }
      else{ sb?.classList.remove('primary'); sb?.classList.add('btn','small'); }
      devLog('Mode immersive: ' + (isImmersive ? 'activé' : 'désactivé'));
    },
  };

  // -------------------- Events --------------------
  function attachEvents(){
    // Buttons
    spinBtn?.addEventListener('click', startSpin);
    spinBtn?.addEventListener('pointerdown', () => { try{ Sound.uiClick(); }catch{} });
    holdBtns.forEach(btn => {
      btn.addEventListener('click', () => toggleHold(parseInt(btn.dataset.hold,10)));
      btn.addEventListener('pointerdown', () => { try{ Sound.uiClick(); }catch{} });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      // Toggle Dev Panel with Shift+W (and keep Shift+D for compatibility)
      if(e.shiftKey && (k==='w' || k==='d')){
        e.preventDefault();
        const p = DEV.ensureDevPanel();
        p.classList.toggle('show');
        if(p.classList.contains('show')) p.classList.remove('hidden');
        return;
      }
      if(k==='b'){ e.preventDefault(); onBadgeDetected(); return; }
      if(k==='m'){ e.preventDefault(); const m = Sound.toggleMute(); devLog('Audio ' + (m ? 'coupé' : 'actif')); return; }
      const map = { 's':0,'d':1,'f':2,'g':3,'h':4 };
      if(!state.rfidReady){ return; }
      if(k===' '){
        e.preventDefault();
        // If lose overlay is visible, close it but do not spin
        if(state.loseOverlayActive){ hideLoseMessage(); return; }
        startSpin();
      }
      else if(map[k]!==undefined){ e.preventDefault(); toggleHold(map[k]); }
    });
  }

  // -------------------- Startup --------------------
  async function boot(){
    // Cache DOM
    reelsEl = $('#reels');
    spinBtn = $('#spinBtn');
    creditEl = $('#creditValue');
    betEl = $('#betValue');
    winEl = $('#winValue');
    holdBtns = Array.from(document.querySelectorAll('.hold-btn'));

    updateHUD();
    DEV.ensureDevPanel();

    await loadThemeIndex();
    await loadTheme(state.activeTheme);

    // RFID wait at startup
    UI.hideControls();
    showRFIDOverlay();
    devLog('Attente badge RFID — appuyez sur B pour simuler.');
  }

  window.addEventListener('load', () => { boot(); attachEvents(); });
})();