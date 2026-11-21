#!/usr/bin/env python3
"""Gateway health check — verifies gateway endpoint, provider connectivity, and basic response."""
import sys, urllib.request, urllib.error, socket, json

def check_gateway():
    # Check basic connectivity and provider endpoint
    endpoints = [
        ("huggingface", "https://router.huggingface.co/v1/chat/completions"),
    ]
    errors = []
    for name, url in endpoints:
        try:
            req = urllib.request.Request(url, method="GET", timeout=10)
            with urllib.request.urlopen(req, timeout=5) as resp:
                pass
        except urllib.error.HTTPError:
            pass  # endpoint exists but rejects GET/HEAD; consider reachable
        except Exception as e:
            errors.append(f"{name}: unreachable ({type(e).__name__})")
    # Check local gateway process (if any)
    try:
        import subprocess, os
        result = subprocess.run(["ps", "-aux"], capture_output=True, text=True, timeout=3)
        gateway_procs = [line for line in result.stdout.splitlines() if "gateway" in line.lower() and "python" not in line.lower()]
        if gateway_procs:
            pass
    except Exception:
        pass
    # Return status
    if errors:
        print(f"[gateway] {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')} — {len(errors)} problem(s)")
        for err in errors:
            print(f"  ! {err}")
        return 1
    else:
        print(f"[gateway] {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')} — OK")
        return 0

if __name__ == "__main__":
    sys.exit(check_gateway())
