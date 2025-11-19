# Railway Login Workflow Guide

This guide explains how to login once and save cookies for Railway deployment.

---

## 🎯 Goal

Login once to the SMS portal, save cookies, then the bot can use those cookies to stay logged in.

---

## ✅ Method 1: Railway CLI (Recommended)

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Link to Your Project

```bash
cd /path/to/teleram-otp-bot
railway link
```

Select your Railway project when prompted.

### Step 4: Run Login Script

```bash
railway run npm run login
```

This will:
- ✅ Login to SMS portal
- ✅ Save cookies to `cookies.json` in Railway
- ✅ Keep session active

### Step 5: Start Bot

```bash
railway up
```

Or the bot will auto-start after deployment. It will use the saved cookies!

---

## ✅ Method 2: One-Time Setup Command

### Step 1: Update Start Command Temporarily

1. Go to Railway Dashboard
2. Select your service
3. Go to **Settings** → **Deploy**
4. Change **Start Command** to:
   ```
   npm run login && npm start
   ```
5. Save and redeploy

### Step 2: Wait for First Login

- Railway will run `npm run login` first
- This logs in and saves cookies
- Then starts the bot with `npm start`

### Step 3: Revert Start Command

After first successful login:
1. Go back to **Settings** → **Deploy**
2. Change **Start Command** back to:
   ```
   npm start
   ```
3. Save

Now the bot will use saved cookies on subsequent runs!

---

## ✅ Method 3: Auto-Login (Easiest)

**Just deploy normally!** The bot will:
1. Check for saved cookies
2. If no cookies → Auto-login → Save cookies
3. If cookies exist → Use them
4. If cookies expired → Auto-login again

**No manual steps needed!**

---

## 🔄 Workflow Comparison

### With Manual Login (Method 1 or 2):
```
1. Run: npm run login (saves cookies)
2. Run: npm start (uses cookies)
3. Bot stays logged in!
```

### With Auto-Login (Method 3):
```
1. Run: npm start
2. Bot auto-logins (saves cookies)
3. Next run: Bot uses saved cookies
4. Bot stays logged in!
```

---

## 📁 Cookie File Location

Cookies are saved in: `cookies.json`

**On Railway:**
- Stored in the container's file system
- Persists during the same deployment
- May be lost on redeploy (but bot will auto-login again)

**Note:** Railway containers are ephemeral, so cookies may not persist across deployments. But the bot will auto-login if cookies are missing!

---

## 🎯 Recommended Approach

**For Railway, use Method 3 (Auto-Login):**

1. Just deploy normally
2. Bot auto-logins on first run
3. Cookies saved automatically
4. Bot uses cookies on subsequent runs
5. If cookies expire, bot auto-logins again

**No manual intervention needed!**

---

## 🔍 Verify It's Working

### Check Railway Logs:

Look for these messages:

**First Run (Auto-Login):**
```
🍪 Loading saved cookies for session persistence...
⚠️ Could not load saved cookies (first run)
Logging into SMS portal...
✅ Login successful!
🍪 Saved X cookie(s) for session persistence
```

**Subsequent Runs (Using Cookies):**
```
🍪 Loading saved cookies for session persistence...
✅ Loaded X saved cookie(s)
Checking if already logged in...
✅ Already logged in! Skipping login process.
```

---

## 🆘 Troubleshooting

### Cookies Not Persisting?

Railway containers are ephemeral. Cookies may be lost on:
- Redeploy
- Container restart
- Service update

**Solution:** Bot will auto-login again if cookies are missing. No action needed!

### Login Failing?

Check Railway logs for:
- `❌ Auto-login failed`
- `ERR_BLOCKED_BY_CLIENT`
- Wrong credentials

**Solution:** 
- Verify `SMS_USERNAME` and `SMS_PASSWORD` in Railway Variables
- Check Railway logs for specific errors

---

## 📝 Summary

**Easiest Way:**
1. Deploy to Railway
2. Set environment variables
3. Bot auto-logins on first run
4. Done! ✅

**Manual Way (if needed):**
1. Install Railway CLI
2. Run: `railway run npm run login`
3. Run: `railway up`
4. Done! ✅

---

**Your bot will stay logged in! 🎉**

