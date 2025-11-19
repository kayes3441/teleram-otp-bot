# Localhost Setup Guide - Test Bot Locally

This guide will help you run and test your Telegram OTP Bot on your local machine before deploying to VPS.

---

## 📋 Prerequisites

- Node.js installed (v18 or higher)
- Google Chrome installed
- Git (optional, for cloning)
- Your Telegram Bot Token

---

## Step 1: Install Node.js

### Windows:
1. Download Node.js: https://nodejs.org/
2. Install the LTS version
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Mac:
```bash
# Using Homebrew
brew install node

# Or download from: https://nodejs.org/
```

### Linux:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

## Step 2: Navigate to Your Bot Directory

```bash
# Windows (PowerShell or CMD)
cd path\to\teleram-otp-bot

# Mac/Linux
cd ~/path/to/teleram-otp-bot
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `telegraf` (Telegram bot framework)
- `puppeteer` (for Chrome automation)
- Other dependencies

---

## Step 4: Configure Bot Token

### Option A: Edit the file directly

Open `telegramNumberBot.js` and find line 13:

```javascript
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
```

Replace with your actual bot token.

### Option B: Use environment variable (recommended)

**Windows (PowerShell):**
```powershell
$env:TELEGRAM_BOT_TOKEN="your-bot-token-here"
$env:USE_EXTERNAL_CHROME="false"
$env:SMS_USERNAME="mhmehedi007"
$env:SMS_PASSWORD="##2023@@$$"
```

**Windows (CMD):**
```cmd
set TELEGRAM_BOT_TOKEN=your-bot-token-here
set USE_EXTERNAL_CHROME=false
set SMS_USERNAME=mhmehedi007
set SMS_PASSWORD=##2023@@$$
```

**Mac/Linux:**
```bash
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
export USE_EXTERNAL_CHROME="false"
export SMS_USERNAME="mhmehedi007"
export SMS_PASSWORD="##2023@@$$"
```

---

## Step 5: Install Chrome/Chromium (if needed)

### Windows/Mac:
- Chrome should already be installed
- If not, download from: https://www.google.com/chrome/

### Linux:
```bash
# Ubuntu/Debian
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Or use Chromium
sudo apt install chromium-browser
```

---

## Step 6: Test Login - Method 1: Auto-Login (Railway/Cloud Mode)

This mode uses Puppeteer's bundled Chromium and attempts auto-login.

### 6.1 Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:USE_EXTERNAL_CHROME="false"
$env:SMS_USERNAME="mhmehedi007"
$env:SMS_PASSWORD="##2023@@$$"
```

**Mac/Linux:**
```bash
export USE_EXTERNAL_CHROME="false"
export SMS_USERNAME="mhmehedi007"
export SMS_PASSWORD="##2023@@$$"
```

### 6.2 Run the Bot

```bash
node telegramNumberBot.js
```

### 6.3 Check Logs

Watch the console output. You should see:
- Bot starting messages
- Login attempts
- Success or failure messages

**If login fails**, you'll see detailed error messages showing what went wrong.

---

## Step 7: Test Login - Method 2: Manual Login (VPS Mode) - RECOMMENDED FOR MAC

This mode uses your local Chrome with remote debugging, allowing you to login manually.

### 7.1 Start Chrome with Remote Debugging

**Mac (Recommended):**
```bash
# Close all Chrome windows first
# Then run:
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"
```

**Windows:**
```powershell
# Close all Chrome windows first
# Then run:
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-debug-profile"
```

**Linux:**
```bash
# Close all Chrome windows first
# Then run:
google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"
```

**Chrome should open automatically.**

### 7.2 Login Manually in Chrome

1. In the Chrome window that opened, navigate to:
   ```
   http://185.2.83.39/ints/login
   ```

2. Enter your credentials:
   - Username: `mhmehedi007`
   - Password: `##2023@@$$`
   - Solve the math CAPTCHA
   - Click Login

3. After successful login, navigate to:
   ```
   http://185.2.83.39/ints/agent/SMSCDRStats
   ```

