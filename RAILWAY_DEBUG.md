# Railway Debugging Guide

## Railway Doesn't Support SSH/Remote Access

Railway doesn't provide SSH access to containers. However, you can debug using:

## 1. View Logs in Railway Dashboard

1. Go to https://railway.app
2. Select your project
3. Click on your service
4. Go to "Logs" tab
5. You'll see real-time logs

## 2. Add Debug Logging

The code now includes extensive logging. Check Railway logs for:
- Navigation attempts
- Page content
- Form fields found
- Error details

## 3. Alternative: Use Render.com (Has SSH)

If you need SSH access, consider Render:

1. Go to https://render.com
2. Create account
3. New → Web Service
4. Connect GitHub repo
5. Settings:
   - Build: `npm install`
   - Start: `npm start`
6. SSH access: Available in dashboard

## 4. Alternative: Use Fly.io (Has SSH)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Launch: `flyctl launch`
4. SSH: `flyctl ssh console`

## 5. Check Railway Logs for These Messages

Look for:
- `✅ Navigation successful` - Page loaded
- `Solving math CAPTCHA` - CAPTCHA detected
- `✅ Math CAPTCHA answer filled` - CAPTCHA solved
- `Page debug info` - Shows what's on the page
- `Login error` - Shows what went wrong

## 6. Common Issues

### ERR_BLOCKED_BY_CLIENT
- This might be a Railway network restriction
- Try using a different hosting platform
- Or the site might block automated browsers

### Page Not Loading
- Check if the URL is accessible
- Verify network connectivity
- Check Railway logs for connection errors

## 7. Test Locally First

Before deploying to Railway, test locally:

```bash
# Set environment variables
export USE_EXTERNAL_CHROME=false
export SMS_USERNAME=your_username
export SMS_PASSWORD=your_password

# Run locally
npm start
```

This helps identify if it's a Railway-specific issue.

## 8. Railway Support

If issues persist:
- Check Railway status page
- Contact Railway support
- Check Railway Discord community

