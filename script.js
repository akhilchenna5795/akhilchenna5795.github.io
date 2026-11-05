/* Contact form delivery.
 * Messages are sent by FormSubmit (free, no account) to the address below.
 * The FIRST message triggers an activation email from FormSubmit — click its link once
 * and every later message arrives in your inbox. FormSubmit then gives you a random
 * alias you can paste here instead of your email address, if you'd rather hide it.
 */
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/akhilchenna@gmail.com';

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => (Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : a);

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.querySelector('.theme-toggle');
  const setThemeLabel = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  setThemeLabel();
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    setThemeLabel();
  });
  // Follow the system theme while the visitor hasn't picked one
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); setThemeLabel(); }
  });

  /* ---------- Mobile menu ---------- */
  const nav = document.getElementById('top-nav');
  const menuBtn = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Active section in nav ---------- */
  const navLinks = [...links.querySelectorAll('a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => {
    const s = document.querySelector(a.getAttribute('href'));
    if (s) sectionObserver.observe(s);
  });

  /* ---------- Split About text into words ---------- */
  const aboutText = document.querySelector('[data-words]');
  const words = [];
  if (aboutText) {
    const parts = aboutText.textContent.trim().split(/\s+/);
    aboutText.textContent = '';
    parts.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      aboutText.appendChild(span);
      if (i < parts.length - 1) aboutText.appendChild(document.createTextNode(' '));
      words.push(span);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  document.querySelectorAll('.reveal, .project').forEach((el) => revealObserver.observe(el));

  /* ---------- Count-up numbers ---------- */
  const fmt = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);
      const to = parseFloat(el.dataset.to);
      const d = parseInt(el.dataset.decimals || '0', 10);
      if (reduceMotion) { el.textContent = fmt(to, d); return; }
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = clamp((now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * eased, d);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.count').forEach((el) => countObserver.observe(el));

  /* ---------- Hero three-phase waveform ---------- */
  const hero = document.querySelector('.hero');
  const heroInner = document.querySelector('.hero-inner');
  const phases = [...document.querySelectorAll('.waves .ph')];
  const W = 1200, H = 300, N = 180;
  let heroFactor = 1;       // shrinks as the hero scrolls away
  let heroVisible = true;
  const loadStart = performance.now();

  const drawWaves = (now) => {
    const t = now / 1000;
    const envelope = reduceMotion ? 1 : 1 - Math.pow(1 - clamp((now - loadStart - 300) / 1800), 3);
    const amp = H * 0.4 * envelope * heroFactor;
    const cycles = window.innerWidth < 700 ? 1.5 : 2.5;
    const shift = reduceMotion ? 0 : t * 0.9;
    phases.forEach((path, k) => {
      const offset = (k * 2 * Math.PI) / 3;
      let d = '';
      for (let j = 0; j <= N; j++) {
        const x = (j / N) * W;
        const y = H / 2 - amp * Math.sin((2 * Math.PI * cycles * x) / W - shift - offset);
        d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      path.setAttribute('d', d);
    });
  };

  const waveLoop = (now) => {
    if (heroVisible) drawWaves(now);
    if (!reduceMotion) requestAnimationFrame(waveLoop);
  };
  requestAnimationFrame(waveLoop);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  /* ---------- Scroll-linked effects ---------- */
  const progressBar = document.querySelector('.progress span');
  const aboutSection = document.querySelector('.about');
  const timelines = [...document.querySelectorAll('.timeline')];
  const projects = [...document.querySelectorAll('.project')];
  const ribbons = [...document.querySelectorAll('.ribbon-track')];
  const skills = document.querySelector('.skills');
  const stackQuery = window.matchMedia('(min-width: 861px)');

  const update = () => {
    const vh = window.innerHeight;
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - vh;

    progressBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;
    nav.classList.toggle('scrolled', y > 8);

    // Hero: lift, shrink and fade as you scroll past
    const hp = clamp(y / (vh * 0.85));
    heroFactor = 1 - hp * 0.85;
    if (!reduceMotion) {
      heroInner.style.transform = `translate3d(0, ${hp * -70}px, 0) scale(${1 - hp * 0.07})`;
      heroInner.style.opacity = String(1 - hp * 1.1);
    } else {
      drawWaves(performance.now());
    }

    if (reduceMotion) return;

    // About: light words one by one while the paragraph is pinned
    if (aboutSection && words.length) {
      const r = aboutSection.getBoundingClientRect();
      const p = clamp((-r.top + vh * 0.25) / (r.height - vh * 0.75));
      const lit = p * (words.length + 2);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }

    // Experience: current flows down the timeline
    timelines.forEach((tl) => {
      const r = tl.getBoundingClientRect();
      const trigger = vh * 0.6;
      tl.style.setProperty('--fill', clamp((trigger - r.top) / r.height).toFixed(4));
      tl.querySelectorAll('.t-item').forEach((item) => {
        const dot = item.querySelector('.t-dot').getBoundingClientRect();
        item.classList.toggle('lit', dot.top < trigger);
      });
    });

    // Projects: earlier cards recede as the next one stacks on top
    if (stackQuery.matches) {
      projects.forEach((card, i) => {
        const next = projects[i + 1];
        if (!next) { card.style.transform = ''; card.style.setProperty('--dim', 0); return; }
        const cardTop = parseFloat(getComputedStyle(card).top) || 0;
        const dist = next.getBoundingClientRect().top - cardTop;
        const p = clamp(1 - dist / (vh * 0.75));
        card.style.transform = `scale(${1 - p * 0.06})`;
        card.style.setProperty('--dim', p.toFixed(3));
      });
    } else {
      projects.forEach((card) => { card.style.transform = ''; card.style.setProperty('--dim', 0); });
    }

    // Skills ribbon slides sideways with scroll
    if (skills) {
      const r = skills.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const prog = (vh - r.top) * 0.3;
        ribbons.forEach((el) => {
          const dir = parseFloat(el.dataset.dir);
          const x = dir < 0 ? -prog : prog - el.scrollWidth * 0.4;
          el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
        });
      }
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contact-form');
  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const setStatus = (msg, kind) => { statusEl.textContent = msg; statusEl.className = 'form-status ' + (kind || ''); };

  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field && e.target.checkValidity()) field.classList.remove('invalid');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll('.field input, .field textarea').forEach((el) => {
      const ok = el.checkValidity();
      el.closest('.field').classList.toggle('invalid', !ok);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      setStatus(firstBad.type === 'email' && firstBad.value ? 'Enter a valid email address so I can reply.' : 'Fill in your name, email and message to send.', 'err');
      firstBad.focus();
      return;
    }
    if (form._honey.value) return; // bot

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      _subject: `Portfolio message from ${form.name.value.trim()}`,
      _replyto: form.email.value.trim(),
      _template: 'table',
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'Request failed');
      form.reset();
      setStatus('Message sent. Thanks — I’ll reply to your email soon.', 'ok');
    } catch (err) {
      setStatus('Your message didn’t send. Check your connection and try again, or email akhilchenna@gmail.com directly.', 'err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
