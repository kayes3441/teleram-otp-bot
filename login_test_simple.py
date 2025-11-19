#!/usr/bin/env python3
"""
Simplified Python Login Script - Uses existing Chrome debug service
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import re
import os
import json

URL = "http://185.2.83.39/ints/login"
USERNAME = os.getenv("SMS_USERNAME", "mhmehedi007")
PASSWORD = os.getenv("SMS_PASSWORD", "##2023@@$$")
COOKIES_FILE = "cookies.json"

print("🚀 Starting simplified login...")
print(f"Username: {USERNAME}\n")

# Check if Chrome debug service is running
print("🔍 Checking Chrome debug service...")
import urllib.request
try:
    response = urllib.request.urlopen('http://localhost:9222/json/version', timeout=2)
    print("✅ Chrome debug service is running")
    use_debug_service = True
except:
    print("⚠️ Chrome debug service not running, will launch new Chrome")
    use_debug_service = False

if use_debug_service:
    # Connect to existing Chrome
    print("📱 Connecting to existing Chrome...")
    options = Options()
    options.add_experimental_option("debuggerAddress", "localhost:9222")
    try:
        driver = webdriver.Chrome(options=options)
        print("✅ Connected to existing Chrome\n")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        print("💡 Make sure Chrome debug service is running: systemctl start chrome-debug")
        exit(1)
else:
    # Launch new Chrome with minimal options
    print("📱 Launching new Chrome...")
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    try:
        driver = webdriver.Chrome(options=options)
        print("✅ Chrome launched\n")
    except Exception as e:
        print(f"❌ Failed to launch Chrome: {e}")
        print("💡 Try: npm run login (Node.js script is more stable)")
        exit(1)

try:
    # Navigate
    print(f"🌐 Navigating to: {URL}")
    driver.get(URL)
    time.sleep(3)
    print(f"✅ Page loaded: {driver.current_url}\n")
    
    # Fill username
    print("📝 Filling username...")
    username_field = driver.find_element(By.NAME, "username")
    username_field.clear()
    username_field.send_keys(USERNAME)
    print(f"✅ Username filled\n")
    time.sleep(0.5)
    
    # Fill password
    print("📝 Filling password...")
    password_field = driver.find_element(By.NAME, "password")
    password_field.clear()
    password_field.send_keys(PASSWORD)
    print("✅ Password filled\n")
    time.sleep(0.5)
    
    # Solve CAPTCHA
    print("🔢 Solving CAPTCHA...")
    try:
        body_text = driver.find_element(By.TAG_NAME, "body").text
        math_match = re.search(r'What is (\d+)\s*([+\-*])\s*(\d+)\s*=\s*\?', body_text)
        if math_match:
            num1 = int(math_match.group(1))
            num2 = int(math_match.group(3))
            op = math_match.group(2)
            if op == '+':
                answer = num1 + num2
            elif op == '-':
                answer = num1 - num2
            else:
                answer = num1 * num2
            print(f"   Found: {num1} {op} {num2} = {answer}")
            
            capt_field = driver.find_element(By.NAME, "capt")
            capt_field.clear()
            capt_field.send_keys(str(answer))
            print(f"✅ CAPTCHA filled: {answer}\n")
            time.sleep(0.5)
    except Exception as e:
        print(f"⚠️ CAPTCHA not found or error: {e}\n")
    
    # Click login
    print("🔘 Clicking login button...")
    try:
        login_button = driver.find_element(By.CLASS_NAME, "login100-form-btn")
        driver.execute_script("arguments[0].click();", login_button)
        print("✅ Login button clicked\n")
    except Exception as e:
        print(f"⚠️ Click failed: {e}, trying Enter key...")
        password_field.send_keys("\n")
    
    # Wait for navigation
    print("⏳ Waiting for login...")
    time.sleep(5)
    
    # Check result
    current_url = driver.current_url
    print(f"📍 Current URL: {current_url}\n")
    
    if "/login" not in current_url and "/ints/login" not in current_url:
        print("✅ Login successful!\n")
        
        # Save cookies
        print("🍪 Saving cookies...")
        cookies = driver.get_cookies()
        with open(COOKIES_FILE, 'w') as f:
            json.dump(cookies, f, indent=2)
        print(f"✅ Saved {len(cookies)} cookies to {COOKIES_FILE}\n")
    else:
        print("⚠️ Still on login page - login may have failed\n")
    
    print("✅ Done!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    if not use_debug_service and driver:
        driver.quit()

