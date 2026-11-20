source "https://rubygems.org"

# github-pages gem includes Jekyll, minima theme, and all standard plugins
# 233 (2026-11-19): jekyll-remote-theme 0.6.2 allows rubyzip >= 3.4 (path-traversal fix);
# 232 pinned rubyzip < 3.0. Jekyll stays 3.10.0.
gem "github-pages", "~> 233"

# Security updates (override github-pages pinned versions)
# Floors raised 2026-11-19 per Dependabot (14 rubygems alerts: addressable 6, activesupport 4, nokogiri 3)
gem "nokogiri", ">= 1.19.5"
gem "addressable", ">= 2.9.2"
gem "json", "2.7.2"                      # Ruby 3.3 default gem; newer 2.x/3.x have no precompiled Windows gem and fail to build here. Not in Dependabot alerts — safe to pin.
gem "openssl", "3.2.4"                   # Ruby 3.3 default gem; jekyll-remote-theme 0.6.2 needs >= 3.1.2 — pin default so no native build (no devkit on this host)
gem "minitest", "6.0.6"                  # pin installed version: 6.1.0 binstub write needs admin on C:/Ruby33-x64/bin
gem "rubyzip", ">= 3.4.0"                # Dependabot 2026-11-19: path traversal < 3.4.0 (high)
gem "uri", ">= 1.0.4"
gem "faraday", ">= 2.14.1"
gem "activesupport", "~> 7.1.6"   # 8.x hard-requires json >= 3.0.2, which has no Windows binary and cannot build here

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
