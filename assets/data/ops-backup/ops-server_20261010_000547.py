#!/usr/bin/env python3
import sys
"""One-file local backend for ops-dashboard. No extra deps."""
import json, re, webbrowser, threading, time, os

# Stampede guard for the full-vault walks, defined here rather than next to
# its first user because THREE functions use it: get_vault_graph(),
# cached_goals_and_tasks() and s0vryn9_tasks(). Declared at the top so no
# caller has to rely on a forward reference. ThreadingHTTPServer means N
# concurrent requests for a cold cache all miss at once and each performs its
# own ~7,300-file walk while contending for the GIL. Measured 2026-09-27: four
# concurrent cold hits on /api/vault-graph each took 14.3s - four walks for
# work one walk would have done. The first caller walks; the rest wait and
# then read the warm cache.
_vault_walk_lock = threading.Lock()
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

VAULT = Path(r"C:\Users\HP\Documents\Obsidian Vault")
AE = Path(r"C:\Users\HP\Desktop\AbstractEmporium")
LOGS = Path(r"C:\Users\HP\AppData\Local\hermes\logs")
ASC = Path(r"C:\Users\HP\Desktop\AscendantContinuum")
BACKUP_DIR = Path(r"D:\TerabyteBackups")
HERMES_TOKEN = os.environ.get("HERMES_TOKEN", "")
TEMPLATE = Path(r"C:\Users\HP\AppData\Local\hermes\scripts\ops-dashboard.template.html")
HERMES_API = "http://127.0.0.1:52604"

VAULT_SKIP = {".backups", "obsidian-vault", ".git", ".obsidian", ".agents", ".smart-env"}

def read_jsonl(path):
    out = []
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            out.append(json.loads(line))
        except Exception:
            pass
    return out

def money(n):
    try:
        return f"${float(n):,.2f}"
    except Exception:
        return str(n)

def ae_sales(limit=20):
    rows = []
    for o in read_jsonl(AE / "orders.jsonl"):
        total = float(o.get("total") or o.get("amount") or 0)
        if o.get("expense") == True:
            continue
        rows.append({
            "date": o.get("date") or o.get("created_at") or "",
            "customer": o.get("customer") or o.get("name") or "",
            "total": money(total),
            "status": o.get("status") or "paid",
        })
    rows.sort(key=lambda r: r["date"], reverse=True)
    return rows[:limit]

def ae_expenses(limit=20):
    rows = []
    for e in read_jsonl(AE / "expenses.jsonl"):
        note = e.get("note") or ""
        if "founder capital" in note.lower():
            continue
        total = float(e.get("total") or 0)
        rows.append({
            "date": e.get("date") or "",
            "vendor": e.get("vendor") or e.get("name") or "",
            "amount": money(total),
            "category": e.get("category") or "",
        })
    rows.sort(key=lambda r: r["date"], reverse=True)
    return rows[:limit]

def ae_loyalty():
    rows = []
    for e in read_jsonl(AE / "loyalty-summary.jsonl"):
        rows.append({
            "customer": e.get("customer") or "",
            "stamps": e.get("stamps") or e.get("balance") or 0,
        })
    rows.sort(key=lambda r: r["customer"])
    return rows

def recent_errors(path, limit=20):
    out = []
    if not path.exists():
        return out
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    for line in lines[-(limit*8):]:
        if re.search(r"(?i)\b(error|exception|traceback|failed|fatal)\b", line):
            out.append(line.rstrip()[:220])
    seen = set()
    uniq = []
    for x in reversed(out):
        if x not in seen:
            seen.add(x)
            uniq.append(x)
    return list(reversed(uniq))[:limit]

def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def rows_table(rows, keys):
    if not rows:
        return '<tr><td colspan="{}">No data</td></tr>'.format(len(keys))
    return "\n".join(
        "<tr>" + "".join(f"<td>{esc(r.get(k, ''))}</td>" for k in keys) + "</tr>"
        for r in rows
    )

NODES = [
    {"id": "Hermes", "group": 1},
    {"id": "3mpwrapp", "group": 2},
    {"id": "AbstractEmporium", "group": 2},
    {"id": "AscendantContinuum", "group": 2},
    {"id": "ObsidianVault", "group": 3},
    {"id": "Crons", "group": 1},
    {"id": "Backups", "group": 3},
    {"id": "Kanban", "group": 1},
    {"id": "Loyalty", "group": 2},
    {"id": "Expenses", "group": 2},
]
LINKS = [
    {"source": "Hermes", "target": "3mpwrapp"},
    {"source": "Hermes", "target": "AbstractEmporium"},
    {"source": "Hermes", "target": "AscendantContinuum"},
    {"source": "Hermes", "target": "Crons"},
    {"source": "Hermes", "target": "Kanban"},
    {"source": "Hermes", "target": "ObsidianVault"},
    {"source": "3mpwrapp", "target": "Backups"},
    {"source": "AbstractEmporium", "target": "Backups"},
    {"source": "AbstractEmporium", "target": "Loyalty"},
    {"source": "AbstractEmporium", "target": "Expenses"},
    {"source": "AscendantContinuum", "target": "Backups"},
    {"source": "ObsidianVault", "target": "Hermes"},
]

def hermes_json(path):
    req = Request(f"{HERMES_API}{path}", headers={"Authorization": f"Bearer {HERMES_TOKEN}"})
    try:
        with urlopen(req, timeout=5) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e), "path": path}

def read_vault_md(path):
    try:
        txt = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""
    return "\n".join(txt.splitlines()[:120])

def extract_wikilinks():
    links = []
    nodes = {}
    try:
        walk_gen = os_walk_safe(VAULT)
        for dp, dn, fn in walk_gen:
            for f in fn:
                if not f.endswith(".md"):
                    continue
                p = Path(dp) / f
                try:
                    txt = read_vault_md(p)
                except Exception:
                    continue
                if not txt:
                    continue
                rel = str(p.relative_to(VAULT))
                name = p.stem
                if rel.startswith("01 Hermes") or "Hermes" in rel.split("/")[0]:
                    grp = 1
                elif rel.startswith("10 S0vryn9") or "S0vryn9" in rel:
                    grp = 2
                elif rel.startswith("11 AbstractEmporium") or "AbstractEmporium" in rel:
                    grp = 3
                else:
                    grp = 4
                nodes[name] = {"id": name, "group": grp}
                for m in re.finditer(r"\[\[([^\]]+)\]\]", txt):
                    target = m.group(1).split("|")[0].strip()
                    links.append((name, target))
    except Exception as e:
        print("WALK FAIL:", repr(e))
    from collections import Counter
    top_links = [{"source": s, "target": t} for (s, t), _ in Counter(links).most_common(80)]
    node_set = {n for l in top_links for n in (l["source"], l["target"])}
    top_nodes = []
    for n in list(node_set)[:120]:
        top_nodes.append(nodes.get(n, {"id": n, "group": 4}))
    print("GRAPH:", len(top_nodes), "nodes", len(top_links), "links")
    return top_nodes, top_links

