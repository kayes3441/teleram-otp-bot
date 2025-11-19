#!/bin/bash

# Telegram OTP Bot Installation Script for Ubuntu 24.04 LTS
# Run with: sudo ./install.sh

set -e

echo "=========================================="
echo "Telegram OTP Bot - Ubuntu Installation"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" != "x86_64" ]; then
    echo "⚠️ Warning: This script is optimized for x86_64. Proceeding anyway..."
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install basic dependencies
echo "📦 Installing basic dependencies..."
apt-get install -y curl wget unzip git build-essential

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Verify Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js installation failed"
    exit 1
fi

echo "✅ Node.js installed: $(node --version)"
echo "✅ npm installed: $(npm --version)"

# Install Google Chrome
echo "📦 Installing Google Chrome..."
if ! command -v google-chrome &> /dev/null; then
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
    apt-get update
    apt-get install -y google-chrome-stable
else
    echo "✅ Chrome already installed: $(google-chrome --version)"
fi

# Verify Chrome installation
if ! command -v google-chrome &> /dev/null; then
    echo "❌ Chrome installation failed"
    exit 1
fi

echo "✅ Chrome installed: $(google-chrome --version)"

# Install ChromeDriver
echo "📦 Installing ChromeDriver..."
if ! command -v chromedriver &> /dev/null; then
    CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | cut -d. -f1)
    echo "Detected Chrome version: $CHROME_VERSION"
    
    # Get latest ChromeDriver version
    CHROMEDRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_VERSION}" || echo "")
    
    if [ -z "$CHROMEDRIVER_VERSION" ]; then
        echo "⚠️ Could not fetch ChromeDriver version, using fallback method..."
        CHROMEDRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json" | grep -oP '"version":\s*"\K[^"]+' | head -1)
    fi
    
    echo "Installing ChromeDriver version: $CHROMEDRIVER_VERSION"
    
    wget -q "https://storage.googleapis.com/chrome-for-testing-public/${CHROMEDRIVER_VERSION}/linux64/chromedriver-linux64.zip" -O /tmp/chromedriver.zip
    unzip -q /tmp/chromedriver.zip -d /tmp/
    mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/
    chmod +x /usr/local/bin/chromedriver
    rm -rf /tmp/chromedriver-linux64 /tmp/chromedriver.zip
else
    echo "✅ ChromeDriver already installed: $(chromedriver --version)"
fi

# Verify ChromeDriver
if ! command -v chromedriver &> /dev/null; then
    echo "❌ ChromeDriver installation failed"
    exit 1
fi

echo "✅ ChromeDriver installed: $(chromedriver --version)"

# Install Xvfb for headless Chrome (optional but recommended)
echo "📦 Installing Xvfb for headless operation..."
apt-get install -y xvfb

# Install project dependencies
echo "📦 Installing project dependencies..."
cd "$(dirname "$0")"
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p /var/log/telegram-otp-bot
mkdir -p /tmp/chrome-debug-profile

# Set permissions
echo "🔐 Setting permissions..."
chown -R $SUDO_USER:$SUDO_USER .
chmod +x start_chrome_debug_linux.sh

# Install systemd services
echo "📦 Installing systemd services..."
if [ -f "telegram-otp-bot.service" ]; then
    cp telegram-otp-bot.service /etc/systemd/system/
    chmod 644 /etc/systemd/system/telegram-otp-bot.service
fi

if [ -f "chrome-debug.service" ]; then
    cp chrome-debug.service /etc/systemd/system/
    chmod 644 /etc/systemd/system/chrome-debug.service
fi

# Reload systemd
systemctl daemon-reload

echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit configuration in telegramNumberBot.js or create .env file"
echo "2. Update Chrome service with your login credentials:"
echo "   sudo nano /etc/systemd/system/chrome-debug.service"
echo "3. Enable and start services:"
echo "   sudo systemctl enable chrome-debug telegram-otp-bot"
echo "   sudo systemctl start chrome-debug"
echo "   sudo systemctl start telegram-otp-bot"
echo "4. Check status:"
echo "   sudo systemctl status telegram-otp-bot"
echo "   sudo systemctl status chrome-debug"
echo ""
echo "View logs:"
echo "   sudo journalctl -u telegram-otp-bot -f"
echo "   sudo journalctl -u chrome-debug -f"
echo ""

