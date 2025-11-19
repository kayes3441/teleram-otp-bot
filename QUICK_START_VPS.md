# Quick Start - Hostinger VPS Ubuntu 24.04

**Fastest way to get your bot running on VPS**

---

## 🚀 One-Command Setup (After Uploading Files)

```bash
cd /opt/teleram-otp-bot && chmod +x install.sh && sudo ./install.sh
```

---

## 📋 Complete Step-by-Step

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Upload Files
```bash
# Option A: Git
cd /opt && git clone YOUR_REPO_URL teleram-otp-bot && cd teleram-otp-bot

# Option B: SCP (from local machine)
scp -r * root@your-vps-ip:/opt/teleram-otp-bot/
```

### 3. Install Everything
```bash
cd /opt/teleram-otp-bot
chmod +x install.sh
sudo ./install.sh
```

### 4. Configure Bot Token
```bash
nano telegramNumberBot.js
# Update line 13 with your bot token
```

### 5. Enable Services
```bash
systemctl enable chrome-debug telegram-otp-bot
systemctl daemon-reload
```

### 6. Start Chrome
```bash
systemctl start chrome-debug
sleep 5
curl http://localhost:9222/json/version
```

### 7. Login (One-Time)
```bash
cd /opt/teleram-otp-bot
python3 login_test.py
# This logs in and saves cookies to cookies.json
# OR use: npm run login
```

### 8. Start Bot
```bash
systemctl start telegram-otp-bot
```

### 9. Check Status
```bash
systemctl status telegram-otp-bot
journalctl -u telegram-otp-bot -f
```

---

## ✅ Done!

Your bot is now running! Test it in Telegram with `/start`

---

## 🔄 Common Commands

```bash
# Restart bot
systemctl restart telegram-otp-bot

# View logs
journalctl -u telegram-otp-bot -f

# Check status
systemctl status telegram-otp-bot
```

---

**For detailed guide, see: `VPS_UBUNTU_24.04_COMPLETE_SETUP.md`**