def os_walk_safe(root):
    try:
        for dp, dn, fn in os.walk(root, followlinks=False):
            dn[:] = [d for d in dn if d not in VAULT_SKIP and not d.startswith(".")]
            yield dp, dn, fn
    except Exception:
        return

_vault_cache = {"ts": 0.0, "nodes": 0, "links": 0}
def get_vault_graph():
    # Real vault size: count .md files (nodes) + wikilinks (links).
    # Cached 300s. At 60s this was the slowest endpoint on the dashboard
    # (19-29s per cold walk of ~7,300 files / 131 MB), which is what stalled
    # the vault-graph visual. The graph is a size counter, not live data, so a
    # 5-minute TTL is not a meaningful loss of freshness.
    try:
        now = time.time()
        if now - _vault_cache["ts"] < 300 and _vault_cache["nodes"]:
            return _vault_cache["nodes"], _vault_cache["links"]
        # Double-checked: a request arriving while another is mid-walk waits
        # for that walk and then reads the warm cache, rather than starting a
        # second full pass of its own.
        with _vault_walk_lock:
            now = time.time()
            if now - _vault_cache["ts"] < 300 and _vault_cache["nodes"]:
                return _vault_cache["nodes"], _vault_cache["links"]
            nodes = 0
            links = 0
            for dp, dn, fn in os_walk_safe(VAULT):
                for f in fn:
                    if not f.endswith(".md"):
                        continue
                    nodes += 1
                    try:
                        content = (Path(dp) / f).read_text(encoding="utf-8", errors="ignore")
                        links += content.count("[[")
                    except Exception:
                        pass
            if nodes == 0:
                nodes = len(NODES)
            if links == 0:
                links = len(LINKS)
            _vault_cache.update({"ts": now, "nodes": nodes, "links": links})
            return nodes, links
    except Exception:
        return len(NODES), len(LINKS)

_goals_cache = {"ts": 0.0, "value": None}
def cached_goals_and_tasks():
    """extract_goals_and_tasks() walks the whole vault (~7,300 .md files,
    131 MB) running two regexes per line. ~9-30s per call, uncached, which made
    /api/goals block 31s and dragged /api/chief to 43s (it calls this too).
    Cached 300s on the same pattern as get_vault_graph(); the first call after
    expiry pays full cost, a page refresh does not.
    """
    try:
        now = time.time()
        if _goals_cache["value"] is not None and now - _goals_cache["ts"] < 300:
            return _goals_cache["value"]
    except Exception:
        pass
    # Shares the vault-walk lock with s0vryn9_tasks: /api/goals and
    # /api/s0vryn9 are requested together on page load and both scan the vault.
    with _vault_walk_lock:
        try:
            now = time.time()
            if _goals_cache["value"] is not None and now - _goals_cache["ts"] < 300:
                return _goals_cache["value"]
        except Exception:
            pass
        value = extract_goals_and_tasks()
    try:
        _goals_cache["ts"] = time.time()
        _goals_cache["value"] = value
    except Exception:
        pass
    return value

# Folders that must never be mined for goals/milestones/tasks. These are
# scaffolds, templates and archives - a template's "# Milestones" heading is
# not a real milestone, and scanning them produced phantom work on the
# dashboard. Scoped HERE rather than added to VAULT_SKIP so the vault graph
# node/link counts are unaffected.
WORK_SKIP = {
    "07 Templates", "08 LightRAG", "09 NotebookLM", "99 Archives",
    "02 - Doc Brown", "05 Knowledge Vault - Brain", "06 Archive",
    "Archive", "Templates",
}


def extract_goals_and_tasks():
    goals, milestones, tasks = [], [], []
    try:
        for dp, dn, fn in os_walk_safe(VAULT):
            dn[:] = [d for d in dn if d not in WORK_SKIP]
            for f in fn:
                if not f.endswith(".md"):
                    continue
                p = Path(dp) / f
                txt = read_vault_md(p)
                if not txt:
                    continue
                rel = str(p.relative_to(VAULT))
                for line in txt.splitlines():
                    s = line.strip()
                    if not s:
                        continue
                    if re.search(r"(?i)^#+\s*(goal|objective)s?:\s*(.+)", s) or re.search(r"(?i)^##?\s*(goal|objective)s?:\s*(.+)", s):
                        goals.append({"file": rel, "text": re.sub(r"(?i)^#+\s*(goal|objective)s?:\s*", "", s).strip()})
                    if re.search(r"(?i)^#+\s*milestone", s):
                        milestones.append({"file": rel, "text": s.lstrip("#").strip()})
                    if re.search(r"(?i)^(?:-\s*\[\s*[xX]\s*\]|-\s*\[x\]|✅|done)", s):
                        tasks.append({"file": rel, "done": True, "text": re.sub(r"^[-*]\s*\[.\]\s*", "", s).strip()})
                    elif re.search(r"(?i)^(?:-\s*\[\s*\]|-\s*\[\s|☐|todo)", s):
                        tasks.append({"file": rel, "done": False, "text": re.sub(r"^[-*]\s*\[.\]\s*", "", s).strip()})
    except Exception:
        pass
    seen=set(); out=[]
    for x in goals:
        k=(x['file'],x['text'])
        if k not in seen: seen.add(k); out.append(x)
    goals=out[:40]
    seen=set(); out=[]
    for x in milestones+tasks:
        k=(x.get('file',''),x.get('text',''))
        if k not in seen: seen.add(k); out.append(x)
    return goals, milestones[:20], out[:60]

