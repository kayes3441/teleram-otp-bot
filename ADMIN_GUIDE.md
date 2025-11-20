# Admin Guide - Telegram OTP Bot

## Overview

This bot manages phone numbers for OTP verification and automatically scrapes OTP codes from the SMS portal.

## Admin Access

### Login as Admin

1. Start a chat with the bot on Telegram
2. Send: `/adminlogin <password>`
   - Default password: `Asdf@qwer!`
   - Change it in `telegramNumberBot.js` (line 20): `ADMIN_PASSWORD`

### Admin Commands

#### User Management

- `/adduser <telegram_username>` - Add a user to the system
- `/removeuser <telegram_username>` - Remove a user
- `/listusers` - List all registered users
- `/userstats` - Show user statistics

#### Number Management

- **Upload Numbers File**: Send a `.txt` file with numbers (one per line)
  - Format: `1234567890` (10-15 digits)
  - Must have valid country code (first 2-3 digits)
  - Bot will automatically detect country codes

- `/addcountry <code> <name> [flag]` - Add a country code
  - Example: `/addcountry 1 USA 🇺🇸`
  - Example: `/addcountry 880 Bangladesh 🇧🇩`

- `/listcountries` - List all country codes

- `/forceload` - Force upload numbers without format validation
  - Use when numbers don't match standard format
  - Still requires valid country codes

#### OTP Management

- `/checkotp <number>` - Check OTP for a specific number
  - Example: `/checkotp 1234567890`
  - Shows latest OTP code and details

- `/scrape` - Manually trigger OTP scraping
  - Forces the scraper to check for new OTPs immediately

- `/otpstats` - Show OTP statistics
  - Total OTPs found
  - Recent activity

#### System Management

- `/status` - Check bot status
  - Shows if scraper is running
  - Shows connection status
  - Shows file status

- `/restart` - Restart the scraper
  - Useful if scraper stops working

- `/logout` - Log out as admin

## File Management

### Important Files

1. **`numbers.txt`** - List of phone numbers (one per line)
   - Format: `1234567890` (10-15 digits)
   - Automatically organized by country code

2. **`countries.json`** - Country code definitions
   - Format: `{"1": {"name": "USA", "flag": "🇺🇸"}, ...}`
   - Auto-updated when numbers are added

3. **`sms_cdr_stats.txt`** - OTP data storage
   - **⚠️ IMPORTANT**: This file contains all OTP data
   - **Never manually delete or clear this file**
   - Format: `OTP Code: 123456 Number: 1234567890 Country: USA 🇺🇸 Service: WhatsApp Message: ... Date: ...`
   - New entries are prepended (added to top)

4. **`cookies.json`** - Login session cookies
   - Maintains login state
   - Auto-saved after successful login
   - Auto-loaded on bot startup

5. **`users.json`** - Registered users list
   - Format: `{"username1": true, "username2": true, ...}`

### File Protection

- **`sms_cdr_stats.txt` is protected**:
  - Never cleared automatically
  - New data is always prepended (added to top)
  - Existing data is preserved
  - If file appears empty, check:
    1. Scraper is running
    2. Chrome is logged in
    3. File permissions are correct

## Workflow

### Initial Setup

1. **Login to SMS Portal**:
   ```bash
   # Windows
   run_login_windows.bat
   
   # Linux/Mac
   python login_test.py
   ```

2. **Start the Bot**:
   ```bash
   npm start
   ```

3. **Login as Admin**:
   - Send `/adminlogin <password>` to bot

4. **Add Country Codes** (if needed):
   - `/addcountry 1 USA 🇺🇸`
   - `/addcountry 880 Bangladesh 🇧🇩`

5. **Upload Numbers**:
   - Send a `.txt` file with numbers
   - Bot will process and organize them

### Daily Operations

1. **Monitor OTPs**:
   - Users can use `/start` → "📞 Get Number" to get a number
   - Bot automatically sends OTPs when received
   - Check `/otpstats` for activity

2. **Add New Numbers**:
   - Upload new `.txt` file
   - Bot will add non-duplicate numbers

3. **Check Status**:
   - `/status` - Check if everything is running
   - `/checkotp <number>` - Check specific number

4. **Troubleshoot**:
   - If OTPs stop coming: `/restart`
   - If login fails: Run login script again
   - If file is empty: Check scraper status

## Troubleshooting

### Bot Not Responding

