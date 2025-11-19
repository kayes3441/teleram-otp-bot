# VPS Setup Workflow - Complete Steps

**Exact workflow for Hostinger VPS Ubuntu 24.04**

---

## 📋 Complete Workflow

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Update System
```bash
apt update && apt upgrade -y
apt install -y curl wget git nano
```

### 3. Upload Bot Files
```bash
# Option A: Git
cd /opt
git clone YOUR_REPO_URL teleram-otp-bot
cd teleram-otp-bot

# Option B: SCP (from local machine)
scp -r * root@your-vps-ip:/opt/teleram-otp-bot/
```

### 4. Run Installation Script
```bash
cd /opt/teleram-otp-bot
chmod +x install.sh
sudo ./install.sh
```

**This installs:**
- ✅ Node.js 20.x
- ✅ Google Chrome
- ✅ ChromeDriver
- ✅ Python 3
- ✅ Selenium (via pip)
- ✅ npm dependencies
- ✅ Xvfb for headless operation
- ✅ Systemd services

### 5. Configure Bot Token
```bash
nano telegramNumberBot.js
# Update line 13 with your bot token
```

### 6. Enable Services
```bash
systemctl enable chrome-debug telegram-otp-bot
systemctl daemon-reload
```

### 7. Start Chrome Service
```bash
systemctl start chrome-debug
sleep 5
curl http://localhost:9222/json/version
# Should return Chrome version info
```

### 8. Login Using Python Script (IMPORTANT!)
```bash
cd /opt/teleram-otp-bot
python3 login_test.py
```

**This will:**
- ✅ Login to SMS portal
- ✅ Solve math CAPTCHA
- ✅ Save cookies to `cookies.json`
- ✅ Keep session active

**Wait for script to complete!**

### 9. Start Bot
```bash
systemctl start telegram-otp-bot
```

### 10. Check Status
```bash
systemctl status telegram-otp-bot
journalctl -u telegram-otp-bot -f
```

---

## ✅ Verification

### Check Bot Logs
```bash
journalctl -u telegram-otp-bot -n 50
```

**Look for:**
```
✅ Bot is running...
✅ Connected to Chrome at http://localhost:9222
🍪 Loading saved cookies for session persistence...
✅ Already logged in! Skipping login process.
```

### Test Bot in Telegram
1. Open Telegram
2. Find your bot
3. Send `/start`
4. Bot should respond

---

## 🔄 Workflow Summary

```
1. Install everything → sudo ./install.sh
2. Configure bot token → nano telegramNumberBot.js
3. Enable services → systemctl enable ...
4. Start Chrome → systemctl start chrome-debug
5. Login with Python → python3 login_test.py (SAVES COOKIES)
6. Start bot → systemctl start telegram-otp-bot
7. Done! ✅
```

---

## 🍪 Cookie Persistence

**After running `python3 login_test.py`:**
- Cookies saved to `cookies.json`
- Bot loads cookies automatically
- No need to login again
- Session persists across restarts

**To refresh cookies:**
```bash
python3 login_test.py
# OR
npm run login
```

---

## 🆘 Troubleshooting

### Python/Selenium Not Installed?
```bash
apt install -y python3 python3-pip
pip3 install selenium webdriver-manager
```

### Login Script Fails?
```bash
# Check if Chrome is running
curl http://localhost:9222/json/version

# Check Python script
python3 login_test.py
```

### Bot Not Starting?
```bash
journalctl -u telegram-otp-bot -n 100
```

---

## 📝 Important Notes

1. **Always run Python login script first** - This saves cookies
2. **Then start the bot** - Bot uses saved cookies
3. **Cookies persist** - No need to login every time
4. **If cookies expire** - Run `python3 login_test.py` again

---

**Follow this workflow and your bot will work perfectly! 🚀**

