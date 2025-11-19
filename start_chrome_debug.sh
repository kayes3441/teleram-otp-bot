#!/bin/bash

# Script to start Chrome with remote debugging for SMS scraping

echo "🚀 Starting Chrome with remote debugging..."

# Kill any existing Chrome instances
echo "Closing existing Chrome instances..."
pkill -f "Google Chrome" 2>/dev/null
sleep 2

# Start Chrome with remote debugging
echo "Starting Chrome on port 9222..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="/tmp/chrome-debug-profile" \
  --no-first-run \
  --no-default-browser-check \
  > /dev/null 2>&1 &

CHROME_PID=$!
sleep 3

# Check if Chrome started
if ps -p $CHROME_PID > /dev/null; then
    echo "✅ Chrome started successfully (PID: $CHROME_PID)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Chrome should open automatically"
    echo "2. Navigate to: http://185.2.83.39/ints/agent/SMSCDRStats"
    echo "3. Login with your credentials:"
    echo "   Username: mhmehedi007"
    echo "   Password: 2023@@$$"
    echo "4. Keep Chrome open and return to start the bot"
    echo ""
    echo "🔍 Verify debugging is working:"
    echo "   curl http://localhost:9222/json/version"
else
    echo "❌ Failed to start Chrome"
    exit 1
fi

