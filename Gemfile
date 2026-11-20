source "https://rubygems.org"

# github-pages gem includes Jekyll, minima theme, and all standard plugins
# 233 (2026-11-19): jekyll-remote-theme 0.6.2 allows rubyzip >= 3.4 (path-traversal fix);
# 232 pinned rubyzip < 3.0. Jekyll stays 3.10.0.
gem "github-pages", "~> 233"

# Security updates (override github-pages pinned versions)
# Floors raised 2026-11-19 per Dependabot (14 rubygems alerts: addressable 6, activesupport 4, nokogiri 3)
gem "nokogiri", ">= 1.19.5"
gem "addressable", ">= 2.9.2"
# json/openssl: NO precompiled Windows binaries exist on rubygems.org (checked all 253 json /
# 55 openssl versions 2026-11-19). On this devkit-less host they MUST stay pinned to Ruby 3.3's
# DEFAULT-gem versions so bundler uses the prebuilt defaults instead of native builds.
# If bundler ever tries to build them: cleanup partial specs, then re-lock (see skill).
gem "json", "2.7.2"
gem "openssl", "3.2.4"
gem "minitest", "6.0.6"                  # pin installed version: 6.1.0 binstub write needs admin on C:/Ruby33-x64/bin
gem "rubyzip", ">= 3.4.0"                # Dependabot 2026-11-19: path traversal < 3.4.0 (high)
gem "uri", ">= 1.0.4"
gem "faraday", ">= 2.14.1"
gem "activesupport", "~> 7.2.3"   # 7.2.3.1 closes 3 medium Dependabot alerts. 8.x (fixes the 1 high,
                                  # safe_constantize DoS) hard-requires json >= 3.0.2: no Windows binary,
                                  # cannot build here. High accepted as build-time-only risk 2026-11-19.

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
