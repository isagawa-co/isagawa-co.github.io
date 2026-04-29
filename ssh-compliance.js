/* === Scroll Reveal === */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* === Hero Entrance === */
document.querySelector('.hero').classList.add('entered');

/* === Terminal Animation === */
const termLines = [
  { type: 'cmd', text: '$ ssh admin@10.0.4.12' },
  { type: 'out', text: 'Connected to 10.0.4.12 (Rocky Linux 9.3)', delay: 600 },
  { type: 'cmd', text: '$ python -m pytest tests/compliance/ -v', delay: 400 },
  { type: 'out', text: 'collecting...', delay: 300 },
  { type: 'out', text: '', delay: 200 },
  { type: 'head', text: '  STIG CHECKS', delay: 100 },
  { type: 'pass', text: '  STIG-001  PermitRootLogin .......... no', delay: 120 },
  { type: 'pass', text: '  STIG-002  Protocol ................. 2', delay: 80 },
  { type: 'pass', text: '  STIG-003  MaxAuthTries ............. 4', delay: 80 },
  { type: 'fail', text: '  STIG-004  X11Forwarding ........... yes', delay: 80 },
  { type: 'pass', text: '  STIG-005  PermitEmptyPasswords ..... no', delay: 80 },
  { type: 'out', text: '', delay: 100 },
  { type: 'head', text: '  CIS BENCHMARKS', delay: 100 },
  { type: 'pass', text: '  CIS-001   LogLevel ................ VERBOSE', delay: 80 },
  { type: 'pass', text: '  CIS-002   MaxSessions ............. 10', delay: 80 },
  { type: 'pass', text: '  CIS-003   ClientAliveInterval ...... 300', delay: 80 },
  { type: 'out', text: '', delay: 100 },
  { type: 'head', text: '  FIPS 140-3', delay: 100 },
  { type: 'pass', text: '  FIPS-001  KexAlgorithms ........... curve25519-sha256', delay: 80 },
  { type: 'fail', text: '  FIPS-002  Ciphers ................. aes128-cbc', delay: 80 },
  { type: 'pass', text: '  FIPS-003  MACs .................... hmac-sha2-256', delay: 80 },
  { type: 'out', text: '', delay: 200 },
  { type: 'summary', text: '  11 passed, 2 failed in 3.42s', delay: 200 },
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
      div.innerHTML = line.text.replace(/(\.+\s*)(\S+)$/, '$1<span class="t-pass">PASS</span>');
    } else if (line.type === 'fail') {
      div.innerHTML = line.text.replace(/(\.+\s*)(\S+)$/, '$1<span class="t-fail">FAIL</span>');
    } else if (line.type === 'head') {
      div.textContent = line.text;
    } else if (line.type === 'summary') {
      div.innerHTML = line.text.replace(/(\d+ passed)/, '<span class="t-pass">$1</span>').replace(/(\d+ failed)/, '<span class="t-fail">$1</span>');
    } else {
      div.textContent = line.text;
    }
    body.scrollTop = body.scrollHeight;
  }
  // Loop after pause
  setTimeout(() => { body.innerHTML = ''; runTerminal(); }, 4000);
}
setTimeout(runTerminal, 800);

/* === Architecture Typewriter === */
const archLines = [
  { text: 'Test', hl: true, rest: ' (Arrange / Act / Assert)          ', comment: 'pytest test cases' },
  { text: '  Role', hl: true, rest: ' (batch executor)               ', comment: 'orchestrates validators' },
  { text: '    Validator', hl: true, rest: ' (one check category)   ', comment: 'STIG, CIS, NIST, FIPS' },
  { text: '      Task', hl: true, rest: ' (single SSH command)    ', comment: 'atomic command execution' },
  { text: '        Interface', hl: true, rest: ' (paramiko)     ', comment: 'SSH connection, retry, timeout' },
];

const archObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      archObserver.unobserve(e.target);
      typeArchitecture();
    }
  });
}, { threshold: 0.3 });
const archPre = document.getElementById('archPre');
if (archPre) archObserver.observe(archPre);

async function typeArchitecture() {
  for (const line of archLines) {
    const span = document.createElement('span');
    archPre.appendChild(span);
    // Type highlighted keyword
    const hlSpan = document.createElement('span');
    hlSpan.className = 'hl';
    span.appendChild(hlSpan);
    for (const ch of line.text) {
      hlSpan.textContent += ch;
      await new Promise(r => setTimeout(r, 30));
    }
    // Add rest instantly
    const restNode = document.createTextNode(line.rest);
    span.appendChild(restNode);
    // Add comment
    const commentSpan = document.createElement('span');
    commentSpan.className = 'comment';
    commentSpan.textContent = line.comment;
    span.appendChild(commentSpan);
    span.appendChild(document.createTextNode('\n'));
    await new Promise(r => setTimeout(r, 150));
  }
}

/* === Stat Counter === */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      statObserver.unobserve(e.target);
      const target = parseInt(e.target.dataset.target);
      const suffix = e.target.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        e.target.textContent = current + suffix;
      }, 40);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => statObserver.observe(el));

