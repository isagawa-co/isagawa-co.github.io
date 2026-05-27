// Vibe Coder Pack Terminal Animation
(function() {
  'use strict';

  const terminalBody = document.getElementById('terminalBody');
  const LOOP_DELAY = 4000; // 4 seconds before restarting
  const CHAR_DELAY = 30; // Milliseconds per character for typewriter effect
  const LINE_DELAY = 300; // Milliseconds between lines

  const terminalLines = [
    { type: 'command', text: '$ /vibe' },
    { type: 'prompt', text: '> What does your app do?' },
    { type: 'input', text: '"I want a booking system for my barber shop"' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Who uses it?' },
    { type: 'input', text: '"My customers book appointments, I manage the schedule"' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Web, mobile, or both?' },
    { type: 'input', text: '"Web for now, maybe mobile later"' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Any services you already use?' },
    { type: 'input', text: '"I use Square for payments"' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Generating app profile...' },
    { type: 'prompt', text: '> Analyzing requirements...' },
    { type: 'blank', text: '' },
    { type: 'header', text: 'DECISION: Frontend Stack' },
    { type: 'blank', text: '' },
    { type: 'text', text: '  Your app needs a way for customers to see available' },
    { type: 'text', text: '  times and book appointments.' },
    { type: 'blank', text: '' },
    { type: 'option', text: '  OPTION A: Next.js' },
    { type: 'text', text: '    Best for: Fast web apps with good SEO' },
    { type: 'text', text: '    Tradeoff: Slightly more complex setup' },
    { type: 'blank', text: '' },
    { type: 'option', text: '  OPTION B: React + Vite' },
    { type: 'text', text: '    Best for: Simple SPAs, fast development' },
    { type: 'text', text: '    Tradeoff: No server-side rendering' },
    { type: 'blank', text: '' },
    { type: 'recommendation', text: '  MY RECOMMENDATION: Next.js — your booking page' },
    { type: 'recommendation', text: '  needs to show up in Google searches.' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '> Which do you prefer? (A)' },
    { type: 'blank', text: '' },
    { type: 'success', text: '✓ Architecture generated. Scaffolding project...' },
    { type: 'success', text: '✓ 12 files created. Dev server running.' }
  ];

  /**
   * Create a line element with proper styling
   */
  function createLineElement(type, text) {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${type}`;
    line.textContent = text;
    return line;
  }

  /**
   * Typewriter effect for a single line
   */
  function typewriteLine(lineElement, text) {
    return new Promise((resolve) => {
      let index = 0;
      lineElement.textContent = ''; // Clear any existing content

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

  /**
   * Animate all terminal lines sequentially
   */
  async function animateTerminal() {
    // Clear previous content
    terminalBody.innerHTML = '';

    // Animate each line
    for (const lineData of terminalLines) {
      const lineElement = createLineElement(lineData.type, '');
      terminalBody.appendChild(lineElement);

      if (lineData.type === 'blank') {
        // Blank lines appear instantly
        lineElement.textContent = '';
        await new Promise(resolve => setTimeout(resolve, LINE_DELAY / 2));
      } else {
        // Text lines use typewriter effect
        await typewriteLine(lineElement, lineData.text);
        await new Promise(resolve => setTimeout(resolve, LINE_DELAY));
      }
    }

    // Keep the terminal visible for a moment, then loop
    await new Promise(resolve => setTimeout(resolve, LOOP_DELAY));
    animateTerminal(); // Restart the animation
  }

  /**
   * Fetch and verify feed counter availability
   */
  async function initFeedCounter() {
    try {
      const response = await fetch('./feed-count.txt');
      if (response.ok) {
        const count = await response.text();
        // Feed count loaded successfully for metrics
        void count; // Acknowledge variable for linting
      }
    } catch {
      // Feed count unavailable, animation continues without it
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    if (terminalBody) {
      initFeedCounter();
      animateTerminal();
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
