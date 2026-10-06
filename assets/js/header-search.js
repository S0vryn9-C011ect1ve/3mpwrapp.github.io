(function () {
  'use strict';
  var input = document.getElementById('site-search-input');
  var form = document.getElementById('site-search-form');
  var results = document.getElementById('header-search-results');
  if (!input || !results) return;

  var idx = [];
  var loaded = false;
  var pending = '';
  var activeIndex = -1;
  var current = [];

  function normalize(s) { return (s || '').toString().toLowerCase(); }

  function escapeHTML(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function escapeRe(t) {
    var bs = String.fromCharCode(92);
    var special = '*+?^${}()|[]' + bs;
    var out = '';
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (special.indexOf(ch) !== -1) out += bs + ch;
      else out += ch;
    }
    return out;
  }

  function highlight(text, terms) {
    var container = document.createElement('span');
    var safe = text || '';
    if (!terms || terms.length === 0) { container.textContent = safe; return container; }
    try {
      var pattern = terms.map(escapeRe).join('|');
      var re = new RegExp('(' + pattern + ')', 'ig');
      var lastIndex = 0, match;
      re.lastIndex = 0;
      while ((match = re.exec(safe)) !== null) {
        if (match.index > lastIndex) container.appendChild(document.createTextNode(safe.slice(lastIndex, match.index)));
        var mark = document.createElement('mark'); mark.textContent = match[0]; container.appendChild(mark);
        lastIndex = match.index + match[0].length;
        if (match.index === re.lastIndex) re.lastIndex++;
      }
      if (lastIndex < safe.length) container.appendChild(document.createTextNode(safe.slice(lastIndex)));
      return container;
    } catch (e) { container.textContent = safe; return container; }
  }

  function openResults() { results.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function closeResults() { results.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); activeIndex = -1; }

  function setActive(i) {
    var opts = results.querySelectorAll('a[role="option"]');
    if (!opts.length) return;
    if (i < 0) i = opts.length - 1;
    if (i >= opts.length) i = 0;
    opts.forEach(function (o) { o.setAttribute('aria-selected', 'false'); o.classList.remove('hsr-active'); });
    opts[i].setAttribute('aria-selected', 'true');
    opts[i].classList.add('hsr-active');
    input.setAttribute('aria-activedescendant', opts[i].id);
    activeIndex = i;
  }

  function render(q, terms) {
    results.innerHTML = '';
    if (!q) { closeResults(); return; }
    if (current.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'hsr-empty';
      empty.textContent = 'No results for "' + q + '"';
      results.appendChild(empty);
      openResults();
      return;
    }
    current.slice(0, 8).forEach(function (item, i) {
      var a = document.createElement('a');
      a.href = item.url;
      a.setAttribute('role', 'option');
      a.id = 'hsr-opt-' + i;
      a.setAttribute('aria-selected', 'false');
      a.appendChild(highlight(item.title || item.url || '', terms));
      if (item.content) {
        var p = document.createElement('div');
        p.className = 'hsr-excerpt';
        var ex = item.content;
        if (ex.length > 160) ex = ex.slice(0, 160).trim() + '…';
        p.appendChild(highlight(ex, terms));
        a.appendChild(p);
      }
      a.addEventListener('mouseenter', function () { setActive(i); });
      results.appendChild(a);
    });
    openResults();
  }

  function doSearch(q) {
    var terms = normalize(q).split(/\s+/).filter(Boolean);
    if (terms.length === 0) { render('', []); return; }
    var scored = [];
    idx.forEach(function (item) {
      var title = normalize(item.title);
      var url = normalize(item.url);
      var content = normalize(item.content);
      var present = terms.every(function (t) { return title.indexOf(t) !== -1 || url.indexOf(t) !== -1 || content.indexOf(t) !== -1; });
      if (!present) return;
      var score = 0;
      terms.forEach(function (t) {
        if (title.indexOf(t) !== -1) score += 5;
        if (url.indexOf(t) !== -1) score += 2;
        if (content.indexOf(t) !== -1) score += 1;
      });
      if (terms.every(function (t) { return title.indexOf(t) !== -1; })) score += 5;
      scored.push({ item: item, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    current = scored.slice(0, 12).map(function (s) { return s.item; });
    render(q, terms);
  }

  function hydrateAndSearch(q) {
    if (loaded) { doSearch(q); return; }
    pending = q;
    fetch('/search.json', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function (data) {
        idx = (data || []).map(function (x) { return { title: x.title || x.name || '', url: x.url, content: x.excerpt || x.content || '' }; });
        loaded = true;
        if (pending) doSearch(pending);
      })
      .catch(function () {
        results.innerHTML = '<div class="hsr-empty">Search is unavailable right now.</div>';
        openResults();
      });
  }

  var t;
  input.addEventListener('input', function (e) {
    var q = e.target.value;
    clearTimeout(t);
    t = setTimeout(function () { hydrateAndSearch(q); }, 150);
  });

  input.addEventListener('keydown', function (e) {
    var opts = results.querySelectorAll('a[role="option"]');
    if (e.key === 'ArrowDown') { e.preventDefault(); if (results.hidden) hydrateAndSearch(input.value); else setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Escape') { closeResults(); input.blur(); }
    else if (e.key === 'Enter') {
      if (activeIndex >= 0 && opts[activeIndex]) { e.preventDefault(); window.location.href = opts[activeIndex].href; }
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var opts = results.querySelectorAll('a[role="option"]');
    if (current.length > 0) {
      window.location.href = (activeIndex >= 0 && opts[activeIndex]) ? opts[activeIndex].href : current[0].url;
    } else {
      closeResults();
    }
  });

  document.addEventListener('click', function (e) {
    if (e.target !== input && !results.contains(e.target)) closeResults();
  });

  var params = new URLSearchParams(location.search);
  var initial = params.get('q');
  if (initial) { input.value = initial; hydrateAndSearch(initial); }
})();
