/* ═══════════════════════════════════════
   FSI Freight Solutions — Main Script
   SPA Router + Motion One Animations
═══════════════════════════════════════ */

/* ── 1. SPLASH ── */
(function initSplash() {
  const splash = document.getElementById('splash');
  document.body.style.overflow = 'hidden';

  /* tsParticles — ambient drifting sparkles */
  if (typeof tsParticles !== 'undefined') {
    tsParticles.load('tsparticles-splash', {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: { events: { onClick: { enable: false }, onHover: { enable: false } } },
      particles: {
        number: { value: 90, density: { enable: true, area: 800 } },
        color: { value: ['#ffffff', '#c90d19', '#ff9999', 'rgba(255,255,255,0.5)'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.1, max: 0.9 },
          animation: { enable: true, speed: 1.2, minimumValue: 0.05, sync: false }
        },
        size: { value: { min: 0.4, max: 2.2 } },
        move: {
          enable: true, speed: { min: 0.08, max: 0.55 },
          direction: 'none', random: true, straight: false,
          outModes: { default: 'out' }
        }
      }
    });
  }

  /* ── Micro-glitch: random letter gets a chromatic-aberration jolt ──
     Uses Web Animations API — never conflicts with CSS animations        */
  const slF = document.querySelector('.sl-f');
  const slS = document.querySelector('.sl-s');
  const slI = document.querySelector('.sl-i');
  const glitchTargets = [slF, slS, slI].filter(Boolean);

  function glitchFrames(isRed) {
    // Chromatic aberration direction matches each letter's original travel direction
    const r = isRed
      ? [ 'rgba(255,200,50,.72)', 'rgba(255,40,180,.72)' ]
      : [ 'rgba(255,20,60,.72)',  'rgba(20,110,255,.72)' ];
    return [
      { textShadow: `9px 2px 0 ${r[0]}, -9px -2px 0 ${r[1]}`,  transform: 'skewX(-5deg)' },
      { textShadow: `-9px -2px 0 ${r[0]}, 9px 2px 0 ${r[1]}`,  transform: 'skewX(5deg) translateX(4px)' },
      { textShadow: `5px 0 0 ${r[0].replace('.72','.45')}, -5px 0 0 ${r[1].replace('.72','.45')}`, transform: 'skewX(-2deg)' },
      { textShadow: `2px 0 0 ${r[0].replace('.72','.18')}, -2px 0 0 ${r[1].replace('.72','.18')}`, transform: 'skewX(1deg)' },
      { textShadow: 'none', transform: 'none' },
    ];
  }

  let glitchTimer;
  function scheduleGlitch() {
    glitchTimer = setTimeout(() => {
      if (!document.getElementById('splash')) return;
      const el    = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
      const isRed = el === slI;
      el.animate(glitchFrames(isRed), {
        duration: 280, easing: 'steps(4, jump-none)', fill: 'none',
      });
      scheduleGlitch();
    }, 2000 + Math.random() * 2200);
  }
  /* Start glitch after all letters have fully landed (~1.7s) */
  setTimeout(scheduleGlitch, 2000);

  /* Exit at 4.5s */
  setTimeout(() => {
    clearTimeout(glitchTimer);
    document.body.style.overflow = '';
    splash.classList.add('is-leaving');
    splash.addEventListener('animationend', () => splash.remove(), { once: true });
  }, 4500);
})();

