/* === Scroll Reveal === */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* === Hero Entrance === */
document.querySelector('.hero').classList.add('entered');

/* === Terminal Animation === */
const termLines = [
  { type: 'cmd', text: '$ describe "As a registered user, I want to login with valid credentials"' },
  { type: 'out', text: '> Discovering page elements...', delay: 600 },
  { type: 'out', text: '> Generating LoginPage (Page Object)...', delay: 300 },
  { type: 'out', text: '> Generating AuthTasks (Task)...', delay: 300 },
  { type: 'out', text: '> Generating RegisteredUser (Role)...', delay: 300 },
  { type: 'out', text: '> Generating test_valid_login (Test)...', delay: 300 },
  { type: 'out', text: '', delay: 100 },
  { type: 'summary', text: '✓ 4 files generated. Running pytest...', delay: 300 },
  { type: 'out', text: '', delay: 100 },
  { type: 'pass', text: 'tests/auth/test_login.py::test_valid_login PASSED', delay: 200 },
];

function typeText(el, text, speed) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i]; i++;
      if (i >= text.length) { clearInterval(interval); resolve(); }
    }, speed);
  });
}

async function runTerminal() {
  const body = document.getElementById('terminalBody');
  for (const line of termLines) {
    if (line.delay) await new Promise(r => setTimeout(r, line.delay));
    const div = document.createElement('div');
    div.className = 'terminal__line terminal__line--' + line.type;
    body.appendChild(div);
    if (line.type === 'cmd') {
      await typeText(div, line.text, 25);
    } else if (line.type === 'pass') {
      div.textContent = line.text;
    } else if (line.type === 'summary') {
      div.innerHTML = line.text.replace(/✓/, '<span class="t-pass">✓</span>');
    } else {
      div.textContent = line.text;
    }
    body.scrollTop = body.scrollHeight;
  }
  // Loop after pause
  setTimeout(() => { body.innerHTML = ''; runTerminal(); }, 4000);
}
setTimeout(runTerminal, 800);

/* === Attested Counter === */
(function() {
  fetch('feed-count.txt')
    .then(function(r) { return r.text(); })
    .then(function(t) {
      var n = parseInt(t.trim(), 10);
      if (!isNaN(n)) {
        var el = document.getElementById('nav-count');
        if (el) el.textContent = n;
      }
    })
    .catch(function() {});
})();
