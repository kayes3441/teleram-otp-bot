#!/bin/bash

# Script to start Chrome with remote debugging for SMS scraping on Linux
# This is the Linux version of start_chrome_debug.sh

set -e

echo "🚀 Starting Chrome with remote debugging..." >&2

# Kill any existing Chrome instances with remote debugging
echo "Closing existing Chrome instances..." >&2
pkill -f "chrome.*remote-debugging" 2>/dev/null || true
sleep 2

# Set display for headless operation (if Xvfb is installed)
export DISPLAY=:99

# Start Xvfb if not running (for headless operation)
if ! pgrep -x "Xvfb" > /dev/null; then
    echo "Starting Xvfb for headless operation..." >&2
    Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
    sleep 2
fi

# Chrome profile directory
CHROME_PROFILE_DIR="/tmp/chrome-debug-profile"

# Create profile directory if it doesn't exist
mkdir -p "$CHROME_PROFILE_DIR"

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null; then
    echo "❌ Error: google-chrome not found. Please install Chrome first." >&2
    exit 1
fi

# Start Chrome with remote debugging
echo "Starting Chrome on port 9222..." >&2
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$CHROME_PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-software-rasterizer \
  --disable-extensions \
  --no-sandbox \
  --headless=new \
  --window-size=1920,1080 \
  http://185.2.83.39/ints/agent/SMSCDRStats \
  > /dev/null 2>&1 &

CHROME_PID=$!
sleep 5

# Check if Chrome started
if ! ps -p $CHROME_PID > /dev/null 2>&1; then
    echo "❌ Failed to start Chrome (process died immediately)" >&2
    exit 1
fi

echo "✅ Chrome started successfully (PID: $CHROME_PID)" >&2

# Wait for Chrome to be ready
echo "Waiting for Chrome debugging port..." >&2
for i in {1..30}; do
    if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
        echo "✅ Chrome debugging port is ready!" >&2
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️ Warning: Chrome debugging port not ready after 30 seconds" >&2
    fi
    sleep 1
done

# Keep script running and monitor Chrome
while ps -p $CHROME_PID > /dev/null 2>&1; do
    sleep 5
done

echo "❌ Chrome process died unexpectedly" >&2
exit 1