/* ── 2. HEADER ELEVATION ── */
const header = document.querySelector('[data-elevate]');
const updateHeader = () => header.classList.toggle('is-elevated', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ── 3. HAMBURGER MENU ── */
const navToggle = document.querySelector('.nav-toggle');
const nav       = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── 4. VIEW ROUTER ── */
const views    = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('[data-view]');
let   activeViewId = 'home';

function showView(id) {
  if (id === activeViewId) { nav.classList.remove('is-open'); return; }
  activeViewId = id;

  views.forEach(v => v.classList.remove('active'));
  const next = document.getElementById('view-' + id);
  if (!next) return;

  next.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');

  // Update active nav link
  navLinks.forEach(l => l.classList.toggle('nav-active', l.dataset.view === id));

  // Animate content in for the activated view
  animateViewIn(id, next);

  // Hash routing
  history.pushState({ view: id }, '', '#' + id);
}

// All [data-view] elements are clickable
document.addEventListener('click', e => {
  const el = e.target.closest('[data-view]');
  if (!el) return;
  e.preventDefault();
  showView(el.dataset.view);
});

// Browser back/forward
window.addEventListener('popstate', e => {
  const id = (e.state && e.state.view) || 'home';
  showView(id);
});

// Initial hash routing
const initHash = location.hash.slice(1);
if (initHash && document.getElementById('view-' + initHash)) showView(initHash);

/* ── 5. WORD-SPLIT HEADINGS ── */
function splitWords(el) {
  if (el.dataset.split === 'done') return;
  el.dataset.split = 'done';
  // Preserve <br> tags
  const html   = el.innerHTML;
  const parts  = html.split(/(<br\s*\/?>)/gi);
  el.innerHTML = parts.map(part => {
    if (/^<br/i.test(part)) return part;
    return part.split(/(\s+)/).map(token => {
      if (/^\s+$/.test(token)) return ' ';
      return `<span class="word-wrap"><span class="word-inner">${token}</span></span>`;
    }).join('');
  }).join('');
}

document.querySelectorAll('.split-words').forEach(splitWords);

/* ── 6. HERO SEQUENCE (fires after splash exits) ── */
function animateHero() {
  const h1      = document.querySelector('.hero-h1');
  const copy    = document.querySelector('.hero-copy-reveal');
  const actions = document.querySelector('.hero-actions-reveal');
  const tagline = document.querySelector('.hero-tagline-reveal');
  if (!h1) return;

  // Reveal h1 words
  const words = h1.querySelectorAll('.word-inner');
  words.forEach((w, i) => {
    setTimeout(() => w.classList.add('show'), i * 60);
  });

  // Stagger rest
  const lastDelay = words.length * 60;
  setTimeout(() => copy    && copy.classList.add('show'), lastDelay + 100);
  setTimeout(() => actions && actions.classList.add('show'), lastDelay + 250);
  setTimeout(() => tagline && tagline.classList.add('show'), lastDelay + 420);
}
setTimeout(animateHero, 4600); // starts just after splash exits

/* ── 7. ANIMATE VIEW IN (called by router) ── */
function animateViewIn(id, viewEl) {
  if (!window.Motion) return;
  const { animate, stagger, inView } = window.Motion;

  // Split words in this view (if not done yet)
  viewEl.querySelectorAll('.split-words:not([data-split="done"])').forEach(splitWords);

  if (id === 'home') {
    // Trust bar numbers
    document.querySelectorAll('.trust-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      animate(0, target, { duration: 1.2, easing: [.22,1,.36,1],
        onUpdate: v => { el.textContent = Math.round(v); }
      });
    });
    // Teaser cards stagger in
    const cards = viewEl.querySelectorAll('.teaser-card');
    animate(cards, { opacity:[0,1], y:[40,0] }, { delay:stagger(.1), duration:.6, easing:[.22,1,.36,1] });
  }

  if (id === 'services') {
    const cards = viewEl.querySelectorAll('.svc-card');
    animate(cards, { opacity:[0,1], y:[44,0] }, { delay:stagger(.12), duration:.65, easing:[.22,1,.36,1] });
    revealSplitWords(viewEl);
  }

  if (id === 'training') {
    const cats = viewEl.querySelectorAll('.cat-card');
    cats.forEach(el => { el.style.opacity='0'; el.style.transform='translateY(44px)'; });
    setTimeout(() => {
      animate(cats, { opacity:[0,1], y:[44,0] }, { delay:stagger(.13), duration:.65, easing:[.22,1,.36,1] });
    }, 50);
    // number counters
    viewEl.querySelectorAll('.cat-num[data-target]').forEach(el => {
      const t = parseInt(el.dataset.target, 10);
      animate(0, t, { duration:1.3, easing:[.22,1,.36,1], onUpdate: v => { el.textContent = Math.round(v); } });
    });
    // pills stagger
    setTimeout(() => {
      const pills = viewEl.querySelectorAll('.training-panel.active .course-pill');
      animate(pills, { opacity:[0,1], y:[18,0], scale:[.94,1] }, { delay:stagger(.025), duration:.42, easing:[.22,1,.36,1] });
    }, 600);
    revealSplitWords(viewEl);
  }

  if (id === 'startup') {
    revealSplitWords(viewEl);
    // Startup steps animate in via IntersectionObserver (already wired)
    // Re-observe them since we re-show the view
    viewEl.querySelectorAll('.startup-step').forEach((step, i) => {
      step.style.opacity = '0';
      step.style.transform = 'translateX(-24px)';
      step.style.transition = `opacity .55s ease ${i * 0.08}s, transform .55s cubic-bezier(.22,1,.36,1) ${i * 0.08}s`;
    });
    setTimeout(() => {
      viewEl.querySelectorAll('.startup-step').forEach(step => {
        step.style.opacity = '1';
        step.style.transform = 'none';
      });
    }, 150);
  }

  if (id === 'contact') {
    const els = viewEl.querySelectorAll('.contact-list a, label, .contact-form button');
    animate(els, { opacity:[0,1], y:[20,0] }, { delay:stagger(.06), duration:.5, easing:[.22,1,.36,1] });
    revealSplitWords(viewEl);
  }
}

