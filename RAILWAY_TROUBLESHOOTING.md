# Railway Troubleshooting Guide

Common issues and solutions for Railway deployment.

---

## ❌ Issue: Build Fails

### Symptoms:
- Build logs show errors
- Deployment never completes
- "Build failed" message

### Solutions:

**1. Check Node.js Version:**
Railway should auto-detect, but you can specify in `package.json`:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

**2. Check Build Logs:**
- Go to Railway dashboard
- Click on deployment
- Check "Build Logs" tab
- Look for specific error messages

**3. Common Build Errors:**
- `npm install` fails → Check `package.json` dependencies
- Memory issues → Railway may need more resources
- Timeout → Build taking too long

---

## ❌ Issue: Bot Starts But Crashes

### Symptoms:
- Build succeeds
- Bot starts but crashes immediately
- Logs show errors

### Solutions:

**1. Check Runtime Logs:**
- Go to "Logs" tab in Railway
- Look for error messages
- Check stack traces

**2. Common Runtime Errors:**

**Error: Cannot find module**
```bash
# Solution: Make sure all dependencies are in package.json
npm install --save <missing-module>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**Error: Puppeteer launch failed**
```bash
# Solution: Puppeteer needs additional flags for Railway
# Already included in code, but verify USE_EXTERNAL_CHROME=false
```

**Error: Port already in use**
```bash
# Solution: Railway sets PORT automatically
# Make sure code uses: const PORT = process.env.PORT || 8810;
```

---

## ❌ Issue: Auto-Login Fails

### Symptoms:
- Bot starts successfully
- Logs show: `❌ Auto-login failed`
- SMS scraping not working

### Solutions:

**1. Check Credentials:**
- Verify `SMS_USERNAME` and `SMS_PASSWORD` in Railway Variables
- Check for typos
- Make sure no extra spaces

**2. Check Logs:**
Look for these in Railway logs:
- `⚠️ Warning: Server was not reachable`
- `Failed to navigate to login page`
- `ERR_BLOCKED_BY_CLIENT`
- `ERR_CONNECTION_REFUSED`

**3. Common Causes:**

**ERR_BLOCKED_BY_CLIENT:**
- Railway's network may block automated browsers
- **Solution:** Use VPS deployment instead (see `HOSTINGER_VPS_SETUP.md`)

**ERR_CONNECTION_REFUSED:**
- SMS portal server may be down
- Network connectivity issue
- **Solution:** Check if `http://185.2.83.39` is accessible

**Login page structure changed:**
- The login page HTML may have changed
- **Solution:** Update selectors in code

---

## ❌ Issue: Bot Not Responding in Telegram

### Symptoms:
- Bot deployed successfully
- No errors in logs
- Bot doesn't respond to commands

### Solutions:

**1. Check Bot Token:**
- Verify `TELEGRAM_BOT_TOKEN` is set correctly
- Check Railway Variables tab
- Make sure token is from BotFather

**2. Check Bot Status:**
- Go to Telegram
- Find your bot
- Send `/start`
- Check if bot is online

**3. Check Logs:**
Look for:
- `Bot is running...`
- `Express server running on port...`
- Any error messages

**4. Test Webhook vs Polling:**
- If using webhooks, make sure `USE_WEBHOOK=true`
- If using polling, make sure `USE_WEBHOOK=false`
- For Railway, polling is recommended

---

## ❌ Issue: Puppeteer Not Working

### Symptoms:
- `Error: Failed to launch the browser process`
- `No usable sandbox!`
- Browser crashes

### Solutions:

**1. Verify Puppeteer Flags:**
The code should include:
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu'
]
```

**2. Check USE_EXTERNAL_CHROME:**
- Must be `false` for Railway
- Railway uses Puppeteer's bundled Chromium

**3. Add nixpacks.toml:**
Create `nixpacks.toml` in project root:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "chromium"]

[start]
cmd = "npm start"
```

---

## ❌ Issue: Memory/Resource Limits

### Symptoms:
- Bot crashes after running for a while
- "Out of memory" errors
- Slow performance

### Solutions:

**1. Check Railway Usage:**
- Go to Railway dashboard
- Check resource usage
- Upgrade plan if needed

**2. Optimize Code:**
- Close browser pages when done
- Limit concurrent operations
- Clean up resources

**3. Railway Free Tier Limits:**
- $5 credit monthly
- May need to upgrade for heavy usage

---

## 🔍 Debugging Steps

### Step 1: Check Railway Logs
1. Go to Railway dashboard
2. Select your project
3. Click on service
4. Go to "Logs" tab
5. Look for errors

### Step 2: Check Environment Variables
1. Go to "Variables" tab
2. Verify all variables are set:
   - `TELEGRAM_BOT_TOKEN`
   - `SMS_USERNAME`
   - `SMS_PASSWORD`
   - `USE_EXTERNAL_CHROME=false`
   - `USE_WEBHOOK=false`
   - `PORT=8810`

### Step 3: Test Locally First
```bash
# Set environment variables
export USE_EXTERNAL_CHROME=false
export SMS_USERNAME=mhmehedi007
export SMS_PASSWORD=##2023@@$$
export TELEGRAM_BOT_TOKEN=your-token

# Run locally
npm start
```

If it works locally but not on Railway, it's a Railway-specific issue.

### Step 4: Check Build Logs
1. Go to "Deployments" tab
2. Click on latest deployment
3. Check "Build Logs"
4. Look for errors during build

---

## 🆘 Still Not Working?

### Option 1: Use VPS Instead
Railway may have limitations with Puppeteer. Consider VPS:
- See `HOSTINGER_VPS_SETUP.md`
- More control
- Manual login option
- More reliable for web scraping

### Option 2: Contact Railway Support
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app
- Include logs and error messages

### Option 3: Try Alternative Platforms
- **Render.com** - Similar to Railway, has SSH
- **Fly.io** - Good for Docker deployments
- **DigitalOcean App Platform** - Simple deployment

---

## ✅ Quick Checklist

- [ ] All environment variables set in Railway
- [ ] `USE_EXTERNAL_CHROME=false` for Railway
- [ ] `package.json` has correct start script
- [ ] Code pushed to GitHub
- [ ] Railway connected to GitHub repo
- [ ] Build logs show success
- [ ] Runtime logs show bot starting
- [ ] Bot token is correct
- [ ] SMS credentials are correct

---

**Need more help? Check Railway logs first, then try the solutions above!**

