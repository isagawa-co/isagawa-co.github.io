(function () {
  // Products dropdown
  var trigger = document.querySelector('.pill-nav__dropdown-trigger');
  var menu = document.querySelector('.pill-nav__dropdown-menu');

  if (trigger && menu) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', function () {
      menu.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menu.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Attested counter
  var countEl = document.getElementById('nav-count');
  if (countEl) {
    fetch('feed-count.txt')
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var n = parseInt(t.trim(), 10);
        if (!isNaN(n)) countEl.textContent = n;
      })
      .catch(function () {});
  }
})();