// Reveal split words in a container
function revealSplitWords(container) {
  container.querySelectorAll('.split-words .word-inner').forEach((w, i) => {
    setTimeout(() => w.classList.add('show'), 80 + i * 55);
  });
}

/* ── 8. INVIEW SCROLL ANIMATIONS (home page) ── */
if (window.Motion) {
  const { animate, stagger, inView } = window.Motion;

  // About section
  inView('.about', () => {
    document.querySelectorAll('.about-stat-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      animate(0, target, { duration:1.4, easing:[.22,1,.36,1], onUpdate: v => { el.textContent = Math.round(v); } });
    });
    const copy = document.querySelector('.about-copy');
    if (copy) animate([copy], { opacity:[0,1], y:[30,0] }, { duration:.65, easing:[.22,1,.36,1] });
  }, { amount: .3 });

  // Trust bar numbers (re-runs when user returns to home)
  inView('.trust-bar', () => {
    document.querySelectorAll('.trust-num[data-count]').forEach(el => {
      const t = parseInt(el.dataset.count, 10);
      animate(0, t, { duration:1.2, easing:[.22,1,.36,1], onUpdate: v => { el.textContent = Math.round(v); } });
    });
  }, { amount:.5 });
}

/* ── 9. TRAINING TAB SWITCHING ── */
const catCards   = document.querySelectorAll('.cat-card');
const panelLabel = document.getElementById('course-panel-label');
const labelMap   = {
  operations: 'Operations — 17 courses',
  personnel:  'Personnel — 22 courses',
  safety:     'Safety — 28 courses',
};

catCards.forEach(card => {
  card.addEventListener('click', () => {
    const tab = card.dataset.tab;
    if (card.classList.contains('active')) return;

    catCards.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); });
    card.classList.add('active');
    card.setAttribute('aria-pressed','true');
    if (panelLabel) panelLabel.textContent = labelMap[tab];

    const current  = document.querySelector('.training-panel.active');
    const next     = document.getElementById('panel-' + tab);
    const oldPills = current.querySelectorAll('.course-pill');
    const newPills = next.querySelectorAll('.course-pill');

    if (window.Motion) {
      const { animate, stagger } = window.Motion;
      const exitMs = (0.22 + (oldPills.length - 1) * 0.018) * 1000 + 20;
      animate(oldPills, { opacity:0, y:-14, scale:.92 }, { delay:stagger(.018), duration:.22, easing:'ease-in' });
      setTimeout(() => {
        current.classList.remove('active'); current.hidden = true;
        next.classList.add('active');       next.hidden = false;
        animate(newPills, { opacity:[0,1], y:[20,0], scale:[.94,1] }, { delay:stagger(.026), duration:.46, easing:[.22,1,.36,1] });
      }, exitMs);
    } else {
      current.classList.remove('active'); current.hidden = true;
      next.classList.add('active');       next.hidden = false;
    }
  });
});