1. Check if bot is running: `npm start`
2. Check Telegram bot token in `.env` or `telegramNumberBot.js`
3. Check internet connection

### OTPs Not Coming

1. **Check Scraper Status**:
   - `/status` - Should show "Scraper: Running"
   - If not: `/restart`

2. **Check Login**:
   - Run login script: `python login_test_windows.py` (Windows) or `python login_test.py` (Linux/Mac)
   - Make sure Chrome stays open
   - Check `cookies.json` exists

3. **Check File**:
   - `/checkotp <number>` - Should show data
   - If empty: Check `sms_cdr_stats.txt` file
   - Make sure scraper is writing to file

4. **Check Chrome**:
   - Chrome must be running with remote debugging
   - Windows: Script handles this automatically
   - Linux/Mac: Use `chrome-debug.service` or manual Chrome launch

### Numbers Not Adding

1. **Check Format**:
   - Must be 10-15 digits
   - Must have valid country code

2. **Check Country Codes**:
   - `/listcountries` - See available codes
   - Add missing codes: `/addcountry <code> <name> [flag]`

3. **Check File Format**:
   - One number per line
   - No spaces or special characters
   - Only digits

### File Cleared/Empty

**This should NEVER happen automatically!**

If `sms_cdr_stats.txt` is empty:

1. **Check if scraper is running**: `/status`
2. **Check Chrome login**: Run login script
3. **Check file permissions**: Make sure bot can write
4. **Check disk space**: Make sure there's space
5. **Restore from backup** (if you have one)

**Protection**: The bot is configured to:
- Always prepend new data (never overwrite)
- Preserve existing data
- Never clear the file automatically

## Security

### Change Admin Password

Edit `telegramNumberBot.js` line 20:
```javascript
const ADMIN_PASSWORD = "YourNewPassword123!";
```

### Change Telegram Bot Token

1. Get new token from [@BotFather](https://t.me/botfather)
2. Set environment variable:
   ```bash
   set TELEGRAM_BOT_TOKEN=your_new_token
   ```
3. Or edit `telegramNumberBot.js` line 13 (not recommended for production)

### Protect Files

- **Never commit** `cookies.json`, `sms_cdr_stats.txt`, or `.env` to Git
- These files are in `.gitignore`
- Keep backups of important files

## Best Practices

1. **Regular Backups**:
   - Backup `sms_cdr_stats.txt` regularly
   - Backup `numbers.txt` and `countries.json`
   - Backup `cookies.json` (to avoid re-login)

2. **Monitor Status**:
   - Check `/status` daily
   - Monitor `/otpstats` for activity
   - Check bot logs for errors

3. **User Management**:
   - Only add trusted users
   - Remove inactive users regularly
   - Monitor user activity

4. **Number Management**:
   - Keep numbers organized by country
   - Remove used/expired numbers
   - Add new numbers regularly

5. **Maintenance**:
   - Restart bot weekly (if needed)
   - Check Chrome login weekly
   - Clear old OTP data (if file gets too large)

## Advanced

### Custom Scraping Interval

Edit `telegramNumberBot.js` - search for scraping interval (usually 30-60 seconds)

### Custom File Paths

Edit `telegramNumberBot.js` lines 23-27:
```javascript
const NUMBERS_FILE = path.join(__dirname, "numbers.txt");
const COUNTRIES_FILE = path.join(__dirname, "countries.json");
const USERS_FILE = path.join(__dirname, "users.json");
const OUTPUT_FILE = path.join(__dirname, "sms_cdr_stats.txt");
const COOKIES_FILE = path.join(__dirname, "cookies.json");
```

### Multiple Bots

Run multiple instances with different:
- Telegram bot tokens
- Port numbers
- File paths
- Chrome debug ports

## Support

For issues:
1. Check this guide first
2. Check bot logs
3. Check `/status` command
4. Review error messages

## Quick Reference

| Command | Description |
|---------|-------------|
| `/adminlogin <pass>` | Login as admin |
| `/adduser <username>` | Add user |
| `/removeuser <username>` | Remove user |
| `/listusers` | List users |
| `/addcountry <code> <name> [flag]` | Add country |
| `/listcountries` | List countries |
| `/checkotp <number>` | Check OTP |
| `/scrape` | Trigger scrape |
| `/otpstats` | OTP statistics |
| `/status` | Bot status |
| `/restart` | Restart scraper |
| `/logout` | Logout admin |

Upload `.txt` file to add numbers automatically.

