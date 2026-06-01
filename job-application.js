/* === Scroll Reveal === */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* === Hero Entrance === */
document.querySelector('.hero').classList.add('entered');

// Job Application Agent Terminal Animation
(function() {
  'use strict';

  const terminalBody = document.getElementById('terminalBody');
  const LOOP_DELAY = 4000;
  const CHAR_DELAY = 30;
  const LINE_DELAY = 300;

  const terminalLines = [
    { type: 'cmd', text: '$ /autoapply --url "https://jobs.greenhouse.io/acme/apply/senior-engineer"' },
    { type: 'out', text: '' },
    { type: 'out', text: '[Step 1: Form Discovery]' },
    { type: 'out', text: '  Navigating to application page...' },
    { type: 'out', text: '  Scanning form structure...' },
    { type: 'out', text: '  Found 18 fields across 3 pages.' },
    { type: 'out', text: '' },
    { type: 'out', text: '[Step 2: Profile Match]' },
    { type: 'out', text: '  Loading profile: alex-johnson.json' },
    { type: 'out', text: '  first_name       \u2192 "Alex"' },
    { type: 'out', text: '  last_name        \u2192 "Johnson"' },
    { type: 'out', text: '  email            \u2192 "alex@example.com"' },
    { type: 'out', text: '  phone            \u2192 "+1 (808) 555-0142"' },
    { type: 'out', text: '  linkedin_url     \u2192 "linkedin.com/in/alexjohnson"' },
    { type: 'out', text: '  resume           \u2192 alex-johnson-resume.pdf' },
    { type: 'out', text: '  work_authorized  \u2192 "Yes"' },
    { type: 'out', text: '  18/18 fields matched.' },
    { type: 'out', text: '' },
    { type: 'out', text: '[Step 3: Review]' },
    { type: 'out', text: '  Preview written to: preview-acme-senior-engineer.md' },
    { type: 'out', text: '  Open file to review before submitting.' },
    { type: 'out', text: '' },
    { type: 'summary', text: '  \u2713 Ready. Awaiting confirmation.' },
    { type: 'out', text: '' },
    { type: 'out', text: '[Step 4: Submit]' },
    { type: 'pass', text: '  \u2713 Application submitted.' },
    { type: 'pass', text: '  \u2713 Confirmation email received: #GH-294871' },
    { type: 'pass', text: '  \u2713 Logged to applications.csv' }
  ];

  function createLineElement(type, text) {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${type}`;
    line.textContent = text;
    return line;
  }

  function typewriteLine(lineElement, text) {
    return new Promise((resolve) => {
      let index = 0;
      lineElement.textContent = '';

      function type() {
        if (index < text.length) {
          lineElement.textContent += text[index];
          index++;
          setTimeout(type, CHAR_DELAY);
        } else {
          resolve();
        }
      }

      type();
    });
  }

  async function animateTerminal() {
    terminalBody.innerHTML = '';

    for (const lineData of terminalLines) {
      const lineElement = createLineElement(lineData.type, '');
      terminalBody.appendChild(lineElement);

      if (lineData.type === 'blank') {
        lineElement.textContent = '';
        await new Promise(resolve => setTimeout(resolve, LINE_DELAY / 2));
      } else {
        await typewriteLine(lineElement, lineData.text);
        await new Promise(resolve => setTimeout(resolve, LINE_DELAY));
      }
    }

    await new Promise(resolve => setTimeout(resolve, LOOP_DELAY));
    animateTerminal();
  }

  function init() {
    if (terminalBody) {
      animateTerminal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
