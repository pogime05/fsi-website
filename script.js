/* ── Splash screen ── */
const splash = document.getElementById('splash');
document.body.style.overflow = 'hidden';
setTimeout(() => {
  document.body.style.overflow = '';
  splash.classList.add('is-leaving');
  splash.addEventListener('animationend', () => splash.remove(), { once: true });
}, 2700);

/* ── Header elevation ── */
const header = document.querySelector('[data-elevate]');
const updateHeader = () => {
  header.classList.toggle('is-elevated', window.scrollY > 24);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ── Hamburger menu ── */
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

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
    navToggle.setAttribute('aria-label', 'Open navigation');
  });
});

/* ── Scroll entrance animations (CSS-driven, no library) ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });
document.querySelectorAll('.animate').forEach(el => observer.observe(el));

/* ── Training — Motion One powered ── */
// motion.umd.js exports window.Motion = { animate, stagger, inView, ... }
const motionLoaded = typeof window.Motion !== 'undefined';

if (motionLoaded) {
  const { animate, stagger, inView } = window.Motion;

  const catCards   = document.querySelectorAll('.cat-card');
  const panelLabel = document.getElementById('course-panel-label');
  const labelMap   = {
    operations: 'Operations — 17 courses',
    personnel:  'Personnel — 22 courses',
    safety:     'Safety — 28 courses',
  };

  // Set initial hidden state via JS only (not CSS — so content is always visible if JS fails)
  catCards.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(48px)';
  });
  document.querySelectorAll('#panel-operations .course-pill').forEach(el => {
    el.style.opacity = '0';
  });

  // Stagger category cards in as section scrolls into view
  inView('.cat-grid', () => {
    animate(catCards, { opacity: [0, 1], y: [48, 0] }, {
      delay: stagger(0.13),
      duration: 0.65,
      easing: [0.22, 1, 0.36, 1],
    });
  }, { amount: 0.2 });

  // Animate number counters up (0 → 17 / 22 / 28)
  inView('.cat-grid', () => {
    document.querySelectorAll('.cat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      animate(0, target, {
        duration: 1.4,
        easing: [0.22, 1, 0.36, 1],
        onUpdate: v => { el.textContent = Math.round(v); },
      });
    });
  }, { amount: 0.3 });

  // Stagger-in active course pills when course panel scrolls into view
  inView('.course-panel', () => {
    const pills = document.querySelectorAll('.training-panel.active .course-pill');
    animate(pills, { opacity: [0, 1], y: [22, 0], scale: [0.94, 1] }, {
      delay: stagger(0.028),
      duration: 0.45,
      easing: [0.22, 1, 0.36, 1],
    });
  }, { amount: 0.15 });

  // Category card click — animated panel switch
  catCards.forEach(card => {
    card.addEventListener('click', () => {
      const tab = card.dataset.tab;
      if (card.classList.contains('active')) return;

      // Update active card state
      catCards.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');
      panelLabel.textContent = labelMap[tab];

      // Get current + next panels
      const current  = document.querySelector('.training-panel.active');
      const next     = document.getElementById(`panel-${tab}`);
      const oldPills = current.querySelectorAll('.course-pill');
      const newPills = next.querySelectorAll('.course-pill');

      // Exit old pills with fast stagger
      const exitDuration = 0.22;
      const totalExitMs  = (exitDuration + (oldPills.length - 1) * 0.018) * 1000 + 20;

      animate(oldPills, { opacity: 0, y: -14, scale: 0.92 }, {
        delay: stagger(0.018),
        duration: exitDuration,
        easing: 'ease-in',
      });

      // After exit completes: swap panels + stagger new pills in
      setTimeout(() => {
        current.classList.remove('active'); current.hidden = true;
        next.classList.add('active');       next.hidden = false;

        animate(newPills, { opacity: [0, 1], y: [22, 0], scale: [0.94, 1] }, {
          delay: stagger(0.028),
          duration: 0.48,
          easing: [0.22, 1, 0.36, 1],
        });
      }, totalExitMs);
    });
  });

} else {
  // Motion One didn't load — wire up plain tab switching with no animation
  console.warn('Motion One not loaded — using plain tab switching.');
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const tab = card.dataset.tab;
      document.querySelectorAll('.cat-card').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      card.classList.add('active'); card.setAttribute('aria-pressed', 'true');
      document.getElementById('course-panel-label').textContent =
        { operations: 'Operations — 17 courses', personnel: 'Personnel — 22 courses', safety: 'Safety — 28 courses' }[tab];
      document.querySelectorAll('.training-panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });
      const next = document.getElementById(`panel-${tab}`);
      next.classList.add('active'); next.hidden = false;
    });
  });
}

/* ── Contact form — Formspree ── */
// Replace YOUR_FORM_ID in the form action with your Formspree form ID.
// Sign up free at formspree.io → New Form → copy the ID (e.g. xrgvkpqz).
const form = document.querySelector('.contact-form');
const note = form.querySelector('.form-note');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  note.textContent = '';
  note.className = 'form-note';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      note.textContent = 'Request sent — the FSI team will be in touch shortly.';
      note.classList.add('success');
      form.reset();
    } else {
      note.textContent = 'Something went wrong. Please call us at 905.458.0800.';
      note.classList.add('error');
    }
  } catch {
    note.textContent = 'Unable to send. Please call us directly at 905.458.0800.';
    note.classList.add('error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send request';
  }
});
