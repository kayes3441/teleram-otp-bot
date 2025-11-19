# Railway Deployment Guide

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy on Railway

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect Node.js and deploy

## Step 3: Set Environment Variables

In Railway dashboard, go to your project → Variables tab, add:

```
PORT=8810
USE_WEBHOOK=false
USE_EXTERNAL_CHROME=false
SMS_USERNAME=mhmehedi007
SMS_PASSWORD=2023@@$$
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

**Important:** 
- Set `USE_EXTERNAL_CHROME=false` for Railway (uses Puppeteer's bundled Chromium)
- Set `USE_EXTERNAL_CHROME=true` for VPS (uses external Chrome)

## Step 4: Update Bot Token

Edit `telegramNumberBot.js` line 13, or set `TELEGRAM_BOT_TOKEN` environment variable.

## Step 5: Deploy

Railway will automatically deploy when you push to GitHub.

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

