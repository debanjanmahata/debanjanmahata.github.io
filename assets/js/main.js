(function () {
  'use strict';

  // ---------- Publications ----------
  // Data lives in assets/js/publications.js (window.PUBLICATIONS).
  var ME = 'Debanjan Mahata';
  var TYPE_LABEL = {
    conference: 'Conference', journal: 'Journal', workshop: 'Workshop', preprint: 'Preprint',
    chapter: 'Book chapter', book: 'Book', thesis: 'Thesis', patent: 'Patent', tutorial: 'Tutorial', talk: 'Talk'
  };
  var BOOKISH = ['book', 'thesis', 'patent', 'chapter'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function link(label, href) {
    var a = el('a', null, label);
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }

  function scholarSearch(title) {
    return 'https://scholar.google.com/scholar?q=' + encodeURIComponent('"' + title + '"');
  }

  function renderPublications() {
    var list = document.getElementById('pub-list');
    var data = window.PUBLICATIONS;
    if (!list || !data) return;
    var search = document.getElementById('pub-search');
    var count = document.getElementById('pub-count');

    var items = data.map(function (p) {
      var li = el('li', 'pub');
      li.appendChild(el('div', 'pub__year', p.y ? String(p.y) : 'Preprint'));
      var body = el('div');

      var title = el('p', 'pub__title');
      var links = p.links || {};
      var main = links.Paper || links.arXiv || links.PDF || links.Patent;
      title.appendChild(main ? link(p.t, main) : document.createTextNode(p.t));
      body.appendChild(title);

      var authors = el('p', 'pub__authors');
      p.a.forEach(function (name, i) {
        if (i) authors.appendChild(document.createTextNode(', '));
        if (name === ME) authors.appendChild(el('strong', null, name));
        else authors.appendChild(document.createTextNode(name));
      });
      body.appendChild(authors);

      var meta = el('p', 'pub__venue');
      meta.appendChild(el('span', 'pub__type', TYPE_LABEL[p.type] || p.type));
      meta.appendChild(document.createTextNode(p.v));
      body.appendChild(meta);
      if (p.note) body.appendChild(el('p', 'pub__note', p.note));

      var row = el('div', 'pub__links');
      Object.keys(links).forEach(function (k) { row.appendChild(link(k, links[k])); });
      if (!main) row.appendChild(link('Find on Scholar', scholarSearch(p.t)));
      body.appendChild(row);

      li.appendChild(body);
      list.appendChild(li);
      return {
        node: li,
        pub: p,
        text: (p.t + ' ' + p.a.join(' ') + ' ' + p.v + ' ' + (p.y || '')).toLowerCase()
      };
    });

    var state = { filter: 'selected', q: '' };

    function matches(it) {
      var f = state.filter, p = it.pub;
      var okFilter =
        f === 'all' ||
        (f === 'selected' && p.sel) ||
        (f === 'books' && BOOKISH.indexOf(p.type) !== -1) ||
        p.topics.indexOf(f) !== -1;
      return okFilter && (!state.q || it.text.indexOf(state.q) !== -1);
    }

    function apply() {
      var shown = 0;
      items.forEach(function (it) {
        var on = matches(it);
        it.node.hidden = !on;
        if (on) shown++;
      });
      if (count) {
        count.textContent = shown === 0
          ? 'No matching publications.'
          : 'Showing ' + shown + ' of ' + items.length + ' publications.';
      }
    }

    var chips = document.querySelectorAll('.filters .chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filter = chip.dataset.filter;
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value.trim().toLowerCase();
        // Searching should look across everything, not just the selected few.
        if (state.q && state.filter === 'selected') {
          var all = document.querySelector('.filters .chip[data-filter="all"]');
          if (all) all.click();
          return;
        }
        apply();
      });
    }

    apply();
  }

  // ---------- Theme toggle ----------
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ---------- Mobile nav ----------
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav');
    var bar = document.querySelector('.navbar');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var onScroll = function () { bar && bar.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the nav link of the section in view.
    if ('IntersectionObserver' in window && nav) {
      var links = {};
      nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && links[en.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('is-current'); });
            links[en.target.id].classList.add('is-current');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
    }
  }

  // ---------- Experience tabs ----------
  function initExperience() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.xp__tab'));
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  }

  // ---------- Reveal on scroll ----------
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    renderPublications();
    initTheme();
    initNav();
    initExperience();
    initReveal();
  });
})();
