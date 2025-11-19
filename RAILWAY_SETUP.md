# Railway Deployment Guide - Complete Setup

This guide will help you deploy your Telegram OTP Bot to [Railway](https://railway.app) - a modern cloud platform that makes deployment easy.

---

## 📋 Prerequisites

- GitHub account
- Railway account (free tier available - $5 credit monthly)
- Your Telegram Bot Token
- Your SMS login credentials

---

## Step 1: Prepare Your Code

### 1.1 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Telegram OTP Bot"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/teleram-otp-bot.git

# Push to GitHub
git push -u origin main
```

**Or create a new repository on GitHub and push:**
1. Go to https://github.com/new
2. Create repository: `teleram-otp-bot`
3. Follow GitHub's instructions to push

---

## Step 2: Deploy on Railway

### 2.1 Create Railway Account

1. Go to: https://railway.app
2. Click **"Start a New Project"** or **"Login"**
3. Sign up/Login with **GitHub** (recommended)

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub (if first time)
4. Select your repository: `teleram-otp-bot`
5. Railway will automatically:
   - Detect Node.js
   - Start building
   - Deploy your app

---

## Step 3: Configure Environment Variables

### 3.1 Open Variables Tab

1. In Railway dashboard, click on your **service**
2. Go to **"Variables"** tab
3. Click **"New Variable"** for each one

### 3.2 Add Required Variables

Add these environment variables:

```
PORT=8810
USE_WEBHOOK=false
USE_EXTERNAL_CHROME=false
SMS_USERNAME=mhmehedi007
SMS_PASSWORD=##2023@@$$
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

**Important Notes:**
- `USE_EXTERNAL_CHROME=false` - **Required for Railway** (uses Puppeteer's bundled Chromium)
- `USE_WEBHOOK=false` - Use polling mode (simpler for Railway)
- `PORT=8810` - Port for health check endpoint
- Replace `your-bot-token-here` with your actual Telegram bot token

### 3.3 Variable Details

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8810` | Port for Express server (health check) |
| `USE_WEBHOOK` | `false` | Use polling instead of webhooks |
| `USE_EXTERNAL_CHROME` | `false` | **Must be false for Railway** |
| `SMS_USERNAME` | `mhmehedi007` | Your SMS portal username |
| `SMS_PASSWORD` | `##2023@@$$` | Your SMS portal password |
| `TELEGRAM_BOT_TOKEN` | `your-token` | Your Telegram bot token from BotFather |

---

## Step 4: Verify Deployment

### 4.1 Check Build Logs

1. In Railway dashboard, go to **"Deployments"** tab
2. Click on the latest deployment
3. Check **"Build Logs"** for any errors

### 4.2 Check Runtime Logs

1. Go to **"Logs"** tab
2. You should see:
   - `Bot is running...`
   - `Launching Puppeteer Chromium (Railway/Cloud mode)...`
   - `Logging into SMS portal...`
   - `✅ Login successful!` (if auto-login works)

### 4.3 Test Your Bot

1. Open Telegram
2. Find your bot
3. Send `/start` command
4. Bot should respond

---

## Step 5: Monitor and Debug

### 5.1 View Logs

Railway provides real-time logs:
- Go to **"Logs"** tab in Railway dashboard
- See all console output from your bot
- Filter logs if needed

### 5.2 Check Deployment Status

- **Green dot** = Running
- **Yellow dot** = Building/Deploying
- **Red dot** = Failed/Error

### 5.3 Common Log Messages

**Success:**
- ✅ `Bot is running...`
- ✅ `Login successful!`
- ✅ `Navigated to SMS stats page`

**Errors:**
- ❌ `Auto-login failed` - Check credentials
- ❌ `ERR_BLOCKED_BY_CLIENT` - Network issue
- ❌ `Failed to navigate` - Server unreachable

---

## How Railway Mode Works

### Railway Mode (`USE_EXTERNAL_CHROME=false`):

✅ **Uses Puppeteer's bundled Chromium**
- No need to install Chrome
- Automatically included with Puppeteer
- Works in Railway's container environment

✅ **Auto-login**
- Uses credentials from environment variables
- Attempts to login automatically
- Solves math CAPTCHA automatically

✅ **No manual setup needed**
- Everything runs automatically
- No SSH access required
- Just set environment variables

---

## Troubleshooting

### Bot Not Starting?

1. **Check Railway Logs:**
   - Go to "Logs" tab
   - Look for error messages
   - Check if Node.js started correctly

2. **Verify Environment Variables:**
   - Make sure all variables are set
   - Check for typos
   - Verify bot token is correct

3. **Check Build Logs:**
   - Go to "Deployments" → Latest deployment
   - Check "Build Logs" for npm install errors

### SMS Scraping Not Working?

1. **Check Login:**
   - Look for `✅ Login successful!` in logs
   - If you see `❌ Auto-login failed`, check credentials

2. **Verify Credentials:**
   - `SMS_USERNAME` and `SMS_PASSWORD` must be correct
   - Check Railway logs for login errors

3. **Check Network:**
   - Railway should be able to reach `http://185.2.83.39`
   - If blocked, you may need VPS instead

### Auto-Login Failing?

If auto-login doesn't work on Railway:
- This is expected - Railway uses Puppeteer's Chromium which may be blocked
- **Solution:** Use VPS mode (Hostinger VPS) with manual login instead
- See `HOSTINGER_VPS_SETUP.md` for VPS deployment

---

## Railway Features

✅ **Free Tier:** $5 credit monthly  
✅ **Auto-deploy:** Deploys on every GitHub push  
✅ **Auto-restart:** Restarts on failure  
✅ **Logs:** Real-time logs in dashboard  
✅ **Environment Variables:** Easy configuration  
✅ **No SSH needed:** Everything through dashboard  

---

## Updating Your Bot

### Method 1: Push to GitHub (Automatic)

```bash
# Make changes to your code
git add .
git commit -m "Update bot"
git push
```

Railway will automatically:
- Detect the push
- Rebuild your app
- Redeploy

### Method 2: Manual Redeploy

1. Go to Railway dashboard
2. Click on your service
3. Click **"Redeploy"** button

---

## Cost Estimate

**Railway Free Tier:**
- $5 credit monthly
- Usually enough for a small bot
- Pay-as-you-go after free credit

**Typical Usage:**
- Small bot: ~$2-5/month
- Medium bot: ~$5-10/month
- Check Railway dashboard for actual usage

---

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Set environment variables
3. ✅ Test your bot
4. ✅ Monitor logs
5. ✅ Enjoy your running bot! 🎉

---

## Alternative: VPS Deployment

If Railway doesn't work (auto-login blocked), use VPS:
- See `HOSTINGER_VPS_SETUP.md` for VPS deployment
- VPS allows manual login (more reliable)
- Full control over the server

---

**Your bot is now running on Railway! 🚂**

## How It Works

- **Railway Mode** (`USE_EXTERNAL_CHROME=false`): 
  - Uses Puppeteer's bundled Chromium
  - Auto-login with credentials from environment variables
  - No need for external Chrome

- **VPS Mode** (`USE_EXTERNAL_CHROME=true`):
  - Connects to Chrome at localhost:9222
  - Requires manual login or Chrome service

## Troubleshooting

### Bot not starting:
- Check Railway logs
- Verify environment variables are set
- Check if port is correct

### SMS scraping not working:
- Check if `SMS_USERNAME` and `SMS_PASSWORD` are correct
- Check Railway logs for login errors
- Verify the SMS portal URL is accessible

### Puppeteer issues:
- Railway automatically installs Chromium dependencies
- If issues persist, check Railway logs

## Notes

- Railway provides free $5 credit monthly
- Bot will auto-restart on failure
- Logs are available in Railway dashboard
- No need to install Chrome manually on Railway

