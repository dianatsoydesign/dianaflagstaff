#!/usr/bin/env bash
# Schedule scripts/push-charisma-stock.mjs to run every hour on this Mac.
#
#   bash scripts/install-charisma-push.sh https://diana-flagstaff.dianatsoydesign.workers.dev
#   bash scripts/install-charisma-push.sh --uninstall
#
# Asks for CRON_SECRET (the same value set on the Worker with
# `npx wrangler secret put CRON_SECRET`). It is stored only in the launchd
# job file in ~/Library/LaunchAgents, readable by this user alone.
# Runs while the Mac is awake; a run missed during sleep happens on wake.
# Log: ~/Library/Logs/diana-flagstaff-charisma.log

set -euo pipefail

LABEL="com.dianaflagstaff.charisma-stock"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/diana-flagstaff-charisma.log"

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed hourly Charisma stock check."
  exit 0
fi

SITE_URL="${1:?Usage: install-charisma-push.sh <SITE_URL> | --uninstall}"
SCRIPT="$(cd "$(dirname "$0")" && pwd)/push-charisma-stock.mjs"
NODE="$(command -v node)" || { echo "Node.js is required" >&2; exit 1; }

read -r -s -p "CRON_SECRET: " CRON_SECRET
echo
[ -n "$CRON_SECRET" ] || { echo "CRON_SECRET is required" >&2; exit 1; }

xml_escape() {
  local s="$1"
  s="${s//&/&amp;}"; s="${s//</&lt;}"; s="${s//>/&gt;}"
  printf '%s' "$s"
}

mkdir -p "$(dirname "$PLIST")" "$(dirname "$LOG")"
umask 077
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(xml_escape "$NODE")</string>
    <string>$(xml_escape "$SCRIPT")</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>SITE_URL</key><string>$(xml_escape "$SITE_URL")</string>
    <key>CRON_SECRET</key><string>$(xml_escape "$CRON_SECRET")</string>
  </dict>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$(xml_escape "$LOG")</string>
  <key>StandardErrorPath</key><string>$(xml_escape "$LOG")</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Hourly Charisma stock check installed. First run is happening now."
echo "Log: $LOG"
