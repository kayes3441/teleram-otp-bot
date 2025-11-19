# Complete Hostinger VPS Setup Guide

This guide will help you set up your Telegram OTP Bot on Hostinger VPS from scratch.

---

## 📋 Prerequisites

- Hostinger VPS account (any plan works, VPS 1 is sufficient)
- Your Telegram Bot Token
- SSH client (Windows: PuTTY or PowerShell, Mac/Linux: Terminal)
- Basic terminal knowledge

---

## Step 1: Purchase & Access Hostinger VPS

### 1.1 Purchase VPS
1. Go to: https://www.hostinger.com/vps-hosting
2. Choose **VPS 1** plan (or higher if needed)
3. Select **Ubuntu 22.04 LTS** as operating system
4. Complete purchase

### 1.2 Get VPS Details
After purchase, you'll receive:
- **VPS IP Address**: `xxx.xxx.xxx.xxx`
- **Root Password**: (check your email or Hostinger panel)
- **SSH Port**: Usually `22`

### 1.3 Access VPS via SSH

**Windows (PowerShell):**
```powershell
ssh root@your-vps-ip
# Enter password when prompted
```

**Windows (PuTTY):**
1. Download PuTTY: https://www.putty.org/
2. Enter IP address
3. Port: 22
4. Click "Open"
5. Login: `root`
6. Enter password

**Mac/Linux:**
```bash
ssh root@your-vps-ip
# Enter password when prompted
```

---

## Step 2: Initial Server Setup

Once connected, run these commands:

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git nano ufw

# Set timezone (optional, adjust to your timezone)
timedatectl set-timezone Asia/Dhaka

# Check system info
uname -a
```

---

## Step 3: Upload Your Bot Files

### Option A: Using SCP (from your local computer)

**Windows (PowerShell):**
```powershell
# Navigate to your bot folder
cd path\to\teleram-otp-bot

# Upload entire folder
scp -r * root@your-vps-ip:/opt/teleram-otp-bot/
```

**Mac/Linux:**
```bash
# Navigate to your bot folder
cd ~/path/to/teleram-otp-bot

# Upload entire folder
scp -r * root@your-vps-ip:/opt/teleram-otp-bot/
```

### Option B: Using Git (if you have a repository)

```bash
# On VPS
cd /opt
git clone your-repo-url teleram-otp-bot
cd teleram-otp-bot
```

### Option C: Using FileZilla (SFTP)

1. Download FileZilla: https://filezilla-project.org/
2. Connect to your VPS:
   - Host: `sftp://your-vps-ip`
   - Username: `root`
   - Password: your root password
   - Port: `22`
3. Upload all bot files to `/opt/teleram-otp-bot/`

---

## Step 4: Navigate to Project Directory

```bash
cd /opt/teleram-otp-bot
ls -la  # Verify files are there
```

---

## Step 5: Make Scripts Executable

```bash
chmod +x install.sh start_chrome_debug_linux.sh login_chrome.sh
```

---

## Step 6: Run Installation Script

```bash
./install.sh
```

**This will install:**
- Node.js
- Google Chrome
- ChromeDriver
- npm dependencies
- Other required packages

**Wait for installation to complete (5-10 minutes)**

---

## Step 7: Verify Installation

```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check Chrome
google-chrome --version
# Should show Chrome version

# Check ChromeDriver
chromedriver --version
# Should show ChromeDriver version
```

---

## Step 8: Configure Bot Token

### Option A: Edit the file directly

```bash
nano telegramNumberBot.js
```

Find line 13 and update:
```javascript
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Option B: Use environment variable (recommended)

```bash
# Create .env file
nano .env
```

Add:
```
TELEGRAM_BOT_TOKEN=your-bot-token-here
USE_EXTERNAL_CHROME=true
SMS_USERNAME=mhmehedi007
SMS_PASSWORD=##2023@@$$
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 9: Install Project Dependencies

```bash
cd /opt/teleram-otp-bot
npm install
```

---

## Step 10: Copy Systemd Service Files

```bash
# Copy bot service
cp telegram-otp-bot.service /etc/systemd/system/

# Copy Chrome service
cp chrome-debug.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload
```

---

## Step 11: Enable Services (Auto-start on boot)

```bash
# Enable Chrome service
systemctl enable chrome-debug

# Enable Bot service
systemctl enable telegram-otp-bot
```

---

## Step 12: Start Chrome Service

```bash
systemctl start chrome-debug

# Wait 5 seconds
sleep 5

# Verify Chrome is running
curl http://localhost:9222/json/version
# Should return Chrome version info
```

