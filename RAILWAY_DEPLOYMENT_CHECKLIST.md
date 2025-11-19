# Railway Deployment Checklist ✅

Quick checklist to ensure your bot is ready for Railway deployment.

---

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] Code is pushed to GitHub
- [ ] `package.json` has correct `start` script: `"start": "node telegramNumberBot.js"`
- [ ] `railway.json` exists and is configured
- [ ] All dependencies are in `package.json`

### 2. Environment Variables
- [ ] `TELEGRAM_BOT_TOKEN` - Your bot token from BotFather
- [ ] `SMS_USERNAME` - Your SMS portal username (e.g., `mhmehedi007`)
- [ ] `SMS_PASSWORD` - Your SMS portal password (e.g., `##2023@@$$`)
- [ ] `USE_EXTERNAL_CHROME=false` - **Must be false for Railway**
- [ ] `USE_WEBHOOK=false` - Use polling mode
- [ ] `PORT=8810` - Port for health check

### 3. Railway Account
- [ ] Railway account created (https://railway.app)
- [ ] GitHub connected to Railway
- [ ] Repository is accessible

---

## 🚀 Deployment Steps

### Step 1: Create Railway Project
- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Wait for initial build

### Step 2: Configure Environment Variables
- [ ] Open your service in Railway
- [ ] Go to "Variables" tab
- [ ] Add all required variables (see above)
- [ ] Save changes

### Step 3: Verify Deployment
- [ ] Check "Deployments" tab - should show "Success"
- [ ] Check "Logs" tab - should see bot starting
- [ ] Look for: `Bot is running...`
- [ ] Look for: `Launching Puppeteer Chromium...`

### Step 4: Test Bot
- [ ] Open Telegram
- [ ] Find your bot
- [ ] Send `/start` command
- [ ] Bot should respond

---

## 🔍 Post-Deployment Verification

### Check Logs For:
- [ ] ✅ `Bot is running...`
- [ ] ✅ `Express server running on port 8810`
- [ ] ✅ `Launching Puppeteer Chromium (Railway/Cloud mode)...`
- [ ] ✅ `Logging into SMS portal...`
- [ ] ✅ `✅ Login successful!` (if auto-login works)
- [ ] ✅ `✅ Navigated to SMS stats page`

### Common Issues:
- [ ] ❌ `Auto-login failed` → Check credentials
- [ ] ❌ `ERR_BLOCKED_BY_CLIENT` → May need VPS instead
- [ ] ❌ `Failed to navigate` → Check network connectivity
- [ ] ❌ `Bot token invalid` → Check TELEGRAM_BOT_TOKEN

---

## 📝 Quick Reference

### Railway Dashboard URLs:
- **Projects:** https://railway.app/dashboard
- **Your Project:** https://railway.app/project/[project-id]
- **Logs:** https://railway.app/project/[project-id]/service/[service-id]/logs

### Environment Variables Template:
```bash
PORT=8810
USE_WEBHOOK=false
USE_EXTERNAL_CHROME=false
SMS_USERNAME=mhmehedi007
SMS_PASSWORD=##2023@@$$
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

### Update Bot (After Code Changes):
```bash
git add .
git commit -m "Update bot"
git push
# Railway auto-deploys on push
```

---

## 🆘 Troubleshooting

### Bot Not Starting?
1. Check Railway logs
2. Verify all environment variables are set
3. Check build logs for errors

### Auto-Login Failing?
- This is common on Railway
- Puppeteer's Chromium may be blocked
- **Solution:** Use VPS deployment instead (see `HOSTINGER_VPS_SETUP.md`)

### Need Help?
- Check Railway logs first
- See `RAILWAY_DEBUG.md` for debugging tips
- Railway Discord: https://discord.gg/railway

---

**✅ Once all items are checked, your bot should be running on Railway!**

