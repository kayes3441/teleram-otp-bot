# Complete Hostinger VPS Setup - Ubuntu 24.04

**Ready-to-use setup guide for Hostinger VPS with Ubuntu 24.04**

---

## 📋 Prerequisites

- Hostinger VPS with Ubuntu 24.04 LTS
- SSH access to your VPS
- Your Telegram Bot Token
- Your SMS login credentials

---

## 🚀 Quick Setup (Copy & Paste)

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
# Enter password when prompted
```

### Step 2: Update System

```bash
apt update && apt upgrade -y
apt install -y curl wget git nano
```

### Step 3: Upload Bot Files

**Option A: Using Git (Recommended)**
```bash
cd /opt
git clone YOUR_GITHUB_REPO_URL teleram-otp-bot
cd teleram-otp-bot
```

**Option B: Using SCP (from your local machine)**
```bash
# On your local machine:
cd /path/to/teleram-otp-bot
scp -r * root@your-vps-ip:/opt/teleram-otp-bot/
```

**Option C: Using FileZilla (SFTP)**
- Connect to VPS via SFTP
- Upload all files to `/opt/teleram-otp-bot/`

### Step 4: Run Installation

```bash
cd /opt/teleram-otp-bot
chmod +x install.sh
sudo ./install.sh
```

**Wait 5-10 minutes for installation to complete**

### Step 5: Configure Bot Token

```bash
nano telegramNumberBot.js
```

Find line 13 and update:
```javascript
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
```

Save: `Ctrl+X`, then `Y`, then `Enter`

**OR use environment variable:**
```bash
nano /etc/systemd/system/telegram-otp-bot.service
```

Add after `Environment="USE_EXTERNAL_CHROME=true"`:
```
Environment="TELEGRAM_BOT_TOKEN=your-bot-token-here"
```

Save and reload:
```bash
systemctl daemon-reload
```

### Step 6: Enable Services

```bash
systemctl enable chrome-debug telegram-otp-bot
systemctl daemon-reload
```

### Step 7: Start Chrome Service

```bash
systemctl start chrome-debug
sleep 5
curl http://localhost:9222/json/version
# Should return Chrome version info
```

### Step 8: Login to SMS Portal (One-Time)

**Method 1: Using Python Script (Recommended)**
```bash
cd /opt/teleram-otp-bot
python3 login_test.py
```

This will:
- Login to SMS portal
- Save cookies to `cookies.json`
- Keep session active

**Method 2: Using Node.js Login Script**
```bash
cd /opt/teleram-otp-bot
npm run login
```

**Method 3: Using Chrome Helper Script**
```bash
cd /opt/teleram-otp-bot
chmod +x login_chrome.sh
./login_chrome.sh
```

Follow the prompts to login.

### Step 9: Start Bot

```bash
systemctl start telegram-otp-bot
```

### Step 10: Check Status

```bash
# Check bot status
systemctl status telegram-otp-bot

# Check Chrome status
systemctl status chrome-debug

# View bot logs
journalctl -u telegram-otp-bot -f
# Press Ctrl+C to exit
```

---

## ✅ Verification

### Test Bot

1. Open Telegram
2. Find your bot
3. Send `/start`
4. Bot should respond

### Check Logs

```bash
# View recent bot logs
journalctl -u telegram-otp-bot -n 50

# View Chrome logs
journalctl -u chrome-debug -n 50

# Follow logs in real-time
journalctl -u telegram-otp-bot -f
```

### Expected Log Messages

**Bot logs should show:**
```
✅ Bot is running...
✅ Connected to Chrome at http://localhost:9222
🍪 Loading saved cookies for session persistence...
✅ Already logged in! Skipping login process.
```

---

## 🔄 Useful Commands

### Restart Services
```bash
systemctl restart telegram-otp-bot
systemctl restart chrome-debug
```

### Stop Services
```bash
systemctl stop telegram-otp-bot
systemctl stop chrome-debug
```

### View Logs
```bash
# Bot logs
journalctl -u telegram-otp-bot -f

# Chrome logs
journalctl -u chrome-debug -f

# Last 100 lines
journalctl -u telegram-otp-bot -n 100
```

### Check Service Status
```bash
systemctl status telegram-otp-bot
systemctl status chrome-debug
```

---

## 🍪 Cookie Persistence

The bot now supports cookie persistence:

1. **First Run:** Bot auto-logins and saves cookies
2. **Subsequent Runs:** Bot loads cookies and stays logged in
3. **If Cookies Expire:** Bot auto-logins again

**Cookies are saved in:** `/opt/teleram-otp-bot/cookies.json`

**To refresh cookies:**
```bash
cd /opt/teleram-otp-bot
npm run login
```

---

## 🐛 Troubleshooting

### Bot Not Starting?

```bash
# Check logs
journalctl -u telegram-otp-bot -n 100

# Check if Node.js is installed
node --version

# Check if dependencies are installed
cd /opt/teleram-otp-bot
npm list
```

### Chrome Not Starting?

```bash
# Check Chrome logs
journalctl -u chrome-debug -n 100

# Check if Chrome is installed
google-chrome --version

# Verify Chrome debugging port
curl http://localhost:9222/json/version
```

### Login Not Working?

```bash
# Re-login using Node.js script
cd /opt/teleram-otp-bot
npm run login

# Or use the helper script
./login_chrome.sh
```

### Bot Token Not Working?

1. Verify token in `telegramNumberBot.js` or service file
2. Check bot logs for authentication errors
3. Make sure token is correct (no extra spaces)

---

## 🔐 Security

### Firewall Setup

```bash
# Allow SSH (important!)
ufw allow 22/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### Update System Regularly

```bash
apt update && apt upgrade -y
```

---

## 📝 Notes

- **Services auto-start on reboot** (after Step 6)
- **Bot auto-restarts if it crashes**
- **Cookies persist between restarts**
- **Check logs regularly** to ensure everything works

---

## 🎉 Done!

Your bot is now running on Hostinger VPS!

**The bot will:**
- ✅ Start automatically on server reboot
- ✅ Restart automatically if it crashes
- ✅ Run 24/7
- ✅ Stay logged in using cookies
- ✅ Handle SMS scraping
- ✅ Respond to Telegram commands

**Enjoy your bot! 🚀**

---

## 📞 Need Help?

1. Check logs: `journalctl -u telegram-otp-bot -n 100`
2. Verify services are running: `systemctl status telegram-otp-bot`
3. Check Hostinger VPS status in control panel
4. Review this guide step by step