---

## Step 13: Login to Chrome (One-time Setup)

### Option A: Using the helper script

```bash
./login_chrome.sh
```

Follow the prompts:
1. Script will check if Chrome is running
2. It will guide you to login
3. Login to: http://185.2.83.39/ints/agent/SMSCDRStats
4. Enter your credentials
5. Press Enter after logging in

### Option B: Manual login

```bash
# Stop Chrome service temporarily
systemctl stop chrome-debug

# Start Chrome manually (if you have GUI access)
# Or use the script above
```

**Note:** Since Hostinger VPS is headless (no GUI), use Option A (the script) which handles this automatically.

---

## Step 14: Start Bot Service

```bash
systemctl start telegram-otp-bot
```

---

## Step 15: Check Bot Status

```bash
# Check bot status
systemctl status telegram-otp-bot

# Check Chrome status
systemctl status chrome-debug

# View bot logs
journalctl -u telegram-otp-bot -f
# Press Ctrl+C to exit

# View Chrome logs
journalctl -u chrome-debug -f
# Press Ctrl+C to exit
```

---

## Step 16: Test Bot

1. Open Telegram
2. Find your bot
3. Send `/start` command
4. Bot should respond

---

## Step 17: Configure Firewall (Optional but Recommended)

```bash
# Allow SSH (important!)
ufw allow 22/tcp

# Allow bot port if needed (usually not required for Telegram bot)
# ufw allow 8810/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## ✅ Setup Complete!

Your bot should now be running on Hostinger VPS!

---

## 🔄 Useful Commands

### Restart Bot:
```bash
systemctl restart telegram-otp-bot
```

### Restart Chrome:
```bash
systemctl restart chrome-debug
```

### Stop Bot:
```bash
systemctl stop telegram-otp-bot
```

### Stop Chrome:
```bash
systemctl stop chrome-debug
```

### View Bot Logs:
```bash
# Last 50 lines
journalctl -u telegram-otp-bot -n 50

# Follow logs in real-time
journalctl -u telegram-otp-bot -f
```

### View Chrome Logs:
```bash
journalctl -u chrome-debug -n 50
```

### Check if Services are Running:
```bash
systemctl is-active telegram-otp-bot
systemctl is-active chrome-debug
```

---

## 🐛 Troubleshooting

### Bot not starting?

```bash
# Check logs
journalctl -u telegram-otp-bot -n 100

# Check if Node.js is installed
node --version

# Check if dependencies are installed
cd /opt/teleram-otp-bot
npm list
```

### Chrome not starting?

```bash
# Check Chrome logs
journalctl -u chrome-debug -n 100

# Check if Chrome is installed
google-chrome --version

# Try starting manually
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile --headless=new
```

### Can't connect via SSH?

1. Check Hostinger control panel for IP address
2. Verify firewall allows port 22
3. Check if VPS is running in Hostinger panel

### Bot token not working?

1. Verify token in `telegramNumberBot.js` or `.env` file
2. Make sure token is correct (no extra spaces)
3. Check bot logs for authentication errors

### SMS scraping not working?

1. Make sure you logged in manually using `./login_chrome.sh`
2. Check Chrome service is running: `systemctl status chrome-debug`
3. Verify Chrome debugging: `curl http://localhost:9222/json/version`
4. Check bot logs for scraper errors

---

## 📝 Notes

- **VPS must stay running** for bot to work
- Services will **auto-start on reboot** (after Step 11)
- Bot will **auto-restart if it crashes** (systemd handles this)
- **Check logs regularly** to ensure everything is working
- **Backup your bot files** periodically

---

## 🔐 Security Tips

1. **Change default SSH port** (optional but recommended)
2. **Use SSH keys instead of password** (more secure)
3. **Keep system updated**: `apt update && apt upgrade`
4. **Don't share your bot token** publicly
5. **Use firewall** to restrict access

---

## 📞 Support

If you encounter issues:
1. Check the logs: `journalctl -u telegram-otp-bot -n 100`
2. Verify all services are running
3. Check Hostinger VPS status in their control panel
4. Review this guide step by step

---

## 🎉 Done!

Your Telegram OTP Bot is now running on Hostinger VPS!

The bot will:
- ✅ Start automatically on server reboot
- ✅ Restart automatically if it crashes
- ✅ Run 24/7
- ✅ Handle SMS scraping
- ✅ Respond to Telegram commands

Enjoy your bot! 🚀

