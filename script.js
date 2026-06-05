/* ── Splash screen ── */
const splash = document.getElementById('splash');

// Lock scroll while splash is visible
document.body.style.overflow = 'hidden';

// After 2.7s trigger the slide-up exit (logo 0.25s + line 0.85s + tagline 1.3s + read time)
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

/* ── Scroll entrance animations ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

// Observe all animate elements — including those already in view on load
document.querySelectorAll('.animate').forEach(el => observer.observe(el));

/* ── Training — Motion One powered ── */
const { animate, stagger, inView } = window.Motion;

const catCards   = document.querySelectorAll('.cat-card');
const panelLabel = document.getElementById('course-panel-label');
const labelMap   = {
  operations: 'Operations — 17 courses',
  personnel:  'Personnel — 22 courses',
  safety:     'Safety — 28 courses',
};

// Animate number counters when the category grid first scrolls into view
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

// Stagger-in course pills when the panel first appears in view
inView('.course-panel', () => {
  const pills = document.querySelectorAll('.training-panel.active .course-pill');
  animate(pills, { opacity: [0, 1], y: [22, 0], scale: [0.94, 1] }, {
    delay: stagger(0.028),
    duration: 0.45,
    easing: [0.22, 1, 0.36, 1],
  });
}, { amount: 0.15 });

// Stagger-in cards on scroll
inView('.cat-grid', () => {
  animate(catCards, { opacity: [0, 1], y: [48, 0] }, {
    delay: stagger(0.13),
    duration: 0.65,
    easing: [0.22, 1, 0.36, 1],
  });
}, { amount: 0.2 });

// Category card switching
catCards.forEach(card => {
  card.addEventListener('click', () => {
    const tab = card.dataset.tab;
    if (card.classList.contains('active')) return;

    // Update card states
    catCards.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
    card.classList.add('active');
    card.setAttribute('aria-pressed', 'true');

    // Update label
    panelLabel.textContent = labelMap[tab];

    // Get current + next panels
    const current = document.querySelector('.training-panel.active');
    const next    = document.getElementById(`panel-${tab}`);
    const oldPills = current.querySelectorAll('.course-pill');
    const newPills = next.querySelectorAll('.course-pill');

    // Exit old pills — fast stagger from first to last
    animate(oldPills, { opacity: 0, y: -14, scale: 0.92 }, {
      delay: stagger(0.018),
      duration: 0.22,
      easing: 'ease-in',
    }).finished.then(() => {
      // Swap panels
      current.classList.remove('active'); current.hidden = true;
      next.classList.add('active');       next.hidden = false;

      // Reset new pills then stagger them in
      animate(newPills, { opacity: 0, y: 22, scale: 0.94 }, { duration: 0 });
      animate(newPills, { opacity: 1, y: 0, scale: 1 }, {
        delay: stagger(0.028),
        duration: 0.48,
        easing: [0.22, 1, 0.36, 1],
      });
    });
  });
});

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
