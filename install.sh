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
    # Ubuntu 24.04 compatible method
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
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

# Install Python 3 and pip
echo "📦 Installing Python 3 and pip..."
apt-get install -y python3 python3-pip python3-venv

# Verify Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 installation failed"
    exit 1
fi

echo "✅ Python 3 installed: $(python3 --version)"
echo "✅ pip installed: $(python3 -m pip --version)"

# Install project dependencies
echo "📦 Installing project dependencies..."
cd "$(dirname "$0")"
npm install

# Install Python dependencies (Selenium)
echo "📦 Installing Python dependencies (Selenium)..."
if [ -f "requirements.txt" ]; then
    python3 -m pip install --break-system-packages -r requirements.txt
else
    python3 -m pip install --break-system-packages selenium webdriver-manager
fi

echo "✅ Python dependencies installed"

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
echo "1. Edit configuration in telegramNumberBot.js (update bot token on line 13)"
echo "2. Enable services:"
echo "   sudo systemctl enable chrome-debug telegram-otp-bot"
echo "   sudo systemctl daemon-reload"
echo "3. Start Chrome service:"
echo "   sudo systemctl start chrome-debug"
echo "4. Login using Python script (saves cookies):"
echo "   python3 login_test.py"
echo "   OR"
echo "   npm run login"
echo "5. Start bot:"
echo "   sudo systemctl start telegram-otp-bot"
echo "6. Check status:"
echo "   sudo systemctl status telegram-otp-bot"
echo ""
echo "View logs:"
echo "   sudo journalctl -u telegram-otp-bot -f"
echo "   sudo journalctl -u chrome-debug -f"
echo ""

