(function () {
  var hamburger = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    // Toggle panel open/close
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navLinks.classList.toggle('nav__links--open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when a regular link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('nav__links--open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('nav__links--open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navLinks.classList.remove('nav__links--open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Accordion sections
  document.querySelectorAll('.nav__section-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var items = this.nextElementSibling;
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isExpanded));
      items.classList.toggle('nav__section-items--open', !isExpanded);
    });
  });

  // Attested counter — fetch feed-count.txt (runs on all pages)
  // feed.html has its own counter logic that also sets nav-count; that's fine
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
