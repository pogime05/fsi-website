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

/* ── Training tabs ── */
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.training-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    // Update buttons
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Update panels
    panels.forEach(p => {
      p.classList.remove('active');
      p.hidden = true;
    });
    const targetPanel = document.getElementById(`panel-${target}`);
    targetPanel.classList.add('active');
    targetPanel.hidden = false;
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
