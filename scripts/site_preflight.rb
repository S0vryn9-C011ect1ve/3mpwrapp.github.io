#!/usr/bin/env ruby
# frozen_string_literal: true
#
# site_preflight.rb — deployment gate for the 3mpwrapp site.
#
# Every bug class in this file was found the hard way: the site reported
# success while publishing wrong numbers for weeks, because nothing checked
# the build. These four checks are the ones that would each have caught it.
#
#   1. FRONTMATTER  — a .md file whose YAML frontmatter cannot be parsed, or
#                     whose scalar values silently became nested mappings.
#   2. BARE LIQUID  — a literal "{% %}" written as prose. Jekyll parses Liquid
#                     BEFORE markdown, so a code fence or backticks does not
#                     protect it. Fails the whole build.
#   3. SELF-INCLUDE — an include naming its own file. Infinite recursion ->
#                     "stack level too deep".
#   4. ARITHMETIC   — the published audit banner must add up to the headline
#                     it claims to audit.
#
# Exit 0 = safe to deploy. Exit 1 = block the deploy.
#
# NOTE: a monitor must never report "problem" as its normal state, so this
# exits 0 when it runs correctly and finds nothing, and 1 only on findings.

require "yaml"
require "date"
require "set"

ROOT     = ARGV[0] || "."
# Dir.glob on this Ruby build (3.3.12 mingw-ucrt) does not match a pattern
# built from a backslash-separated path: File.join("C:\a\b", "**", "*.md")
# returns 0 files, while the same path with forward slashes returns the file.
# That produced a gate which silently reported "0 files checked" and exited 0
# on any Windows-style root. Normalise before globbing.
ROOT = ROOT.tr("\\", "/")
# _posts_broken is a quarantine directory Jekyll does not build.
SKIP_DIRS = ["_site", ".git", "node_modules", "_posts_broken", "vendor"]
findings = []

def rel(path)
  path.sub(%r{\A\./}, "")
end

# ---------------------------------------------------------------------------
# 1. Frontmatter
# ---------------------------------------------------------------------------
# A top-level Hash is CORRECT frontmatter - that is not a fault. The fault is a
# key that should hold a String (title, description, excerpt...) holding a Hash
# instead, which is what an unquoted scalar containing ": " produces:
#
#   title: Ankle Injuries: Breaking Down   ->  {"title" => {"Ankle Injuries" => "Breaking Down"}}
#
STRING_KEYS = %w[title description excerpt layout permalink image category
                 author last_updated].freeze

