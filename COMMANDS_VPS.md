# Step-by-Step Commands for VPS Terminal

Copy and paste these commands **one by one** into your VPS terminal.

## Step 1: Connect to Your VPS

```bash
ssh user@your-server-ip
```
*(Replace `user` with your username and `your-server-ip` with your server IP)*

---

## Step 2: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 3: Navigate to /opt Directory

```bash
cd /opt
```

---

## Step 4: Upload Your Project Files

**Option A: Using SCP (from your local computer terminal):**
```bash
scp -r teleram-otp-bot/ user@your-server-ip:/opt/
```

**Option B: Using Git (on VPS):**
```bash
sudo git clone <your-repo-url> /opt/teleram-otp-bot
```

**Option C: Manual Upload (using SFTP client like FileZilla)**
- Upload the entire `teleram-otp-bot` folder to `/opt/`

---

## Step 5: Navigate to Project Directory

```bash
cd /opt/teleram-otp-bot
```

---

## Step 6: Make Scripts Executable

```bash
sudo chmod +x install.sh start_chrome_debug_linux.sh login_chrome.sh
```

---

## Step 7: Run Installation Script

```bash
sudo ./install.sh
```

*(This will take a few minutes - it installs Node.js, Chrome, ChromeDriver, etc.)*

---

## Step 8: Verify Installation

```bash
node --version
```

```bash
google-chrome --version
```

```bash
chromedriver --version
```

---

## Step 9: Configure Bot Token (IMPORTANT!)

Edit the bot token in the main file:

```bash
sudo nano telegramNumberBot.js
```

*Find line 13 and update `TELEGRAM_BOT_TOKEN` with your bot token, then save (Ctrl+X, then Y, then Enter)*

---

## Step 10: Install Project Dependencies (if not done automatically)

```bash
npm install
```

---

## Step 11: Copy Systemd Service Files

```bash
sudo cp telegram-otp-bot.service /etc/systemd/system/
```

```bash
sudo cp chrome-debug.service /etc/systemd/system/
```

---

## Step 12: Reload Systemd

```bash
sudo systemctl daemon-reload
```

---

## Step 13: Enable Services (Auto-start on boot)

```bash
sudo systemctl enable chrome-debug
```

```bash
sudo systemctl enable telegram-otp-bot
```

---

## Step 14: Start Chrome Service

```bash
sudo systemctl start chrome-debug
```

---

## Step 15: Wait 5 Seconds

```bash
sleep 5
```

---

## Step 16: Verify Chrome is Running

```bash
curl http://localhost:9222/json/version
```

*(Should return Chrome version info - if not, wait a bit more and try again)*

---

## Step 17: Login to Chrome (One-time Setup)

**Option A: Using the helper script:**
```bash
./login_chrome.sh
```
*Follow the prompts to login*

**Option B: Manual login:**
```bash
sudo systemctl stop chrome-debug
```

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile
```
*Login to http://185.2.83.39/ints/agent/SMSCDRStats, then close Chrome*

```bash
sudo systemctl start chrome-debug
```

---

## Step 18: Start Bot Service

```bash
sudo systemctl start telegram-otp-bot
```

---

## Step 19: Check Bot Status

```bash
sudo systemctl status telegram-otp-bot
```

*(Press `q` to exit)*

---

## Step 20: Check Chrome Status

```bash
sudo systemctl status chrome-debug
```

*(Press `q` to exit)*

---

## Step 21: Test Bot Endpoint

```bash
curl http://localhost:8810/
```

*(Should return: "Server is alive!")*

---

## Step 22: View Bot Logs (Optional)

```bash
sudo journalctl -u telegram-otp-bot -f
```

*(Press `Ctrl+C` to exit)*

---

## Step 23: View Chrome Logs (Optional)

```bash
sudo journalctl -u chrome-debug -f
```

*(Press `Ctrl+C` to exit)*

---

## ✅ Done! Your bot should now be running.

---

## 🔄 Useful Commands for Later

### Restart Bot:
```bash
sudo systemctl restart telegram-otp-bot
```

### Restart Chrome:
```bash
sudo systemctl restart chrome-debug
```

### Stop Bot:
```bash
sudo systemctl stop telegram-otp-bot
```

### Stop Chrome:
```bash
sudo systemctl stop chrome-debug
```

### View Bot Logs:
```bash
sudo journalctl -u telegram-otp-bot -n 50
```

### View Chrome Logs:
```bash
sudo journalctl -u chrome-debug -n 50
```

### Check if Bot is Running:
```bash
sudo systemctl is-active telegram-otp-bot
```

### Check if Chrome is Running:
```bash
sudo systemctl is-active chrome-debug
```

---

## 🐛 If Something Goes Wrong

### Check what's using port 8810:
```bash
sudo lsof -i :8810
```

### Check what's using port 9222:
```bash
sudo lsof -i :9222
```

### Reinstall dependencies:
```bash
cd /opt/teleram-otp-bot
npm install
```

### Check Node.js version:
```bash
node --version
```

### Check if files exist:
```bash
ls -la /opt/teleram-otp-bot/
```

---

## 📝 Notes

- Run commands **one by one** and wait for each to complete
- If you see errors, read the error message and check the troubleshooting section
- The bot will auto-restart if it crashes
- Services will auto-start on server reboot (after Step 13)

