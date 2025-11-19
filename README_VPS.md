# Hostinger VPS Setup - Complete Guide

**Everything you need to deploy your Telegram OTP Bot on Hostinger VPS with Ubuntu 24.04**

---

## 📚 Documentation Files

1. **`QUICK_START_VPS.md`** - Fastest setup (5 minutes)
2. **`VPS_UBUNTU_24.04_COMPLETE_SETUP.md`** - Complete detailed guide
3. **`HOSTINGER_VPS_SETUP.md`** - Original setup guide (updated for Ubuntu 24.04)
4. **`COMMANDS_VPS.md`** - Step-by-step commands

---

## 🚀 Quick Start

```bash
# 1. Connect to VPS
ssh root@your-vps-ip

# 2. Upload files (Git or SCP)
cd /opt && git clone YOUR_REPO_URL teleram-otp-bot && cd teleram-otp-bot

# 3. Install everything
chmod +x install.sh && sudo ./install.sh

# 4. Configure bot token
nano telegramNumberBot.js  # Update line 13

# 5. Enable services
systemctl enable chrome-debug telegram-otp-bot
systemctl daemon-reload

# 6. Start Chrome
systemctl start chrome-debug

# 7. Login (one-time)
npm run login

# 8. Start bot
systemctl start telegram-otp-bot

# 9. Check status
systemctl status telegram-otp-bot
```

---

## ✅ What's Included

- ✅ **Auto-installation script** - Installs everything automatically
- ✅ **Cookie persistence** - Login once, stay logged in
- ✅ **Auto-restart** - Bot restarts if it crashes
- ✅ **Auto-start on boot** - Bot starts when server reboots
- ✅ **Systemd services** - Professional service management
- ✅ **Ubuntu 24.04 compatible** - Tested and working

---

## 📋 Requirements

- Hostinger VPS with Ubuntu 24.04 LTS
- SSH access
- Telegram Bot Token
- SMS login credentials

---

## 🔧 Features

### Cookie Persistence
- Login once with `npm run login`
- Cookies saved to `cookies.json`
- Bot uses cookies automatically
- No need to login every time

### Auto-Login
- Bot can auto-login if cookies expire
- Saves new cookies automatically
- Seamless experience

### Service Management
- Professional systemd services
- Auto-restart on failure
- Auto-start on boot
- Easy log viewing

---

## 📖 Full Documentation

See **`VPS_UBUNTU_24.04_COMPLETE_SETUP.md`** for complete guide.

---

## 🆘 Troubleshooting

### Bot Not Starting?
```bash
journalctl -u telegram-otp-bot -n 100
```

### Chrome Not Starting?
```bash
journalctl -u chrome-debug -n 100
curl http://localhost:9222/json/version
```

### Need to Re-login?
```bash
cd /opt/teleram-otp-bot
npm run login
```

---

## 🎉 Ready to Deploy!

Follow **`QUICK_START_VPS.md`** for fastest setup, or **`VPS_UBUNTU_24.04_COMPLETE_SETUP.md`** for detailed guide.

**Your bot will be running in minutes! 🚀**

