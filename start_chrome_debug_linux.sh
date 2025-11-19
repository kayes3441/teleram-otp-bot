#!/bin/bash

# Script to start Chrome with remote debugging for SMS scraping on Linux
# This is the Linux version of start_chrome_debug.sh

echo "🚀 Starting Chrome with remote debugging..."

# Kill any existing Chrome instances with remote debugging
echo "Closing existing Chrome instances..."
pkill -f "chrome.*remote-debugging" 2>/dev/null || true
sleep 2

# Set display for headless operation (if Xvfb is installed)
export DISPLAY=:99

# Start Xvfb if not running (for headless operation)
if ! pgrep -x "Xvfb" > /dev/null; then
    echo "Starting Xvfb for headless operation..."
    Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
    sleep 2
fi

# Chrome profile directory
CHROME_PROFILE_DIR="/tmp/chrome-debug-profile"

# Create profile directory if it doesn't exist
mkdir -p "$CHROME_PROFILE_DIR"

# Start Chrome with remote debugging
echo "Starting Chrome on port 9222..."
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
if ps -p $CHROME_PID > /dev/null 2>&1; then
    echo "✅ Chrome started successfully (PID: $CHROME_PID)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Chrome is running in headless mode"
    echo "2. You may need to login manually by:"
    echo "   - Opening Chrome with: google-chrome --remote-debugging-port=9222 --user-data-dir=$CHROME_PROFILE_DIR"
    echo "   - Navigate to: http://185.2.83.39/ints/agent/SMSCDRStats"
    echo "   - Login with your credentials"
    echo "   - Close the window (Chrome will keep running in background)"
    echo "3. Or use the automated login script (if configured)"
    echo ""
    echo "🔍 Verify debugging is working:"
    echo "   curl http://localhost:9222/json/version"
    echo ""
    
    # Wait for Chrome to be ready
    for i in {1..30}; do
        if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
            echo "✅ Chrome debugging port is ready!"
            break
        fi
        sleep 1
    done
    
    # Keep script running
    wait $CHROME_PID
else
    echo "❌ Failed to start Chrome"
    exit 1
fi