def backup_status():
    items = [{"name": "TerabyteBackups", "status": "unreadable", "mtime": ""}]
    try:
        if not BACKUP_DIR.exists():
            return items
        for child in sorted(BACKUP_DIR.iterdir(), key=lambda x: x.stat().st_mtime if x.exists() else 0, reverse=True):
            try:
                st = child.stat()
                mtime = time.strftime("%Y-%m-%d %H:%M", time.localtime(st.st_mtime))
                status = "dir" if child.is_dir() else f"{st.st_size:,} bytes"
                items.append({"name": child.name, "status": status, "mtime": mtime})
            except Exception as e:
                items.append({"name": child.name, "status": f"err: {e}", "mtime": ""})
    except Exception:
        pass
    return items[:20]

def _load_cron_fleet(jobs_path, exec_db_path, agent):
    """Read one profile's jobs.json + executions.db, tag each cron with its owning agent."""
    jobs = []
    last_err = {}
    last_started = {}
    try:
        exec_db = Path(exec_db_path)
        if exec_db.exists():
            import sqlite3 as _sql
            con = _sql.connect(str(exec_db))
            cur = con.cursor()
            cur.execute("SELECT job_id, started_at, error FROM executions WHERE error IS NOT NULL AND error != '' ORDER BY started_at DESC")
            for jid, started, err in cur.fetchall():
                if jid not in last_err:
                    last_err[jid] = (started, err)
            cur.execute("SELECT job_id, MAX(started_at) AS mx FROM executions GROUP BY job_id")
            for jid, mx in cur.fetchall():
                last_started[jid] = mx
            con.close()
    except Exception:
        pass
    try:
        raw = json.loads(Path(jobs_path).read_text(encoding="utf-8"))
        src = raw.get("jobs", []) if isinstance(raw, dict) else []
    except Exception:
        return jobs
    for j in src:
        if not isinstance(j, dict):
            continue
        jid = j.get("id", "")
        enabled = bool(j.get("enabled", False))
        jobs.append({
            "name": j.get("name", ""),
            "enabled": enabled,
            "state": "active" if enabled else "paused",
            "last_status": j.get("last_status", "active" if enabled else "paused"),
            "last_error": (last_err.get(jid, ("", ""))[1] or "")[:200],
            "model": j.get("model_snapshot") or j.get("model") or "",
            "provider": j.get("provider_snapshot") or j.get("provider") or "",
            "schedule": j.get("schedule_display") or (j.get("schedule", {}) or {}).get("expr", "") or j.get("cron", ""),
            "updated": last_started.get(jid, ""),
            "destination": (j.get("origin") if isinstance(j.get("origin"), dict) else {}).get("bot_username") or (j.get("origin") if isinstance(j.get("origin"), dict) else {}).get("chat_name") or "main_chat",
            "agent": agent,
        })
    return jobs

def cron_health():
    """Return real cron fleet across profiles (Hermes default + DegenWiz tradingecosystembot) with execution history merged in."""
    jobs = []
    jobs += _load_cron_fleet(
        r"C:\Users\HP\AppData\Local\hermes\cron\jobs.json",
        r"C:\Users\HP\AppData\Local\hermes\cron\executions.db",
        "Hermes")
    jobs += _load_cron_fleet(
        r"C:\Users\HP\AppData\Local\hermes\profiles\tradingecosystembot\cron\jobs.json",
        r"C:\Users\HP\AppData\Local\hermes\profiles\tradingecosystembot\cron\executions.db",
        "DegenWiz")
    active_c = sum(1 for j in jobs if j["state"] == "active")
    total = len(jobs)
    return {"overall": f"{active_c} active / {total} total", "jobs": jobs}

