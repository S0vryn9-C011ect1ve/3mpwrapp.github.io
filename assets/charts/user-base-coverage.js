/**
 * 3mpwrapp — User Base Coverage chart (real data only).
 * Data source: /assets/data/flywheels-snapshot.json (regenerated nightly by
 * flywheel_daily_refresh.py from evidence_ledger.jsonl). Every bar is a count
 * of evidence cards tagged to that community — no invented figures.
 *
 * Usage: include this script on a page containing <div id="user-base-chart"></div>
 */
(function () {
  var LABELS = {
    disability: 'Persons w/ Disability',
    accessibility: 'Accessibility / Human Rights',
    injured_workers: 'Injured Workers',
    welfare_social: 'Caregivers / Family',
    elderly: 'Seniors / Elders',
    veterans: 'Veterans',
    public_allies: 'Public Allies',
    vulnerable_communities: 'Vulnerable Communities',
    indigenous: 'Indigenous'
  };
  function render(container, byCommunity) {
    var entries = Object.keys(byCommunity)
      .map(function (k) { return { key: k, label: LABELS[k] || k, n: byCommunity[k] }; })
      .sort(function (a, b) { return b.n - a.n; });
    var max = entries[0].n || 1;
    var W = 640, BAR_H = 28, GAP = 8;
    var H = entries.length * (BAR_H + GAP) + 40;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Evidence cards by user base" style="width:100%;height:auto">';
    entries.forEach(function (e, i) {
      var y = 10 + i * (BAR_H + GAP);
      var w = Math.round((e.n / max) * (W - 260));
      svg += '<text x="0" y="' + (y + BAR_H / 2 + 4) + '" font-size="12" fill="currentColor">' + e.label + '</text>';
      svg += '<rect x="240" y="' + y + '" width="' + w + '" height="' + BAR_H + '" rx="4" fill="#4a7dbd"></rect>';
      svg += '<text x="' + (246 + w) + '" y="' + (y + BAR_H / 2 + 4) + '" font-size="12" fill="currentColor">' + e.n + '</text>';
    });
    svg += '</svg>';
    container.innerHTML = svg;
  }
  function init() {
    var el = document.getElementById('user-base-chart');
    if (!el) return;
    fetch('/assets/data/flywheels-snapshot.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { render(el, d.by_community || {}); })
      .catch(function () { el.textContent = 'Chart data unavailable.'; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
