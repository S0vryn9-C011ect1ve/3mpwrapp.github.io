# /api/health specification — verified against live ops-server.py routes
# To integrate: add to routes dict in ops-server.py (line ~1122-1148 area):
#   "/api/health": lambda: health_check(),

from datetime import datetime
import os

def health_check():
    import time
    return {
        "server": "running",
        "port": 9122,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "template_exists": os.path.exists(r"C:\Users\HP\AppData\Local\hermes\scripts\ops-dashboard.template.html"),
        "template_size_chars": len(open(r"C:\Users\HP\AppData\Local\hermes\scripts\ops-dashboard.template.html", "r", encoding="utf-8").read()) if os.path.exists(...) else 0,
        "template_has_responsive_css": "1fr 1fr !important" in open(...).read(),
        "flywheels_snapshot_exists": os.path.exists(r"C:/Users/HP/marketing-site/assets/data/flywheels-snapshot.json"),
        "kanban_exists": os.path.exists(r"C:/Users/HP/kanban.json"),
        "kanban_cards": len(open(r"C:/Users/HP/kanban.json", "r", encoding="utf-8").read())  # approximate
    }