def website_status():
    urls = [
        ("Ascendant WebGL", "https://ascendant-continuum.web.app"),
        ("3mpwrapp PWA", "https://app.3mpwrapp.ca"),
        ("3mpwrapp", "https://3mpwrapp.ca"),
        ("AbstractEmporium", "https://abstractemporium.art"),
        ("S0vryn9", "https://s0vryn9c011ect1ve-ab0cb.web.app"),
    ]
    rows = []
    for name, url in urls:
        try:
            req = Request(url, method="HEAD", headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            with urlopen(req, timeout=8) as r:
                rows.append({"site": name, "status": f"{r.status}", "url": url})
        except HTTPError as e:
            rows.append({"site": name, "status": f"HTTP {e.code}", "url": url})
        except Exception as e:
            rows.append({"site": name, "status": f"ERR: {e}", "url": url})
    return rows

def cf_build_health():
    url = "https://app.3mpwrapp.ca"
    try:
        req = Request(url, method="HEAD", headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        with urlopen(req, timeout=8) as r:
            hdrs = {k.lower(): v for k, v in r.headers.items()}
            return {
                "site": "3mpwrapp",
                "http": str(r.status),
                "cache_control": hdrs.get("cache-control", ""),
                "cf_cache": hdrs.get("cf-cache-status", ""),
                "last_modified": hdrs.get("last-modified", ""),
            }
    except Exception as e:
        return {"site": "3mpwrapp", "error": str(e)}

def founder_context():
    return [
        {"key": "User", "value": "Lissa"},
        {"key": "Ecosystem", "value": "S0vryn9 C011ect1ve + Abstract Emporium"},
        {"key": "Hardware", "value": "i5-1235U, 16GB, no NVIDIA"},
        {"key": "Primary Drive", "value": "C: Hermes/Obsidian | D: repos/backups"},
        {"key": "Cron State", "value": "44 crons paused during migration"},
    ]

def moon_phase_name(age):
    if age < 1.1: return "New Moon"
    if age < 7.4: return "Waxing Crescent"
    if age < 8.4: return "First Quarter"
    if age < 13.8: return "Waxing Gibbous"
    if age < 16.0: return "Full Moon"
    if age < 22.1: return "Waning Gibbous"
    if age < 23.1: return "Last Quarter"
    if age < 29.5: return "Waning Crescent"
    return "New Moon"

def get_moon_phase():
    """Calculate current moon phase from UTC date."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    ref = datetime(2000,1,6, tzinfo=timezone.utc)
    synodic = 29.53059
    days = (now - ref).total_seconds() / 86400
    lunation = days % synodic
    return moon_phase_name(lunation)

def get_house_points():
    """Random house points for HP vibe (persists for session)."""
    import random
    return random.randint(100, 999)

MOON_FOCUS = {
    "New Moon": "Planning, intentions, backlog review",
    "Waxing Crescent": "Build, new features, early sprints",
    "First Quarter": "Decisions, push blockers",
    "Waxing Gibbous": "Refine, QA, prep launch",
    "Full Moon": "Peak visibility, release, public push",
    "Waning Gibbous": "Gather feedback, review metrics",
    "Last Quarter": "Wrap up, debt cleanup, support",
    "Waning Crescent": "Rest, document, reset",
}

ZODIAC = [
    ((1,20),(2,18),"Aquarius ♒"), ((2,19),(3,20),"Pisces ♓"), ((3,21),(4,19),"Aries ♈"),
    ((4,20),(5,20),"Taurus ♉"), ((5,21),(6,20),"Gemini ♊"), ((6,21),(7,22),"Cancer ♋"),
    ((7,23),(8,22),"Leo ♌"), ((8,23),(9,22),"Virgo ♍"), ((9,23),(10,22),"Libra ♎"),
    ((10,23),(11,21),"Scorpio ♏"), ((11,22),(12,21),"Sagittarius ♐"), ((12,22),(12,31),"Capricorn ♑"),
    ((1,1),(1,19),"Capricorn ♑"),
]

def sun_sign(month, day):
    for start, end, name in ZODIAC:
        s_month, s_day = start
        e_month, e_day = end
        if (month == s_month and day >= s_day) or (month == e_month and day <= e_day):
            return name
    return ""

def cosmic_context():
    from datetime import datetime, timezone, date
    now = datetime.now(timezone.utc)
    ref = datetime(2000,1,6, tzinfo=timezone.utc)
    synodic = 29.53059
    days = (now - ref).total_seconds() / 86400
    lunation = days % synodic
    phase = moon_phase_name(lunation)
    sign = sun_sign(now.month, now.day)
    chaldean = ["Saturn ♄", "Jupiter ♃", "Mars ♂", "Sun ☉", "Venus ♀", "Mercury ☿", "Moon ☽"]
    day_rulers = ["Sun ☉", "Moon ☽", "Mars ♂", "Mercury ☿", "Jupiter ♃", "Venus ♀", "Saturn ♄"]
    hour = now.hour + now.minute/60
    is_day = 6 <= hour < 18
    period_start = 6 if is_day else 18
    hour_index = int((hour - period_start + 24) % 24 // 2)
    day_ruler = chaldean.index(day_rulers[now.weekday()])
    planet = chaldean[(day_ruler + hour_index) % 7]
    period = "Day" if is_day else "Night"
    focus = MOON_FOCUS.get(phase, "")
    today = date.today()
    retros = []
    retro_windows = [
        ("Mercury ☿", date(2026,3,15), date(2026,4,7)),
        ("Mercury ☿", date(2026,7,25), date(2026,8,18)),
        ("Mercury ☿", date(2026,11,22), date(2026,12,16)),
        ("Venus ♀", date(2026,10,23), date(2026,11,13)),
        ("Mars ♂", date(2025,12,15), date(2026,2,24)),
        ("Jupiter ♃", date(2026,2,4), date(2026,6,9)),
        ("Saturn ♄", date(2026,6,14), date(2026,11,2)),
    ]
    for name, start, end in retro_windows:
        if start <= today <= end:
            retros.append(f"{name} retrograde until {end.strftime('%b %d')}")
    affirmations = {
        "Aries ♈": "I act with courage and clarity.",
        "Taurus ♉": "I build stability with patience.",
        "Gemini ♊": "I communicate with curiosity and grace.",
        "Cancer ♋": "I nurture my roots and my wings.",
        "Leo ♌": "I shine without dimming others.",
        "Virgo ♍": "I refine my craft with care.",
        "Libra ♎": "I choose balance and beauty.",
        "Scorpio ♏": "I transform through trust.",
        "Sagittarius ♐": "I seek truth with open eyes.",
        "Capricorn ♑": "I climb with integrity.",
        "Aquarius ♒": "I innovate for the collective.",
        "Pisces ♓": "I flow with compassion and insight.",
    }
    affirmation = affirmations.get(sign, "")
    items = [
        {"key": "UTC Time", "value": now.strftime("%Y-%m-%d %H:%M UTC")},
        {"key": "Moon Phase", "value": phase},
        {"key": "Sun Sign", "value": sign},
        {"key": "Lunation Age", "value": f"{lunation:.1f} days"},
        {"key": "Planetary Hour", "value": f"{period} {hour_index+1}/12 — {planet}"},
        {"key": "Today's Focus", "value": focus},
        {"key": "Affirmation", "value": affirmation},
    ]
    for r in retros:
        items.append({"key": "Retrograde Alert", "value": r})
    return items

def ae_pricing():
    return {
        "Z3NW1CK Classic Collection": [
            {"name": "2 oz Candle (Satsuma / Fruit Loops / Simple Daydreams / Cap'n Crunch Berries)", "price": 5.00},
            {"name": "5 oz Candle (Satsuma / Fruit Loops / Simple Daydreams / Cap'n Crunch Berries)", "price": 10.00},
            {"name": "6 Cube Wax Melt (Satsuma / Fruit Loops / Simple Daydreams / Cap'n Crunch Berries)", "price": 6.00},
            {"name": "20 Pack Wax Melt (Satsuma / Fruit Loops / Simple Daydreams / Cap'n Crunch Berries)", "price": 8.00},
            {"name": "20 Pack Incense (Satsuma / Fruit Loops / Simple Daydreams / Cap'n Crunch Berries)", "price": 8.00},
        ],
        "Z3NW1CK Premium Signature Collection": [
            {"name": "2 oz Candle (Monkey Farts / Bourbon & Sandalwood)", "price": 9.00},
            {"name": "5 oz Candle (Monkey Farts / Bourbon & Sandalwood)", "price": 16.00},
            {"name": "6 Cube Wax Melt (Monkey Farts / Bourbon & Sandalwood)", "price": 10.00},
            {"name": "20 Pack Incense (Monkey Farts / Bourbon & Sandalwood)", "price": 12.00},
        ],
        "Z3NW1CK Refill Program": [
            {"name": "Classic 2 oz Candle Refill", "price": 4.25},
            {"name": "Classic 5 oz Candle Refill", "price": 8.50},
            {"name": "Classic 6 Cube Wax Melt Refill", "price": 5.00},
            {"name": "Classic 20 Pack Incense Refill", "price": 7.00},
            {"name": "Premium 2 oz Candle Refill", "price": 8.00},
            {"name": "Premium 5 oz Candle Refill", "price": 14.00},
            {"name": "Premium 6 Cube Wax Melt Refill", "price": 9.00},
            {"name": "Premium 20 Pack Incense Refill", "price": 11.00},
        ],
        "Lissa's Knitting Creations — Slippers": [
            {"name": "Newborn (0-6mo)", "price": 7.00},
            {"name": "Baby (6-12mo)", "price": 10.00},
            {"name": "Toddler (1-2yr)", "price": 12.00},
            {"name": "Child (3-6yr)", "price": 15.00},
            {"name": "Youth (7-12yr)", "price": 20.00},
            {"name": "Adult Small", "price": 25.00},
            {"name": "Adult Medium", "price": 30.00},
            {"name": "Adult Large", "price": 35.00},
            {"name": "Adult XL", "price": 40.00},
        ],
        "Lissa's Knitting Creations — Tuques": [
            {"name": "Newborn", "price": 5.00},
            {"name": "Baby", "price": 8.00},
            {"name": "Toddler", "price": 12.00},
            {"name": "Child", "price": 15.00},
            {"name": "Adult", "price": 20.00},
        ],
    }

_tasks_cache = {"ts": 0.0, "tasks": None}
_SENTIMENT_CACHE = {"ts": 0.0, "val": 0.5}
def app_status_live():
    """Read app status from the vault instead of hard-coded literals.

    Was: {"3mpwrapp": {"progress": 85, ...}, "ascendant": {"progress": 78, ...}}
    baked into the endpoint. A literal cannot update, so it silently became a
    lie the moment either app moved. Now reads an `## App Status:` block from
    10 S0vryn9 C011ect1ve/App Status.md, falling back to an explicit "unknown"
    rather than a fabricated number.
    """
    out = {}
    src = VAULT / "10 S0vryn9 C011ect1ve" / "App Status.md"
    try:
        txt = src.read_text(encoding="utf-8", errors="replace")
    except Exception:
        txt = ""
    cur = None
    for line in txt.splitlines():
        s = line.strip().lstrip("#").strip()
        m = re.match(r"(?i)^(3mpwrapp|ascendant(?:\s+continuum)?)\s*$", s)
        if m:
            raw = m.group(1).strip().lower()
            # normalise "Ascendant Continuum" -> "ascendant" so the heading
            # cannot create a phantom third app key
            cur = "ascendant" if raw.startswith("ascendant") else raw
            out.setdefault(cur, {})
            continue
        if cur:
            for key, pat in (("status", r"(?i)^status\s*:\s*(.+)$"),
                             ("progress", r"(?i)^progress\s*:\s*(\d+)"),
                             ("notes", r"(?i)^notes?\s*:\s*(.+)$")):
                mm = re.match(pat, s)
                if mm:
                    out[cur][key] = int(mm.group(1)) if key == "progress" else mm.group(1).strip()
    for app in ("3mpwrapp", "ascendant"):
        if app not in out:
            out[app] = {"progress": None, "status": "unknown — no vault entry",
                        "notes": f"Update 10 S0vryn9 C011ect1ve/App Status.md (App: {app})"}
        elif out[app].get("progress") is None:
            out[app].setdefault("progress", None)
            out[app]["status"] = out[app].get("status", "unknown")
            out[app]["notes"] = out[app].get("notes", "")
    return out


def s0vryn9_tasks():
    # Walks every .md in the vault (~7,300 files, 131 MB) and regex-scans each
    # line for todo/checkbox markers. That is ~9s cold and was uncached, so a
    # dashboard load blocked ~40s on this and the browser gave up first
    # ("TypeError: Failed to fetch"). Under 3 concurrent loads it reached 55s
    # because the threads contend for the GIL and the disk.
    #
    # Cached 300s using the same pattern as get_vault_graph(). The task list
    # changes when Lissa edits a checkbox, so the TTL is deliberately longer
    # than the 60s graph cache but short enough to stay useful within a
    # session. The first call still pays full cost; a page refresh does not.
    try:
        now = time.time()
        if _tasks_cache["tasks"] is not None and now - _tasks_cache["ts"] < 300:
            return _tasks_cache["tasks"]
    except Exception:
        pass
    with _vault_walk_lock:
        try:
            now = time.time()
            if _tasks_cache["tasks"] is not None and now - _tasks_cache["ts"] < 300:
                return _tasks_cache["tasks"]
        except Exception:
            pass
        tasks = _scan_tasks_uncached()
    try:
        _tasks_cache["ts"] = time.time()
        _tasks_cache["tasks"] = tasks
    except Exception:
        pass
    return tasks

def _scan_tasks_uncached():
    """The actual vault walk, separated so the lock above wraps only this."""
    tasks = []
    try:
        for dp, dn, fn in os_walk_safe(VAULT):
            for f in fn:
                if not f.endswith(".md"):
                    continue
                p = Path(dp) / f
                try:
                    txt = read_vault_md(p)
                except Exception:
                    continue
                for line in txt.splitlines():
                    s = line.strip()
                    if re.search(r"(?i)^(?:-\s*\[\s*\]|-\s*\[\s|☐|todo)", s):
                        tasks.append({"done": False, "text": re.sub(r"^[-*]\s*\[.\]\s*", "", s).strip()})
                    elif re.search(r"(?i)^(?:-\s*\[\s*[xX]\s*\]|-\s*\[x\]|✅|done)", s):
                        tasks.append({"done": True, "text": re.sub(r"^[-*]\s*\[.\]\s*", "", s).strip()})
    except Exception:
        pass
    return tasks

def trade_events():
    # Recent trading desk activity from the dedup ledger + solana watcher logs
    events = []
    try:
        p = Path(r"C:\Users\HP\AppData\Local\hermes\workspace\trading_dedup.jsonl")
        if p.exists():
            for e in read_jsonl(p)[-8:]:
                sym = e.get("symbol") or e.get("ca", "")[:6]
                events.append({"sym": sym, "note": e.get("reason", "flagged")})
    except Exception:
        pass
    return events

def trade_movers():
    # Top movers from AI screener output if present
    try:
        p = VAULT / "03 Areas" / "Trading" / "screener-latest.json"
        if p.exists():
            d = json.loads(p.read_text(encoding="utf-8"))
            return d.get("movers", [])[:6]
    except Exception:
        pass
    return []

def run_sidecar(script_name, timeout=60):
    """Run a standalone data script and return its JSON, with an explicit
    failure state. A dashboard panel must never render as 'fine' because the
    thing feeding it crashed - that is the whole point of this helper."""
    import subprocess as _sp
    script = Path(r"C:\Users\HP\AppData\Local\hermes\scripts") / script_name
    if not script.exists():
        return {"error": f"{script_name} not found", "nodes": [], "links": [],
                "rings": [], "meta": {}}
    try:
        r = _sp.run([sys.executable, str(script)], capture_output=True,
                    text=True, timeout=timeout)
        if r.returncode == 0 and r.stdout.strip():
            return json.loads(r.stdout)
        return {"error": f"{script_name} exited {r.returncode}",
                "nodes": [], "links": [], "rings": [], "meta": {}}
    except _sp.TimeoutExpired:
        return {"error": f"{script_name} timed out ({timeout}s)",
                "nodes": [], "links": [], "rings": [], "meta": {}}
    except Exception as e:
        return {"error": str(e)[:160], "nodes": [], "links": [],
                "rings": [], "meta": {}}


def bee_brain_state():
    """Live Bee Brain safety panel. Replaces the broken crypto card.

    Runs the panel in a subprocess with a hard timeout: it makes on-chain and
    DexScreener calls, and a dashboard render must never hang behind a slow
    RPC. A failure returns an explicit ERROR status so the widget can say so,
    rather than rendering an empty panel that reads as "all clear".
    """
    import subprocess as _sp
    script = Path(r"C:\Users\HP\AppData\Local\hermes\scripts\bee_brain.py")
    if not script.exists():
        return {"status": "ERROR", "message": "bee_brain.py not found",
                "gates": [], "metrics": {}, "alerts": []}
    try:
        r = _sp.run([sys.executable, str(script)], capture_output=True,
                    text=True, timeout=90)
        if r.returncode == 0 and r.stdout.strip():
            return json.loads(r.stdout)
        return {"status": "ERROR",
                "message": f"bee_brain.py exited {r.returncode}",
                "gates": [], "metrics": {}, "alerts": []}
    except _sp.TimeoutExpired:
        return {"status": "ERROR", "message": "bee_brain.py timed out (90s)",
                "gates": [], "metrics": {}, "alerts": []}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)[:160],
                "gates": [], "metrics": {}, "alerts": []}


def crypto_prices():
    # Live-ish Solana watchlist from the dedup ledger (CA + symbol)
    out = []
    try:
        p = Path(r"C:\Users\HP\AppData\Local\hermes\workspace\trading_dedup.jsonl")
        if p.exists():
            seen = set()
            for e in read_jsonl(p)[-12:]:
                ca = e.get("ca")
                if ca in seen:
                    continue
                seen.add(ca)
                out.append({"symbol": e.get("symbol", "UNK"), "ca": ca, "price": e.get("price", "")})
    except Exception:
        pass
    return out[:6]


def crypto_sentiment():
    """Live crypto sentiment via Alternative.me Fear & Greed Index (0-1)."""
    try:
        req = Request("https://api.alternative.me/fng/?limit=1", headers={"User-Agent": "hermes-ops/1.0"})
        with urlopen(req, timeout=8) as resp:
            data = json.load(resp)
            val = int(data["data"][0]["value"]) / 100.0
            _SENTIMENT_CACHE["ts"] = time.time()
            _SENTIMENT_CACHE["val"] = val
            return val
    except Exception:
        pass  # keep cached/last
    return _SENTIMENT_CACHE["val"]

def ledger_summary():
    try:
        path = VAULT / "03 Areas" / "Trading" / "trade-ledger.jsonl"
        entries = read_jsonl(path)
        wins = sum(1 for e in entries if e.get("outcome") == "win")
        losses = sum(1 for e in entries if e.get("outcome") == "loss")
        net = sum(float(e.get("pnl", 0) or 0) for e in entries)
        return {"wins": wins, "losses": losses, "net": net}
    except Exception:
        return {"wins": 0, "losses": 0, "net": 0}

def generate_ideas():
    ideas = [
        {"title": "Loyalty Program Launch", "desc": "Implement the 10-stamp loyalty card system across AE product lines. Track via loyalty-summary.jsonl."},
        {"title": "3mpwrapp Beta Testing", "desc": "Complete 2-week stress test → orientation → store launch. Coordinate via Hephaestus cron."},
        {"title": "AE Social Media Pack", "desc": "Use comms-draft skill to generate weekly cross-ecosystem social posts from vault."},
        {"title": "Z3NW1CK Batch Planning", "desc": "Use z3nw1ck-production skill for ingredient scaling and cure tracking."},
        {"title": "Ascendant Pre-Beta", "desc": "Final QA on TWA AAB → deploy to Play Store for closed testing."},
        {"title": "Trading Journal Review", "desc": "Sunday Ledger Keeper cron reviews weekly outcomes. Propose rule diffs for approval."},
    ]
    return ideas

# Live Agent Graph — delegation agents + crons combined
DELEGATION_LOG_DIR = Path(r"C:\Users\HP\AppData\Local\hermes\cache\delegation\live")
JOBS_PATH = Path(r"C:\Users\HP\AppData\Local\hermes\cron\jobs.json")

def kanban_status():
    """Surface Hermes Kanban board (C:\\Users\\HP\\kanban.json) for the ops dashboard."""
    kpath = Path(r"C:\Users\HP\kanban.json")
    try:
        raw = json.loads(kpath.read_text(encoding="utf-8", errors="ignore"))
        if isinstance(raw, list):
            items = raw
        elif isinstance(raw, dict):
            items = raw.get("tasks", raw.get("items", []))
        else:
            items = []
        by_status = {}
        for it in items:
            st = (it.get("status") or "unknown").lower()
            by_status.setdefault(st, []).append({
                "id": it.get("id", ""),
                "title": it.get("title", it.get("body", "")[:80]),
                "assignee": it.get("assignee"),
                "priority": it.get("priority", ""),
            })
        total = len(items)
        done = len(by_status.get("done", [])) + len(by_status.get("completed", []))
        return {
            "total": total,
            "done": done,
            "by_status": {k: len(v) for k, v in by_status.items()},
            "recent": [
                {"title": it.get("title", it.get("body", "")[:80]), "status": it.get("status", "")}
                for it in items[:12]
            ],
            "source": str(kpath),
        }
    except Exception as e:
        return {"error": str(e), "total": 0, "by_status": {}, "recent": []}


def chief_of_staff_status():
    """Real-time Chief-of-Staff sync: Hermes gateway health + cron fleet + open items.

    Pulls from the live Hermes API (HERMES_API) when available so the dashboard
    shows the actual state of the Chief of Staff agent, not a static snapshot.
    """
    gateway = hermes_json("/api/status")
    gateway_up = "error" not in gateway
    # Cron fleet summary
    crons = cron_health().get("jobs", [])
    enabled = [c for c in crons if c.get("enabled")]
    errored = [c for c in crons if c.get("last_status") == "error"]
    # Sessions (active work)
    sess = hermes_json("/api/sessions")
    active_sessions = sess.get("total", 0) if isinstance(sess, dict) else 0
    # Vault 2nd-brain pulse
    vault_nodes, vault_links = get_vault_graph()
    return {
        "gateway_up": gateway_up,
        "gateway_detail": gateway if not gateway_up else {"status": "ok"},
        "crons_enabled": len(enabled),
        "crons_total": len(crons),
        "crons_errored": [c["name"] for c in errored],
        "active_sessions": active_sessions,
        "vault_nodes": vault_nodes,
        "vault_links": vault_links,
        "synced_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "mission": "S0vryn9 C011ect1ve: accessibility, injured workers, disability justice, Canada. "
                   "3mpwrapp + Ascendant Continuum. Ascendant = nature, cosmos, moon/star events.",
    }


def agents_status():
    """Real cron fleet — every agent in the graph is a cron job."""
    agents = []
    # Read real cron fleet from jobs.json
    if JOBS_PATH.exists():
        try:
            raw = json.loads(JOBS_PATH.read_text(encoding="utf-8"))
            for j in raw.get("jobs", []):
                jid = j.get("id", "")[:12]
                enabled = bool(j.get("enabled", False))
                state = j.get("state", "unknown")
                if state in ("completed", "paused"):
                    status = state
                elif enabled:
                    status = "running"
                else:
                    status = "paused"
                last_status = (j.get("last_status", "") or "").lower()
                if "error" in last_status:
                    status = "error"
                elif "ok" in last_status or "success" in last_status:
                    status = "healthy"
                agents.append({
                    "type": "cron",
                    "name": (j.get("name", "unnamed") + f" ({jid})").strip(),
                    "deleg_id": jid,
                    "status": status,
                    "progress": 100 if state != "paused" else 0,
                    "last_action": j.get("schedule_display",
                        (j.get("schedule", {}) or {}).get("expr", "")) or "",
                    "model": j.get("model_snapshot") or j.get("model") or "default",
                })
        except Exception:
            pass
    return {"agents": agents, "updated": time.strftime("%H:%M:%S")}

TODO_STORE = Path(r"C:\Users\HP\AppData\Local\hermes\todos.json")

def load_todos():
    if not TODO_STORE.exists():
        return []
    try:
        data = json.loads(TODO_STORE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []

def save_todos(items):
    TODO_STORE.parent.mkdir(parents=True, exist_ok=True)
    TODO_STORE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

FW_DIR = VAULT / "Research" / "3mpwrapp Flywheels"
FW_LEDGER = FW_DIR / "evidence_ledger.jsonl"


def flywheels_status():
    """Live evidence engine for the 3mpwrapp Flywheels of Change card.

    Reads evidence_ledger.jsonl (source of truth, written daily by the Reddit +
    X intake pipeline). Cheap: ~132 lines, no vault walk.
    Privacy: current data is public social evidence (Reddit/X). When the 3mpwrapp
    app goes live, user-contributed evidence is per-user opt-in / opt-out and
    anonymized — reflected in `privacy_model`.
    """
    cards = read_jsonl(FW_LEDGER)
    total = len(cards)
    by_community = {}
    by_jurisdiction = {}
    by_flywheel = {}
    canlii_verified = 0
    canlii_unverified = 0
    new_today = 0
    today = time.strftime("%Y-%m-%d")
    for c in cards:
        for com in (c.get("communities") or []):
            by_community[com] = by_community.get(com, 0) + 1
        jur = c.get("jurisdiction", "INTL")
        by_jurisdiction[jur] = by_jurisdiction.get(jur, 0) + 1
        fw = c.get("flywheel_target", "")
        by_flywheel[fw] = by_flywheel.get(fw, 0) + 1
        if c.get("verified"):
            canlii_verified += 1
        elif c.get("canlii_status") == "unverified_social":
            canlii_unverified += 1
        if c.get("date_captured") == today:
            new_today += 1
    ledger_mtime = ""
    try:
        if FW_LEDGER.exists():
            ledger_mtime = time.strftime(
                "%Y-%m-%d %H:%M:%S", time.localtime(FW_LEDGER.stat().st_mtime))
    except Exception:
        ledger_mtime = ""
    return {
        "total": total,
        "by_community": by_community,
        "by_jurisdiction": by_jurisdiction,
        "by_flywheel": by_flywheel,
        "canlii_verified": canlii_verified,
        "canlii_unverified": canlii_unverified,
        "new_today": new_today,
        "sources": ["reddit", "x"],
        "canlii_scraping": "paused",
        "privacy_model": "public-social evidence; per-user opt-in/opt-out + anonymization when 3mpwrapp app goes live",
        "ledger_mtime": ledger_mtime,
        "updated": time.strftime("%Y-%m-%d %H:%M:%S"),
    }


class Handler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        # Handle /api/todos mutations (add / update / delete / seed)
        if self.path == "/api/todos":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
            except Exception:
                body = {}
            action = (body.get("action") or "add").lower()
            items = load_todos()
            if action == "add":
                item = {
                    "id": body.get("id") or f"t{int(time.time()*1000)}",
                    "title": body.get("title", ""),
                    "status": body.get("status", "open"),
                    "priority": body.get("priority", "normal"),
                    "source": body.get("source", "manual"),
                    "created": body.get("created", time.strftime("%Y-%m-%d")),
                    "note": body.get("note", ""),
                }
                items.append(item)
                save_todos(items)
                return self.send_json({"ok": True, "todo": item})
            if action == "update":
                tid = body.get("id")
                for it in items:
                    if it.get("id") == tid:
                        it.update({k: v for k, v in body.items() if k not in ("action", "id")})
                        break
                save_todos(items)
                return self.send_json({"ok": True, "todo": tid})
            if action == "delete":
                tid = body.get("id")
                items = [it for it in items if it.get("id") != tid]
                save_todos(items)
                return self.send_json({"ok": True, "deleted": tid})
            if action == "seed":
                # bulk replace (used for initial seed / dashboard sync)
                if isinstance(body.get("items"), list):
                    save_todos(body["items"])
                    return self.send_json({"ok": True, "count": len(body["items"])})
            return self.send_json({"ok": False, "error": "unknown action"})
        self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith("/api/todos?"):
            # simple ?id= form
            import urllib.parse as up
            q = up.urlparse(self.path).query
            tid = up.parse_qs(q).get("id", [""])[0]
            items = [it for it in load_todos() if it.get("id") != tid]
            save_todos(items)
            return self.send_json({"ok": True, "deleted": tid})
        self.send_error(404)

    def do_GET(self):
        try:
            if self.path == "/" or self.path == "/index.html":
                template = Path(r"C:\Users\HP\AppData\Local\hermes\scripts\ops-dashboard.template.html")
                if template.exists():
                    return self.send_json(template.read_text(encoding="utf-8"), "text/html")
                return self.send_json("<h1>Dashboard not generated yet</h1>", "text/html")

            if self.path == "/circle" or self.path == "/circle.html":
                circle = Path(r"C:\Users\HP\Desktop\Ops-Floor-The-Circle.html")
                if circle.exists():
                    return self.send_json(circle.read_text(encoding="utf-8"), "text/html")
                template = Path(r"C:\Users\HP\AppData\Local\hermes\scripts\ops-dashboard.template.html")
                if template.exists():
                    return self.send_json(template.read_text(encoding="utf-8"), "text/html")
                return self.send_json("<h1>Circle not generated yet</h1>", "text/html")

            if self.path == "/ops-activity.json":
                p = Path(r"C:\\Users\\HP\\Desktop\\ops-activity.json")
                if p.exists():
                    return self.send_json(p.read_bytes(), "application/json")
                return self.send_json({"jobs": []})
            if self.path == "/ops-activity.js":
                candidates = [
                    Path(r"C:\Users\HP\Desktop\ops-activity.js"),
                    Path(r"C:\Users\HP\Desktop\Ops-Floor-The-Circle.html").parent / "ops-activity.js",
                ]
                for p in candidates:
                    if p.exists():
                        return self.send_json(p.read_text(encoding="utf-8"), "application/javascript")
                return self.send_json("/* missing ops-activity.js */", "application/javascript")

            routes = {
                "/api/status": lambda: {"sites": website_status(), "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")},
                "/api/ae": lambda: {"sales": ae_sales(), "expenses": ae_expenses(), "loyalty": ae_loyalty(), "pricing": ae_pricing()},
                "/api/sessions": lambda: (lambda data: {"sessions": [{"title": s.get("title",""),"model": s.get("model",""),"end_reason": s.get("end_reason",""),"started_at": s.get("started_at",""),"message_count": s.get("message_count",0)} for s in (data.get("sessions",[]) if isinstance(data, dict) else [])[:12]], "total": data.get("total",0)})(hermes_json("/api/sessions")),
                "/api/errors": lambda: {"hermes": recent_errors(LOGS / "agent.log") + recent_errors(LOGS / "errors.log"), "asc": recent_errors(ASC / ".backups" / "error.log") if (ASC / ".backups" / "error.log").exists() else [] or recent_errors(ASC / "error.log")},
                "/api/goals": lambda: (lambda g,m,t: {"goals":g,"milestones":m,"tasks":t})(*cached_goals_and_tasks()),
                "/api/backups": lambda: {"backups": backup_status()},
                "/api/crons": lambda: cron_health(),
                "/api/websites": lambda: {"sites": website_status()},
                "/api/cf": lambda: cf_build_health(),
                "/api/founder": lambda: {"context": founder_context()},
                "/api/cosmic": lambda: {"context": cosmic_context(), "moon_phase": get_moon_phase(), "house_points": get_house_points()},
                "/api/moon": lambda: {"phase": get_moon_phase()},
                "/api/vault-graph": lambda: {"nodes": get_vault_graph()[0], "links": get_vault_graph()[1]},
                "/api/s0vryn9": lambda: {"apps": app_status_live(), "tasks": s0vryn9_tasks(), "s0vryn9_expenses": read_jsonl(AE / "expenses.jsonl")[:10]},
                "/api/trading": lambda: {"events": trade_events(), "sentiment": crypto_sentiment(), "movers": trade_movers(), "crypto": crypto_prices(), "ledger": ledger_summary()},
                "/api/bee": lambda: bee_brain_state(),
                "/api/vaultgraph": lambda: run_sidecar("vault_graph.py", 60),
                "/api/circle": lambda: run_sidecar("cron_circle.py", 60),
                "/api/bee-growth": lambda: run_sidecar("bee_evolution.py", 45),
                "/api/ideas": lambda: {"ideas": generate_ideas()},
                "/api/delegation": lambda: agents_status(),
                "/api/agents": lambda: agents_status(),
                "/api/kanban": lambda: kanban_status(),
                "/api/chief": lambda: chief_of_staff_status(),
                "/api/flywheels": lambda: flywheels_status(),
                "/api/todos": lambda: {"todos": load_todos(), "total": len(load_todos()), "open": len([t for t in load_todos() if t.get("status") != "done"])},
            }
            if self.path in routes:
                return self.send_json(routes[self.path]())
            self.send_error(404)
        except Exception as e:
            try:
                self.send_json({"error": str(e)})
            except Exception:
                self.send_error(500)

    def send_json(self, obj, content_type="application/json"):
        payload = obj if isinstance(obj, bytes) else (json.dumps(obj, ensure_ascii=True) if not isinstance(obj, str) else obj).encode("utf-8")
        try:
            self.send_response(200)
            self.send_header("Content-Type", f"{content_type}; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.end_headers()
            self.wfile.write(payload)
        except Exception:
            pass

    def log_message(self, format, *args):
        pass

def main():
    port = 9122
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    threading.Thread(target=lambda: (webbrowser.open(url), server.serve_forever()), daemon=True).start()
    print(f"Serving {url}")
    # Keep main thread alive so daemon thread doesn't get killed
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        server.shutdown()

if __name__ == "__main__":
    main()
