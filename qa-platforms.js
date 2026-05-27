/* === Scroll Reveal === */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* === Hero Entrance === */
document.querySelector('.hero').classList.add('entered');

/* === Terminal Animation === */
const termLines = [
  { type: 'cmd', text: '$ /qa-workflow' },
  { type: 'out', text: '', delay: 400 },
  { type: 'out', text: '[Step 1: User Input]', delay: 300 },
  { type: 'out', text: '  Persona: HR Manager', delay: 200 },
  { type: 'out', text: '  URL: https://app.example.com/login', delay: 200 },
  { type: 'out', text: '  Workflow: "Log in and create a new employee"', delay: 200 },
  { type: 'out', text: '', delay: 300 },
  { type: 'out', text: '[Step 2: Pre-flight]', delay: 300 },
  { type: 'out', text: '  Credential strategy resolved. Environment ready.', delay: 400 },
  { type: 'out', text: '', delay: 300 },
  { type: 'out', text: '[Step 3: AI Processing]', delay: 300 },
  { type: 'out', text: '  BDD scenarios generated. Expected states defined.', delay: 400 },
  { type: 'out', text: '  Discovering elements on target pages...', delay: 600 },
  { type: 'out', text: '', delay: 300 },
  { type: 'out', text: '[Step 4: Construction]', delay: 300 },
  { type: 'out', text: '  Reading reference implementations...', delay: 400 },
  { type: 'out', text: '  Writing LoginPage (Domain Object)...', delay: 300 },
  { type: 'out', text: '  Writing EmployeeManagementTasks (Task)...', delay: 300 },
  { type: 'out', text: '  Writing HRManager (Role)...', delay: 300 },
  { type: 'out', text: '  Writing test_create_employee (Test)...', delay: 300 },
  { type: 'out', text: '', delay: 300 },
  { type: 'out', text: '[Step 5: Execution]', delay: 300 },
  { type: 'summary', text: '  ✓ 5 files generated. Running pytest...', delay: 400 },
  { type: 'out', text: '', delay: 200 },
  { type: 'pass', text: '  tests/hr/test_create_employee.py::test_create_employee PASSED', delay: 300 },
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
