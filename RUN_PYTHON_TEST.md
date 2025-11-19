# How to Run Python Login Test

Quick guide to run the Python Selenium login test script.

---

## Step 1: Install Python (if not installed)

**Check if Python is installed:**
```bash
python3 --version
```

**If not installed:**
- Mac: `brew install python3`
- Or download from: https://www.python.org/downloads/

---

## Step 2: Install Selenium

```bash
pip3 install selenium
```

Or if you have both Python 2 and 3:
```bash
pip install selenium
```

---

## Step 3: Install ChromeDriver

### Option A: Using Homebrew (Mac - Easiest)
```bash
brew install chromedriver
```

### Option B: Manual Installation
1. Download ChromeDriver: https://chromedriver.chromium.org/downloads
2. Make sure it matches your Chrome version
3. Add to PATH or place in project folder

### Option C: Using webdriver-manager (Automatic)
```bash
pip3 install webdriver-manager
```

Then update the script to use:
```python
from webdriver_manager.chrome import ChromeDriverManager
driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
```

---

## Step 4: Update Credentials

Edit `login_test.py` and update:
```python
USERNAME = "mhmehedi007"  # Your username
PASSWORD = "##2023@@$$"   # Your password
```

Or use environment variables:
```bash
export SMS_USERNAME="mhmehedi007"
export SMS_PASSWORD="##2023@@$$"
```

---

## Step 5: Run the Script

```bash
python3 login_test.py
```

Or:
```bash
python login_test.py
```

---

## What It Will Do:

1. ✅ Launch Chrome browser
2. ✅ Navigate to login page
3. ✅ Fill username
4. ✅ Fill password
5. ✅ Solve math CAPTCHA
6. ✅ Click login button
7. ✅ Check if login was successful
8. ✅ Keep browser open for 30 seconds so you can see the result

---

## Troubleshooting

### "chromedriver not found"
```bash
# Install ChromeDriver
brew install chromedriver

# Or download manually and add to PATH
```

### "selenium not found"
```bash
pip3 install selenium
```

### "Chrome version mismatch"
Make sure ChromeDriver version matches your Chrome version:
```bash
# Check Chrome version
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version

# Download matching ChromeDriver from:
# https://chromedriver.chromium.org/downloads
```

### Script runs but browser doesn't open
- Check if Chrome is installed
- Try running without headless mode (script is already set to show browser)

---

## Quick Test

```bash
# 1. Install dependencies
pip3 install selenium

# 2. Install ChromeDriver
brew install chromedriver

# 3. Run script
python3 login_test.py
```

---

## Expected Output

```
🚀 Starting login test...
Username: mhmehedi007
Password: ********

📱 Launching Chrome...
✅ Chrome launched

🌐 Navigating to: http://185.2.83.39/ints/login
✅ Page loaded: http://185.2.83.39/ints/login

📝 Filling username...
✅ Username filled: mhmehedi007

📝 Filling password...
✅ Password filled

🔢 Solving math CAPTCHA...
   Found CAPTCHA: What is 10 + 5 = ?
   Calculation: 10 + 5 = 15
📝 Filling CAPTCHA answer...
✅ CAPTCHA answer filled: 15

🔘 Clicking login button...
✅ Login button clicked

⏳ Waiting for login response...
📍 Current URL: http://185.2.83.39/ints/agent/SMSCDRStats

✅ Login successful! Not on login page anymore.
✅ Redirected to: http://185.2.83.39/ints/agent/SMSCDRStats

💡 Browser will stay open for 30 seconds for inspection...
```

---

**That's it! The script will test the login for you! 🎉**