4. **Keep Chrome open** (don't close it)

### 7.3 Verify Chrome Debugging is Working

Open a new terminal and test:

```bash
# Windows (PowerShell)
curl http://localhost:9222/json/version

# Mac/Linux
curl http://localhost:9222/json/version
```

You should see Chrome version information in JSON format.

### 7.4 Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:USE_EXTERNAL_CHROME="true"
```

**Mac/Linux:**
```bash
export USE_EXTERNAL_CHROME="true"
```

### 7.5 Run the Bot

```bash
node telegramNumberBot.js
```

The bot will connect to your Chrome instance and use your existing login session.

---

## Step 8: Test the Bot

1. Open Telegram
2. Find your bot
3. Send `/start` command
4. Bot should respond

Try other commands:
- `/getnumber` - Get a phone number
- Check if SMS scraping is working

---

## Step 9: Monitor Logs

Watch the console output for:
- ✅ Login successful messages
- ✅ Bot connected messages
- ✅ SMS scraping status
- ⚠️ Any error messages

---

## 🔍 Debugging Login Issues

### Check if Chrome Debugging is Running:

```bash
# Test connection
curl http://localhost:9222/json/version

# List all tabs
curl http://localhost:9222/json
```

### Check Bot Logs:

Look for these messages in console:
- `"Connecting to Chrome at http://localhost:9222..."`
- `"✅ Already logged in! Skipping login process."`
- `"⚠️ Auto-login failed"`
- `"Login attempt 1/3..."`

### Common Issues:

**1. Chrome debugging not accessible:**
```
Error: Chrome debugging not available
```
**Solution:** Make sure Chrome is running with `--remote-debugging-port=9222`

**2. Login page not loading:**
```
Error: Failed to navigate to login page
```
**Solution:** 
- Check internet connection
- Verify URL is accessible: http://185.2.83.39/ints/login
- Try accessing in browser manually

**3. Credentials not working:**
```
Error: All login attempts failed
```
**Solution:**
- Verify username and password are correct
- Try logging in manually in browser first
- Check if CAPTCHA is being solved correctly

**4. Bot token invalid:**
```
Error: Unauthorized
```
**Solution:**
- Verify bot token is correct
- Make sure no extra spaces in token
- Check if bot is enabled in BotFather

---

## 📝 Quick Test Script

Create a file `test-login.js`:

```javascript
const puppeteer = require('puppeteer');

async function testLogin() {
  console.log('Testing login...');
  
  // Test with external Chrome
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null,
    });
    
    const pages = await browser.pages();
    console.log(`✅ Connected to Chrome. Found ${pages.length} tabs.`);
    
    // Check if already logged in
    for (const page of pages) {
      const url = page.url();
      if (url.includes('SMSCDRStats')) {
        console.log('✅ Already on SMS stats page - logged in!');
        return;
      }
    }
    
    // Try to navigate to login page
    const page = pages[0] || await browser.newPage();
    await page.goto('http://185.2.83.39/ints/login');
    console.log('✅ Navigated to login page');
    
    // Check page content
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const hasLoginForm = await page.evaluate(() => {
      return !!document.querySelector('input[name="username"]');
    });
    console.log(`Has login form: ${hasLoginForm}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure Chrome is running with:');
    console.log('   --remote-debugging-port=9222');
  }
}

testLogin();
```

Run it:
```bash
node test-login.js
```

---

## 🎯 Testing Checklist

- [ ] Node.js installed and working
- [ ] Dependencies installed (`npm install`)
- [ ] Bot token configured
- [ ] Chrome installed
- [ ] Chrome debugging accessible (if using Method 2)
- [ ] Can access login page in browser
- [ ] Bot starts without errors
- [ ] Bot responds to `/start` command
- [ ] Login works (check logs)
- [ ] SMS scraping works (if applicable)

---

## 🚀 Next Steps

Once everything works locally:

1. **Test all bot commands**
2. **Verify SMS scraping works**
3. **Check logs for any errors**
4. **Then deploy to VPS** using `HOSTINGER_VPS_SETUP.md`

---

## 💡 Tips

1. **Keep Chrome open** when using Method 2 (manual login)
2. **Check console logs** for detailed error messages
3. **Test in browser first** - manually login to verify credentials work
4. **Use Method 2** if auto-login doesn't work
5. **Save your environment variables** in a `.env` file for easier testing

---

## 📞 Troubleshooting

### Bot won't start?
- Check Node.js version: `node --version` (should be v18+)
- Check if dependencies installed: `npm list`
- Check bot token is correct

### Chrome debugging not working?
- Make sure Chrome is closed before starting with debugging
- Check if port 9222 is available: `netstat -an | findstr 9222` (Windows) or `lsof -i :9222` (Mac/Linux)
- Try a different port if 9222 is busy

### Login keeps failing?
- Try Method 2 (manual login) instead
- Verify credentials work in browser manually
- Check network connection
- Look at detailed error logs in console

---

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ `"Bot is running..."` in console
- ✅ Bot responds to `/start` in Telegram
- ✅ `"✅ Already logged in!"` or `"✅ Login successful!"` in logs
- ✅ SMS scraping messages appear in logs

---

**Happy Testing! 🎉**

