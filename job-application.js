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
    { type: 'command', text: '$ /apply --url "https://jobs.example.com/apply/12345"' },
    { type: 'prompt', text: '> Scanning form fields...' },
    { type: 'text', text: '  Found 14 fields: name, email, phone, address,' },
    { type: 'text', text: '  linkedin, github, resume, cover_letter, work_auth...' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Matching profile...' },
    { type: 'success', text: '\u2713 14/14 fields matched from profile' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Preview ready. Review before submitting.' },
    { type: 'text', text: '  name: Alex Johnson' },
    { type: 'text', text: '  email: alex@example.com' },
    { type: 'text', text: '  linkedin: linkedin.com/in/alexjohnson' },
    { type: 'blank', text: '' },
    { type: 'recommendation', text: '  [REVIEW] All fields look correct.' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Submit? (Y/n): Y' },
    { type: 'success', text: '\u2713 Application submitted. Confirmation: #JA-48291' }
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
