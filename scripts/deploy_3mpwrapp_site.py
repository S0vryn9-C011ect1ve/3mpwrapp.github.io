#!/usr/bin/env python3
"""
3mpwrapp marketing-site deploy helper.
Runs locally (via Hermes terminal). Requires Jekyll in PATH.

Usage:
  python scripts/deploy_3mpwrapp_site.py [--root <path>] [--project <name>]
"""

import argparse
import os
import subprocess
import sys


def run(cmd, cwd=None, check=True, env=None):
    """Run a shell command; print output; optionally raise on non-zero."""
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    print(f"$ {cmd}")
    result = subprocess.run(
        cmd, shell=True, cwd=cwd, env=merged_env,
        capture_output=True, text=True,
    )
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    if check and result.returncode != 0:
        raise SystemExit(f"Command failed (exit {result.returncode}): {cmd}")
    return result


def require_jekyll():
    r = run("jekyll --version", check=False)
    if r.returncode != 0:
        raise SystemExit("jekyll not found on PATH. Install Jekyll first.")
    print(r.stdout.strip())


def ensure_ruby_env():
    """Prepend Ruby + MSYS2 devkit to PATH if installed via RubyInstaller."""
    # Common install root for RubyInstaller with MSYS2 devkit
    candidates = [
        r"C:\Ruby34-x64\bin",
        r"C:\Ruby33-x64\bin",
        r"C:\Ruby32-x64\bin",
    ]
    # Also check MSYS2 devkit
    msys_candidates = [
        r"C:\Ruby34-x64\msys64\ucrt64\bin",
        r"C:\Ruby33-x64\msys64\ucrt64\bin",
        r"C:\Ruby32-x64\msys64\ucrt64\bin",
    ]
    for p in candidates + msys_candidates:
        if os.path.isdir(p) and p not in os.environ.get("PATH", ""):
            os.environ["PATH"] = p + os.pathsep + os.environ.get("PATH", "")
            print(f"Added to PATH: {p}")


def git_status(root):
    run("git status --short", cwd=root)
    run("git fetch --all --prune", cwd=root)
    run("git rev-parse --abbrev-ref HEAD", cwd=root)


def rebuild_jekyll(root):
    # Clean previous build
    if os.path.isdir(os.path.join(root, "_site")):
        run("rm -rf _site", cwd=root)
    # Set JEKYLL_ENV and build
    run("jekyll build", cwd=root,
        env={"JEKYLL_ENV": "production"})


def deploy_cloudflare(root, project):
    run(f"npx wrangler pages deploy _site --project-name={project} --branch=main",
        cwd=root)


def maybe_commit(root, changed_files=("privacy/index.md", "terms/index.md")):
    """Stage + commit if any of changed_files have uncommitted changes."""
    status = subprocess.run(
        "git status --porcelain", shell=True, cwd=root,
        capture_output=True, text=True,
    ).stdout.splitlines()
    rel_paths = {line[3:].strip().strip('"') for line in status if line.strip()}
    touching = [f for f in changed_files if f in rel_paths]
    if not touching:
        print(f"No changes in {changed_files}; skipping commit.")
        return
    run(f"git add {' '.join(touching)}", cwd=root)
    subjects = ", ".join(touching)
    run(f'git commit -m "Update {subjects} + rebuild _site"', cwd=root)


def main():
    ap = argparse.ArgumentParser(description="Deploy 3mpwrapp marketing site.")
    ap.add_argument("--root", default=r"C:\Users\HP\marketing-site",
                    help="Path to the marketing-site repo.")
    ap.add_argument("--project", default="3mpwrapp",
                    help="Cloudflare Pages project name.")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(os.path.join(root, ".git")):
        raise SystemExit(f"{root} does not look like a git repo.")

    os.chdir(root)

    ensure_ruby_env()
    require_jekyll()
    git_status(root)
    rebuild_jekyll(root)
    deploy_cloudflare(root, args.project)
    maybe_commit(root)


if __name__ == "__main__":
    main()
