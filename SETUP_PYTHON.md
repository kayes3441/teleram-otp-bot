# Python Setup Guide - Fix Externally Managed Environment Error

This error happens on newer macOS systems. Here are the solutions:

---

## Solution 1: Use Virtual Environment (Recommended)

### Step 1: Create Virtual Environment
```bash
cd ~/Desktop/teleram-otp-bot
python3 -m venv venv
```

### Step 2: Activate Virtual Environment
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Selenium
```bash
pip install selenium
```

### Step 4: Install ChromeDriver
```bash
brew install chromedriver
```

### Step 5: Run Script
```bash
python login_test.py
```

### Step 6: Deactivate (when done)
```bash
deactivate
```

---

## Solution 2: Use --user Flag (Simpler)

```bash
pip3 install --user selenium
```

Then run:
```bash
python3 login_test.py
```

---

## Solution 3: Use pipx (For Applications)

```bash
# Install pipx
brew install pipx

# Install selenium (if needed as standalone)
pipx install selenium
```

---

## Quick Setup Script

I'll create a setup script for you:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install selenium
pip install selenium

# Install chromedriver
brew install chromedriver

# Run test
python login_test.py
```

---

## Recommended: Use Virtual Environment

This is the cleanest approach and won't affect your system Python.