def frontmatter_findings(root, findings)
  checked = 0
  Dir.glob(File.join(root, "**", "*.md"), File::FNM_DOTMATCH).each do |f|
    relp = rel(f.sub(%r{\A#{Regexp.escape(root)}/?}, ""))
    next if SKIP_DIRS.any? { |d| relp.start_with?("#{d}/") }
    t = File.read(f, encoding: "UTF-8", invalid: :replace, undef: :replace)
    next unless t.start_with?("---")
    m = t.match(/\A---\r?\n(.*?)\r?\n---[ \t]*\r?\n?/m)
    next unless m
    checked += 1
    begin
      d = YAML.load(m[1], permitted_classes: [Date, Time], aliases: true)
    rescue StandardError => e
      findings << "[frontmatter] #{relp}: #{e.message[0, 120]}"
      next
    end
    next unless d.is_a?(Hash)
    STRING_KEYS.each do |k|
      v = d[k]
      next if v.nil? || !v.is_a?(Hash)
      findings << "[frontmatter] #{relp}: '#{k}' parsed as a nested mapping " \
                 "(unquoted ': ' in a scalar): #{v.inspect[0, 90]}"
    end
  end
  puts "  frontmatter: #{checked} file(s) parsed"
  checked
end

# ---------------------------------------------------------------------------
# 2 + 3. Liquid
# ---------------------------------------------------------------------------
BARE_TAG = /\{%-?(?!\s*-?\s*[A-Za-z_])/.freeze
INCLUDE  = /\{%-?\s*include\s+([A-Za-z0-9_\-.\/]+)/.freeze

def liquid_findings(root, findings)
  bare = 0
  selfinc = 0
  Dir.glob(File.join(root, "**", "*"), File::FNM_DOTMATCH).each do |f|
    next unless File.file?(f)
    next unless %w[.md .html].include?(File.extname(f))
    relp = rel(f.sub(%r{\A#{Regexp.escape(root)}/?}, ""))
    next if SKIP_DIRS.any? { |d| relp.start_with?("#{d}/") }
    # NOTE: this Ruby build has no String#splitlines (verified: respond_to? is
    # false), so use #lines, which is present.
    lines = File.read(f, encoding: "UTF-8", invalid: :replace, undef: :replace).lines
    # Liquid does not execute anything inside a {% comment %} block or a
    # {% raw %} block, so a self-include appearing in one is documentation
    # rather than recursion. Track both. This matters: the two lines below are
    # inside {% raw %} and are correctly NOT a fault.
    in_comment = false
    in_raw = false
    lines.each_with_index do |l, i|
      stripped = l.strip
      # Open blocks before evaluating this line's own tags, so a line that both
      # opens and closes ({% raw %}...{% endraw %} on one line) is inert.
      in_comment = true if stripped.include?("{% comment") && !stripped.include?("{% endcomment")
      in_raw = true if stripped.include?("{% raw") && !stripped.include?("{% endraw")
      unless in_comment || in_raw
        if BARE_TAG.match?(l)
          bare += 1
          findings << "[bare-liquid] #{relp}:#{i + 1}: #{stripped[0, 110]}"
        elsif l.include?("include")
          l.scan(INCLUDE).flatten.each do |tgt|
            next unless tgt.split("/").last == File.basename(f)
            selfinc += 1
            findings << "[self-include] #{relp}:#{i + 1}: recursion via " \
                       "'#{tgt}' -- stack level too deep"
          end
        end
      end
      in_comment = false if stripped.include?("{% endcomment")
      in_raw = false if stripped.include?("{% endraw")
    end
  end
  puts "  liquid: #{bare} bare tag(s), #{selfinc} self-include(s)"
end

# ---------------------------------------------------------------------------
# 4. Published-banner arithmetic
# ---------------------------------------------------------------------------
# The audit banner states "<headline> = <a> <words> + <b> <words>". If the
# parts do not sum to the headline, the page contradicts itself and no reader
# can verify the correction. This exact bug shipped for weeks.
#
# The word gap must be matched by [A-Za-z]+ (or a non-digit, non-'+' run).
# Using \S+ here silently never matches: it is greedy and consumes the '+' it
# was supposed to stop before, so the check reports "0 equations checked" and
# passes anything, including a banner known to be wrong.
ARITH = /
  (?<head>\d{1,3}(?:,\d{3})+)
  \s*=\s*
  (?<a>\d{1,3}(?:,\d{3})+)
  \s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\+\s+
  (?<b>\d{1,3}(?:,\d{3})+)
/x.freeze

def strip_tags(s)
  s.gsub(/<[^>]+>/, " ")
end

def arithmetic_findings(root, findings)
  checked = 0
  # Scan .md AND .html: the published audit banner lives in research.html, so
  # scanning only markdown silently reported "0 equations checked" - a check
  # that cannot fail, while the very banner it exists to protect went unverified.
  Dir.glob(File.join(root, "**", "*.{md,html}"), File::FNM_DOTMATCH).each do |f|
    relp = rel(f.sub(%r{\A#{Regexp.escape(root)}/?}, ""))
    next if SKIP_DIRS.any? { |d| relp.start_with?("#{d}/") }
    txt = strip_tags(File.read(f, encoding: "UTF-8", invalid: :replace, undef: :replace))
    # Decode only numeric character references, and only those that map to
    # printable ASCII. chr() raises RangeError for values this build cannot
    # represent, and a doc full of typographic entities (e.g. &#8217;) must
    # not abort the whole check.
    txt = txt.gsub(/&#(\d{1,5});/) do
      cp = Regexp.last_match(1).to_i
      cp.between?(32, 126) ? cp.chr : ""
    end
    # Collapse whitespace, then find every "<head> = <a> words + <b> words"
    # equation. Using `while m = ARITH.match(txt)` with an explicit cursor is
    # deliberate: `txt.scan(ARITH)` followed by Regexp.last_match silently
    # yielded 0 matches, i.e. a check that could never fail.
    flat = txt.gsub(/\s+/, " ")
    pos = 0
    while (m = ARITH.match(flat, pos))
      checked += 1
      head = m[:head].delete(",").to_i
      a = m[:a].delete(",").to_i
      b = m[:b].delete(",").to_i
      unless a + b == head
        findings << "[arithmetic] #{relp}: '#{m[:head]} = #{m[:a]} + #{m[:b]}' " \
                   "but #{m[:a]} + #{m[:b]} = #{a + b} (off by #{(a + b) - head})"
      end
      pos = m.end(0)
      pos += 1 if pos >= flat.length
      break if pos >= flat.length
    end
  end
  puts "  arithmetic: #{checked} banner equation(s) checked"
end

# ---------------------------------------------------------------------------
puts "site preflight: #{ROOT}"
n_fm = frontmatter_findings(ROOT, findings)
liquid_findings(ROOT, findings)
arithmetic_findings(ROOT, findings)

if findings.empty?
  puts "PREFLIGHT PASS - no blocking findings"
  exit 0
else
  puts ""
  puts "PREFLIGHT FAIL - #{findings.size} blocking finding(s):"
  findings.each { |f| puts "  #{f}" }
  exit 1
end
