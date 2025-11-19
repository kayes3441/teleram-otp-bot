# Railway Quick Fix Guide

If your bot is "not working" on Railway, follow these steps:

---

## 🔍 Step 1: Check What's Not Working

### A. Build Fails?
- Go to Railway dashboard → Deployments → Check "Build Logs"
- Look for error messages
- Common: npm install fails, missing dependencies

### B. Bot Crashes After Starting?
- Go to Railway dashboard → Logs tab
- Look for error messages
- Common: Puppeteer errors, missing environment variables

### C. Bot Starts But Doesn't Respond?
- Check Telegram - is bot online?
- Check Railway logs for "Bot is running..."
- Common: Wrong bot token, webhook issues

### D. Auto-Login Fails?
- Check Railway logs for "❌ Auto-login failed"
- Common: Wrong credentials, ERR_BLOCKED_BY_CLIENT

---

## ✅ Step 2: Quick Fixes

### Fix 1: Verify Environment Variables

Go to Railway → Your Service → Variables tab, make sure these are set:

```
TELEGRAM_BOT_TOKEN=8349339737:AAEORrw1g-AZ1PDuQn_w90cdxdrD8C-8ebE
SMS_USERNAME=mhmehedi007
SMS_PASSWORD=##2023@@$$
USE_EXTERNAL_CHROME=false
USE_WEBHOOK=false
PORT=8810
```

**Important:** 
- `USE_EXTERNAL_CHROME` must be `false` (not `"false"` or `False`)
- No quotes around values
- No spaces before/after `=`

### Fix 2: Check Build Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check "Build Logs"

**Look for:**
- ✅ `npm install` completes successfully
- ✅ `Build complete`
- ❌ Any red error messages

### Fix 3: Check Runtime Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for these messages:

**Good signs:**
- ✅ `Bot is running...`
- ✅ `Express server running on port 8810`
- ✅ `Launching Puppeteer Chromium...`
- ✅ `✅ Login successful!`

**Bad signs:**
- ❌ `Error: Cannot find module`
- ❌ `Failed to launch browser`
- ❌ `Auto-login failed`
- ❌ `ERR_BLOCKED_BY_CLIENT`

### Fix 4: Redeploy

If changes were made:
1. Go to Railway dashboard
2. Click on your service
3. Click "Redeploy" button
4. Wait for deployment to complete
5. Check logs again

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module"

**Solution:**
```bash
# Make sure all dependencies are in package.json
# Then push to GitHub:
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue 2: "Failed to launch browser"

**Solution:**
- Make sure `USE_EXTERNAL_CHROME=false` in Railway Variables
- The `nixpacks.toml` file should help (already created)
- Redeploy after adding it

### Issue 3: "Auto-login failed"

**Possible causes:**
1. Wrong credentials → Check `SMS_USERNAME` and `SMS_PASSWORD`
2. ERR_BLOCKED_BY_CLIENT → Railway network may block automated browsers
3. Server unreachable → Check if `http://185.2.83.39` is accessible

**Solution:**
- Check Railway logs for specific error
- If ERR_BLOCKED_BY_CLIENT, consider using VPS instead (see `HOSTINGER_VPS_SETUP.md`)

### Issue 4: Bot not responding in Telegram

**Solution:**
1. Check `TELEGRAM_BOT_TOKEN` is correct
2. Make sure bot is online (check Telegram)
3. Try sending `/start` command
4. Check Railway logs for "Bot is running..."

---

## 📋 Quick Checklist

Run through this checklist:

- [ ] Code is pushed to GitHub
- [ ] Railway project is connected to GitHub repo
- [ ] All environment variables are set in Railway
- [ ] `USE_EXTERNAL_CHROME=false` (not "false" or False)
- [ ] Build logs show success
- [ ] Runtime logs show "Bot is running..."
- [ ] Bot token is correct
- [ ] SMS credentials are correct
- [ ] Bot responds in Telegram

---

## 🔧 Files to Check

Make sure these files exist and are correct:

1. **package.json** - Has `"start": "node telegramNumberBot.js"`
2. **railway.json** - Configured correctly
3. **nixpacks.toml** - Added for Puppeteer support (just created)
4. **telegramNumberBot.js** - Main bot file

---

## 🆘 Still Not Working?

### Option 1: Share Railway Logs
Copy the error messages from Railway logs and we can debug further.

### Option 2: Test Locally First
```bash
# Set environment variables
export USE_EXTERNAL_CHROME=false
export SMS_USERNAME=mhmehedi007
export SMS_PASSWORD=##2023@@$$
export TELEGRAM_BOT_TOKEN=8349339737:AAEORrw1g-AZ1PDuQn_w90cdxdrD8C-8ebE

# Run locally
npm start
```

If it works locally but not on Railway, it's a Railway-specific issue.

### Option 3: Use VPS Instead
Railway may have limitations. Consider VPS deployment:
- See `HOSTINGER_VPS_SETUP.md`
- More reliable for web scraping
- Full control over the server

---

## 📞 Need More Help?

1. Check `RAILWAY_TROUBLESHOOTING.md` for detailed solutions
2. Check Railway logs for specific error messages
3. Share the error message and we can help debug

---

**What specific error are you seeing? Check Railway logs and share the error message!**

