# Fix Chrome Service Error

If you're getting the error:
```
Job for chrome-debug.service failed because a fatal signal was delivered to the control process.
```

## Quick Fix Commands

Run these commands on your VPS:

### 1. Check the logs first:
```bash
sudo journalctl -xeu chrome-debug.service -n 50
```

### 2. Update the service file path:
```bash
sudo nano /etc/systemd/system/chrome-debug.service
```

Change the `WorkingDirectory` and `ExecStart` paths to match your actual location:
- If your project is in `/var/www/html/telegram/teleram-otp-bot`, use that path
- If it's in `/opt/teleram-otp-bot`, use that path

### 3. Make sure the script is executable:
```bash
cd /var/www/html/telegram/teleram-otp-bot
sudo chmod +x start_chrome_debug_linux.sh
```

### 4. Test the script manually:
```bash
cd /var/www/html/telegram/teleram-otp-bot
./start_chrome_debug_linux.sh
```

If it works manually, press Ctrl+C to stop it.

### 5. Check if Chrome is installed:
```bash
which google-chrome
google-chrome --version
```

### 6. Check if Xvfb is installed:
```bash
which Xvfb
```

If not installed:
```bash
sudo apt install xvfb -y
```

### 7. Reload systemd and try again:
```bash
sudo systemctl daemon-reload
sudo systemctl start chrome-debug
sudo systemctl status chrome-debug
```

## Alternative: Simpler Service File

If the above doesn't work, try this simpler service file:

```bash
sudo nano /etc/systemd/system/chrome-debug.service
```

Paste this (update the path to match your location):

```ini
[Unit]
Description=Chrome with Remote Debugging for SMS Scraping
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/html/telegram/teleram-otp-bot
Environment="DISPLAY=:99"
ExecStartPre=/usr/bin/Xvfb :99 -screen 0 1024x768x24
ExecStart=/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile --no-first-run --no-default-browser-check --disable-gpu --disable-dev-shm-usage --no-sandbox --headless=new http://185.2.83.39/ints/agent/SMSCDRStats
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl start chrome-debug
sudo systemctl status chrome-debug
```