/* ── 10. HERO RAIN CANVAS ── */
(function initHeroRain() {
  const canvas = document.getElementById('hero-rain');
  if (!canvas) return;

  // Skip on mobile — saves battery, looks fine without
  if (window.innerWidth < 680) return;

  const ctx  = canvas.getContext('2d');
  const LEAN = 0.17;   // rain angle (radians, slight rightward lean)
  const DENS = 8500;   // px² per drop — lower = denser
  let drops = [], splashes = [], raf = null, running = false;

  /* ── resize ── */
  function resize() {
    const hero = canvas.parentElement;
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    drops = [];
    const n = Math.floor(canvas.width * canvas.height / DENS);
    for (let i = 0; i < n; i++) drops.push(newDrop(true));
  }

  /* ── factories ── */
  function newDrop(scatter) {
    const v = 6 + Math.random() * 10;
    return {
      x:   Math.random() * (canvas.width + 160) - 80,
      y:   scatter ? Math.random() * canvas.height : -14,
      v,
      len: 10 + Math.random() * 20,
      a:   0.08 + Math.random() * 0.26,
      w:   0.35 + Math.random() * 0.65,
    };
  }

  function newSplash(x, y) {
    for (let i = 0; i < 3; i++) {
      splashes.push({
        x, y,
        vx:   (Math.random() - 0.5) * 2.8,
        vy:  -(0.6 + Math.random() * 2.4),
        r:    0.7 + Math.random() * 1.3,
        life: 1,
        dec:  0.05 + Math.random() * 0.055,
      });
    }
  }

  /* ── render loop ── */
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sinL = Math.sin(LEAN), cosL = Math.cos(LEAN);

    // drops
    for (let i = 0, n = drops.length; i < n; i++) {
      const d = drops[i];
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + sinL * d.len, d.y + cosL * d.len);
      ctx.strokeStyle = `rgba(155,185,215,${d.a})`;
      ctx.lineWidth   = d.w;
      ctx.stroke();

      d.y += d.v;
      d.x += d.v * sinL * 0.7;

      const floor = canvas.height * 0.62 + Math.random() * canvas.height * 0.38;
      if (d.y > floor) {
        if (Math.random() > 0.80) newSplash(d.x, d.y);
        drops[i] = newDrop(false);
      }
    }

    // splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0, s.r * s.life), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(155,185,215,${(s.life * 0.32).toFixed(3)})`;
      ctx.fill();
      s.x  += s.vx;
      s.y  += s.vy;
      s.vy += 0.2;   // gravity
      s.life -= s.dec;
      if (s.life <= 0) splashes.splice(i, 1);
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    tick();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ── only run when hero is in viewport ── */
  const hero = canvas.closest('.hero');
  const obs  = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? start() : stop();
  }, { threshold: 0.05 });

  // Delay start until splash has exited (4.6s)
  setTimeout(() => {
    if (hero) obs.observe(hero);
  }, 4700);

  window.addEventListener('resize', () => { if (running) resize(); }, { passive: true });
})();

/* ── 11. CURSOR GLOW ── */
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });

/* ── 12. BACK TO TOP ── */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  const toggleBTT = () => backToTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', toggleBTT, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── 12. HERO SCROLL INDICATOR ── */
const heroScroll = document.getElementById('hero-scroll');
if (heroScroll) {
  window.addEventListener('scroll', () => {
    heroScroll.classList.toggle('hidden', window.scrollY > 80);
  }, { passive: true });
}

/* ── 13. TIMELINE ITEM REVEAL (services view) ── */
const timelineObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const items = e.target.querySelectorAll('.timeline-item');
      items.forEach((item, i) => setTimeout(() => item.classList.add('reveal'), i * 140));
      timelineObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline').forEach(t => timelineObs.observe(t));

/* ── 14. STARTUP STEPS REVEAL ── */
const startupStepObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
      startupStepObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.startup-step').forEach((step, i) => {
  step.style.opacity = '0';
  step.style.transform = 'translateX(-24px)';
  step.style.transition = `opacity .55s ease ${i * 0.1}s, transform .55s cubic-bezier(.22,1,.36,1) ${i * 0.1}s`;
  startupStepObs.observe(step);
});

