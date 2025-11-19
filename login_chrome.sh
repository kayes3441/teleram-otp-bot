#!/bin/bash

# Helper script to login to Chrome for SMS scraping
# This script helps you login to the SMS portal in Chrome

CHROME_PROFILE_DIR="/tmp/chrome-debug-profile"
SMS_PORTAL_URL="http://185.2.83.39/ints/agent/SMSCDRStats"

echo "🔐 Chrome Login Helper"
echo "======================"
echo ""

# Check if Chrome is already running with debugging
if curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
    echo "✅ Chrome is already running with remote debugging"
    echo ""
    echo "To login:"
    echo "1. Open Chrome on your local machine"
    echo "2. Navigate to: chrome://inspect"
    echo "3. Click 'Open dedicated DevTools for Node'"
    echo "4. Or use: google-chrome --remote-debugging-port=9222 --user-data-dir=$CHROME_PROFILE_DIR"
    echo ""
    read -p "Press Enter to open Chrome with the profile..."
    
    # Try to open Chrome (works if X11 forwarding or display available)
    if [ -n "$DISPLAY" ] || command -v google-chrome &> /dev/null; then
        google-chrome --remote-debugging-port=9222 --user-data-dir="$CHROME_PROFILE_DIR" "$SMS_PORTAL_URL" &
        echo "✅ Chrome opened. Please login and then close the window."
    else
        echo "⚠️ No display available. Please login manually:"
        echo "   google-chrome --remote-debugging-port=9222 --user-data-dir=$CHROME_PROFILE_DIR"
    fi
else
    echo "⚠️ Chrome is not running with remote debugging"
    echo ""
    echo "Starting Chrome for login..."
    
    # Stop the service if running
    if systemctl is-active --quiet chrome-debug; then
        echo "Stopping chrome-debug service..."
        sudo systemctl stop chrome-debug
        sleep 2
    fi
    
    # Start Chrome manually
    echo "Starting Chrome..."
    google-chrome \
      --remote-debugging-port=9222 \
      --user-data-dir="$CHROME_PROFILE_DIR" \
      --no-first-run \
      --no-default-browser-check \
      "$SMS_PORTAL_URL" &
    
    CHROME_PID=$!
    sleep 3
    
    echo "✅ Chrome started (PID: $CHROME_PID)"
    echo ""
    echo "📋 Please:"
    echo "1. Login to the SMS portal in the Chrome window that opened"
    echo "2. Navigate to: $SMS_PORTAL_URL"
    echo "3. Enter your credentials"
    echo "4. Once logged in, close Chrome (profile will be saved)"
    echo ""
    read -p "Press Enter after you've logged in and closed Chrome..."
    
    # Kill Chrome
    kill $CHROME_PID 2>/dev/null || true
    sleep 2
    
    echo ""
    echo "✅ Login complete! Profile saved to: $CHROME_PROFILE_DIR"
    echo ""
    echo "Now start the chrome-debug service:"
    echo "  sudo systemctl start chrome-debug"
fi

