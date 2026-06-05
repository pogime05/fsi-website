/* ═══════════════════════════════════════
   FSI Freight Solutions — Main Script
   SPA Router + Motion One Animations
═══════════════════════════════════════ */

/* ── 1. SPLASH ── */
(function initSplash() {
  const splash    = document.getElementById('splash');
  const container = document.getElementById('splash-particles');
  document.body.style.overflow = 'hidden';

  // Generate sparkle particles (burst at 1.1s)
  const colors = ['#c90d19','#fff','#ff6b6b','rgba(255,255,255,.6)'];
  for (let i = 0; i < 28; i++) {
    const p   = document.createElement('span');
    p.className = 'splash-particle';
    const angle = (i / 28) * 360 + (Math.random() * 18 - 9);
    const dist  = 90 + Math.random() * 110;
    const size  = 4 + Math.random() * 7;
    p.style.cssText = `
      --tx: ${Math.cos(angle * Math.PI / 180) * dist}px;
      --ty: ${Math.sin(angle * Math.PI / 180) * dist}px;
      width: ${size}px; height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${1.0 + Math.random() * 0.25}s;
    `;
    container.appendChild(p);
  }

  // Exit at 3s
  setTimeout(() => {
    document.body.style.overflow = '';
    splash.classList.add('is-leaving');
    splash.addEventListener('animationend', () => splash.remove(), { once: true });
  }, 3000);
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
setTimeout(animateHero, 3100); // starts just after splash exits

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
    const items = viewEl.querySelectorAll('.startup-list li');
    animate(items, { opacity:[0,1], x:[-30,0] }, { delay:stagger(.07), duration:.55, easing:[.22,1,.36,1] });
    revealSplitWords(viewEl);
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
    const stat = document.querySelector('.about-stat-num');
    if (stat && stat.dataset.count) {
      animate(0, parseInt(stat.dataset.count, 10), {
        duration: 1.4, easing: [.22,1,.36,1],
        onUpdate: v => { stat.textContent = Math.round(v); }
      });
    }
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

/* ── 10. CONTACT FORM ── */
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