/* ── 15. ABOUT ROUTE MAP CANVAS ── */
(function initAboutMap() {
  const wrap   = document.querySelector('.about-map-wrap');
  const canvas = document.getElementById('about-map');
  if (!wrap || !canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  /* Virtual coordinate space (map layout) */
  const VW = 600, VH = 430;

  /* Key cities: [name, vx, vy, isHome] */
  const cities = [
    { name:'Brampton, ON', vx:388, vy:168, home:true  },
    { name:'Montréal',     vx:447, vy:143, home:false },
    { name:'Detroit',      vx:354, vy:192, home:false },
    { name:'Chicago',      vx:312, vy:198, home:false },
    { name:'New York',     vx:444, vy:215, home:false },
    { name:'Cleveland',    vx:377, vy:203, home:false },
    { name:'Nashville',    vx:345, vy:295, home:false },
    { name:'Atlanta',      vx:350, vy:328, home:false },
    { name:'Dallas',       vx:236, vy:340, home:false },
    { name:'Miami',        vx:382, vy:408, home:false },
    { name:'Los Angeles',  vx:54,  vy:320, home:false },
    { name:'Minneapolis',  vx:266, vy:152, home:false },
  ];

  /* Routes: bezier control points in virtual space */
  const routes = [
    { from:0, to:1,  cp1:{x:418,y:156}, cp2:{x:447,y:144} }, // Brampton → Montréal
    { from:0, to:2,  cp1:{x:372,y:178}, cp2:{x:356,y:190} }, // Brampton → Detroit
    { from:0, to:4,  cp1:{x:415,y:190}, cp2:{x:442,y:212} }, // Brampton → New York
    { from:0, to:5,  cp1:{x:382,y:182}, cp2:{x:378,y:200} }, // Brampton → Cleveland
    { from:2, to:3,  cp1:{x:332,y:194}, cp2:{x:315,y:197} }, // Detroit → Chicago
    { from:3, to:11, cp1:{x:288,y:175}, cp2:{x:268,y:155} }, // Chicago → Minneapolis
    { from:3, to:7,  cp1:{x:318,y:262}, cp2:{x:340,y:312} }, // Chicago → Atlanta
    { from:4, to:9,  cp1:{x:450,y:338}, cp2:{x:405,y:390} }, // New York → Miami
    { from:7, to:8,  cp1:{x:295,y:335}, cp2:{x:252,y:340} }, // Atlanta → Dallas
    { from:7, to:9,  cp1:{x:364,y:373}, cp2:{x:380,y:398} }, // Atlanta → Miami
    { from:8, to:10, cp1:{x:148,y:330}, cp2:{x:92,  y:322} }, // Dallas → LA
    { from:5, to:6,  cp1:{x:362,y:250}, cp2:{x:348,y:280} }, // Cleveland → Nashville
  ];

  /* Freight movers — one per route, staggered start positions */
  const movers = routes.map((_, i) => ({
    routeIdx: i,
    t: (i / routes.length) + Math.random() * 0.08,
    speed: 0.00062 + Math.random() * 0.00048,
  }));

  let W = 0, H = 0, scale = 1, offX = 0, offY = 0, raf = null;

  function resize() {
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 1 ctx unit = 1 CSS pixel
    scale = Math.min(W / VW, H / VH) * 0.92;
    offX  = (W - VW * scale) / 2;
    offY  = (H - VH * scale) / 2;
  }

  const cx = vx => offX + vx * scale;
  const cy = vy => offY + vy * scale;

  function bezierAt(t, p0, cp1, cp2, p1) {
    const u = 1 - t;
    return {
      x: u*u*u*p0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p1.x,
      y: u*u*u*p0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p1.y,
    };
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    /* — Dot grid background — */
    const sp = 22 * scale, dr = 0.85 * scale;
    ctx.fillStyle = 'rgba(255,255,255,0.052)';
    for (let x = offX % sp; x < W; x += sp)
      for (let y = offY % sp; y < H; y += sp) {
        ctx.beginPath(); ctx.arc(x, y, dr, 0, Math.PI * 2); ctx.fill();
      }

    /* — Route lines (dashed bezier arcs) — */
    routes.forEach(r => {
      const f = cities[r.from], t = cities[r.to];
      ctx.beginPath();
      ctx.moveTo(cx(f.vx), cy(f.vy));
      ctx.bezierCurveTo(cx(r.cp1.x), cy(r.cp1.y), cx(r.cp2.x), cy(r.cp2.y), cx(t.vx), cy(t.vy));
      ctx.setLineDash([3.5 * scale, 10 * scale]);
      ctx.strokeStyle = 'rgba(201,13,25,0.22)';
      ctx.lineWidth = 1.1 * scale;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    /* — Freight movers — */
    movers.forEach(m => {
      m.t += m.speed;
      if (m.t > 1) m.t -= 1;
      const r  = routes[m.routeIdx];
      const f  = cities[r.from], t = cities[r.to];
      const pt = bezierAt(m.t, {x:f.vx,y:f.vy}, r.cp1, r.cp2, {x:t.vx,y:t.vy});
      const px = cx(pt.x), py = cy(pt.y);
      /* Glow aura */
      const grd = ctx.createRadialGradient(px, py, 0, px, py, 8 * scale);
      grd.addColorStop(0, 'rgba(201,13,25,0.75)');
      grd.addColorStop(1, 'rgba(201,13,25,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(px, py, 8 * scale, 0, Math.PI * 2); ctx.fill();
      /* Core dot */
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(px, py, 2.2 * scale, 0, Math.PI * 2); ctx.fill();
    });

    /* — City nodes — */
    cities.forEach((city, i) => {
      const px = cx(city.vx), py = cy(city.vy);
      const p  = (Math.sin(ts * 0.0017 + i * 0.7) + 1) / 2; // per-city phase offset

      if (city.home) {
        /* Brampton home base — triple rings */
        ctx.beginPath();
        ctx.arc(px, py, (10 + p * 12) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,13,25,${(0.22 - p * 0.18).toFixed(3)})`;
        ctx.lineWidth = 1 * scale; ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, (6 + p * 5) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,13,25,${(0.45 - p * 0.2).toFixed(3)})`;
        ctx.lineWidth = 1.2 * scale; ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#c90d19'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.8 * scale; ctx.stroke();

        /* Label */
        ctx.font = `700 ${10.5 * scale}px Inter,sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(city.name, px + 9 * scale, py + 4 * scale);
      } else {
        /* Regular city */
        ctx.beginPath();
        ctx.arc(px, py, (3 + p * 5) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${(0.1 - p * 0.08).toFixed(3)})`;
        ctx.lineWidth = 0.8 * scale; ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 2.8 * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.62)'; ctx.fill();

        /* Label */
        ctx.font = `500 ${8.2 * scale}px Inter,sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.48)';
        ctx.textAlign = 'left';
        ctx.fillText(city.name, px + 6 * scale, py + 3 * scale);
      }
    });

    raf = requestAnimationFrame(draw);
  }

  /* — Pause when out of view (battery / perf) — */
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!raf) raf = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(raf); raf = null;
    }
  }, { threshold: 0.1 });

  resize();
  obs.observe(wrap);
  window.addEventListener('resize', () => { resize(); }, { passive: true });
})();

/* ── 16. CONTACT FORM ── */
const form = document.querySelector('.contact-form');
const note = form ? form.querySelector('.form-note') : null;
if (form && note) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    note.textContent = ''; note.className = 'form-note';
    try {
      const res = await fetch(form.action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
      if (res.ok) { note.textContent = 'Request sent — the FSI team will be in touch shortly.'; note.classList.add('success'); form.reset(); }
      else        { note.textContent = 'Something went wrong. Please call 905.458.0800.'; note.classList.add('error'); }
    } catch { note.textContent = 'Unable to send. Please call 905.458.0800.'; note.classList.add('error'); }
    finally { btn.disabled = false; btn.textContent = 'Send request'; }
  });
}
