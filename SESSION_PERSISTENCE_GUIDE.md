# Session Persistence Guide

This guide explains how to keep your login session active so you don't need to login every time.

---

## 🍪 How It Works

The bot now saves cookies after successful login. These cookies are loaded automatically on the next run, so you stay logged in!

---

## ✅ Method 1: Auto-Login (Recommended)

The bot will automatically:
1. Try to load saved cookies
2. Check if you're already logged in
3. If not logged in, login automatically
4. Save cookies after successful login

**Just run:**
```bash
npm start
```

The bot handles everything automatically!

---

## ✅ Method 2: Login Once with Python, Then Use Bot

If you want to login manually first:

### Step 1: Login with Python Script

```bash
# Activate virtual environment
source venv/bin/activate

# Run login script
python login_test.py
```

The script will:
- Login to the SMS portal
- Save cookies to `cookies.json`
- Keep you logged in

### Step 2: Run Bot

```bash
npm start
```

The bot will:
- Load cookies from `cookies.json`
- Use your existing session
- Go directly to `http://185.2.83.39/ints/agent/SMSCDRStats`
- No need to login again!

---

## 📁 Cookie File

Cookies are saved in: `cookies.json`

**Location:** Same directory as `telegramNumberBot.js`

**Format:** JSON file with all session cookies

**When it's created:**
- After successful auto-login
- After running Python login script

**When it's used:**
- Automatically loaded when bot starts
- Keeps you logged in between runs

---

## 🔄 How to Refresh Session

If cookies expire or login fails:

### Option 1: Delete cookies and re-login
```bash
# Delete old cookies
rm cookies.json

# Run bot (will auto-login)
npm start
```

### Option 2: Login with Python again
```bash
# Run Python login script
python login_test.py

# This will create/update cookies.json
```

---

## 🎯 Workflow

### First Time Setup:
1. Run `npm start`
2. Bot auto-logins
3. Cookies saved to `cookies.json`
4. ✅ Done!

### Subsequent Runs:
1. Run `npm start`
2. Bot loads cookies
3. Bot checks if logged in
4. If logged in → Go directly to reports page
5. If not logged in → Auto-login and save cookies

---

## 💡 Benefits

✅ **No repeated logins** - Login once, stay logged in  
✅ **Faster startup** - Skip login if already logged in  
✅ **Persistent session** - Works across bot restarts  
✅ **Automatic** - No manual intervention needed  

---

## 🔍 Troubleshooting

### Cookies not working?

1. **Check if cookies.json exists:**
   ```bash
   ls -la cookies.json
   ```

2. **Delete and re-login:**
   ```bash
   rm cookies.json
   npm start
   ```

3. **Check bot logs:**
   - Look for: `🍪 Loading saved cookies...`
   - Look for: `🍪 Saved X cookie(s)...`

### Session expired?

If you see "Not logged in" even with cookies:
- Cookies may have expired
- Delete `cookies.json` and re-login
- Or run Python login script again

---

## 📝 Notes

- Cookies are saved locally in `cookies.json`
- Don't commit `cookies.json` to git (add to `.gitignore`)
- Cookies may expire after some time (depends on server)
- If login fails, bot will try to auto-login again

---

**Your login session now persists! 🎉**

