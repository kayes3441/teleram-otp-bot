#!/usr/bin/env python3
"""
Python Selenium Login Test Script
Based on the working Python code you provided
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re
import os
import subprocess
import sys

# Try to use webdriver-manager for automatic ChromeDriver management
try:
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    USE_WEBDRIVER_MANAGER = True
except ImportError:
    USE_WEBDRIVER_MANAGER = False
    print("💡 Tip: Install webdriver-manager for automatic ChromeDriver: pip install webdriver-manager")

# ---- CONFIG ----
URL = "http://185.2.83.39/ints/login"
USERNAME = os.getenv("SMS_USERNAME", "mhmehedi007")
PASSWORD = os.getenv("SMS_PASSWORD", "##2023@@$$")

print("🚀 Starting login test...")
print(f"Username: {USERNAME}")
print(f"Password: {'*' * len(PASSWORD)}\n")

# Start Xvfb if not running (for headless display)
print("🖥️ Checking for Xvfb...")
try:
    result = subprocess.run(['pgrep', '-x', 'Xvfb'], capture_output=True)
    if result.returncode != 0:
        print("   Starting Xvfb...")
        subprocess.Popen(['Xvfb', ':99', '-screen', '0', '1024x768x24'], 
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
        print("   ✅ Xvfb started")
    else:
        print("   ✅ Xvfb already running")
    os.environ['DISPLAY'] = ':99'
except Exception as e:
    print(f"   ⚠️ Xvfb check failed: {e}")

# ---- DRIVER ----
print("📱 Launching Chrome...")
options = webdriver.ChromeOptions()
# Essential options for server stability
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-gpu')
options.add_argument('--window-size=1920,1080')
options.add_argument('--disable-extensions')
options.add_argument('--disable-software-rasterizer')
options.add_argument('--disable-setuid-sandbox')
options.add_argument('--disable-background-timer-throttling')
options.add_argument('--disable-backgrounding-occluded-windows')
options.add_argument('--disable-renderer-backgrounding')
options.add_argument('--disable-features=TranslateUI,VizDisplayCompositor')
options.add_argument('--remote-debugging-port=9224')
options.add_argument('--disable-web-security')
options.add_argument('--disable-blink-features=AutomationControlled')

# Try system ChromeDriver first (more reliable on server)
print("   Using system ChromeDriver...")
driver = None
for attempt in range(3):
    try:
        driver = webdriver.Chrome(options=options)
        # Verify driver is working
        driver.current_url
        print(f"   ✅ Chrome started successfully (attempt {attempt + 1})")
        break
    except Exception as e:
        print(f"   ⚠️ Attempt {attempt + 1} failed: {str(e)[:100]}")
        if attempt < 2:
            print("   Retrying...")
            time.sleep(2)
            if driver:
                try:
                    driver.quit()
                except:
                    pass
        else:
            print("   Trying webdriver-manager...")
            if USE_WEBDRIVER_MANAGER:
                try:
                    service = Service(ChromeDriverManager().install())
                    driver = webdriver.Chrome(service=service, options=options)
                    driver.current_url  # Verify
                    print("   ✅ Using webdriver-manager ChromeDriver")
                    break
                except Exception as e2:
                    print(f"❌ Error: {e2}")
                    print("\n💡 Solutions:")
                    print("   1. Check ChromeDriver: chromedriver --version")
                    print("   2. Install ChromeDriver: apt install chromium-chromedriver")
                    print("   3. Or use: npm run login (Node.js script)")
                    exit(1)
            else:
                print(f"❌ All attempts failed")
                print("\n💡 Solutions:")
                print("   1. Check ChromeDriver: chromedriver --version")
                print("   2. Install webdriver-manager: pip install webdriver-manager")
                print("   3. Or use: npm run login (Node.js script)")
                exit(1)

if not driver:
    print("❌ Failed to start Chrome")
    exit(1)

print("✅ Chrome launched\n")

# Retry mechanism for navigation
max_retries = 3
for attempt in range(max_retries):
    try:
        # Navigate to login page
        print(f"🌐 Navigating to: {URL} (attempt {attempt + 1}/{max_retries})...")
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        driver.get(URL)
        time.sleep(3)
        # Verify page loaded
        current_url = driver.current_url
        print(f"✅ Page loaded: {current_url}\n")
        break
    except Exception as nav_error:
        print(f"⚠️ Navigation attempt {attempt + 1} failed: {nav_error}")
        if attempt < max_retries - 1:
            print("   Retrying...")
            time.sleep(2)
            # Recreate driver if needed
            try:
                driver.quit()
            except:
                pass
            driver = webdriver.Chrome(options=options)
        else:
            raise

try:
    
    # ---- FILL USERNAME & PASSWORD ----
    print("📝 Filling username...")
    username_field = driver.find_element(By.NAME, "username")
    username_field.clear()
    username_field.send_keys(USERNAME)
    print(f"✅ Username filled: {USERNAME}\n")
    time.sleep(0.5)
    
    print("📝 Filling password...")
    password_field = driver.find_element(By.NAME, "password")
    password_field.clear()
    password_field.send_keys(PASSWORD)
    print("✅ Password filled\n")
    time.sleep(0.5)
    
    # Check if session is still valid
    try:
        driver.current_url
    except:
        print("❌ Browser session lost. Restarting...")
        driver.quit()
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        driver.get(URL)
        time.sleep(3)
    
    # ---- READ & SOLVE MATH CAPTCHA ----
    print("🔢 Solving math CAPTCHA...")
    
    # Find element containing math question (from wrap-input100 div)
    captcha_text = None
    try:
        # Method 1: Find the wrap-input100 div that contains the math question
        captcha_div = driver.find_element(By.XPATH, "//div[contains(@class, 'wrap-input100')]//*[contains(text(), 'What is')]")
        captcha_text = captcha_div.text
        print(f"   Found CAPTCHA in div: {captcha_text}")
    except:
        try:
            # Method 2: Find by XPath containing math operators
            captcha_element = driver.find_element(By.XPATH, "//*[contains(text(), 'What is') and (contains(text(), '+') or contains(text(), '-') or contains(text(), '*'))]")
            captcha_text = captcha_element.text
            print(f"   Found CAPTCHA by XPath: {captcha_text}")
        except:
            try:
                # Method 3: Find in body text
                body_text = driver.find_element(By.TAG_NAME, "body").text
                # Look for math pattern
                math_match = re.search(r'What is \d+\s*[+\-*]\s*\d+\s*=\s*\?', body_text)
                if math_match:
                    captcha_text = math_match.group()
                    print(f"   Found CAPTCHA in body text: {captcha_text}")
            except Exception as e:
                print(f"⚠️ Could not find CAPTCHA text: {e}")
    
    if captcha_text:
        print(f"   Found CAPTCHA: {captcha_text}")
        
        # Extract digits
        numbers = list(map(int, re.findall(r'\d+', captcha_text)))
        
        if len(numbers) >= 2:
            # Detect operator
            if "+" in captcha_text:
                answer = numbers[0] + numbers[1]
                operator = "+"
            elif "-" in captcha_text:
                answer = numbers[0] - numbers[1]
                operator = "-"
            elif "*" in captcha_text:
                answer = numbers[0] * numbers[1]
                operator = "*"
            else:
                # Default to addition
                answer = numbers[0] + numbers[1]
                operator = "+"
            
            print(f"   Calculation: {numbers[0]} {operator} {numbers[1]} = {answer}")
            
            # ---- INPUT ANSWER ----
            print("📝 Filling CAPTCHA answer...")
            # Find the capt input field (type="number" in wrap-input100)
            capt_field = driver.find_element(By.NAME, "capt")
            capt_field.clear()
            # For number input, send as string
            capt_field.send_keys(str(answer))
            print(f"✅ CAPTCHA answer filled: {answer}\n")
            time.sleep(0.5)
            
            # Verify the value was set
            capt_value = capt_field.get_attribute('value')
            if capt_value == str(answer):
                print(f"✅ Verified: CAPTCHA field contains {capt_value}\n")
            else:
                print(f"⚠️ Warning: CAPTCHA field value is '{capt_value}', expected '{answer}'\n")
        else:
            print("⚠️ Could not extract numbers from CAPTCHA")
    else:
        print("⚠️ No CAPTCHA found (might not be required)\n")
    
    # Check session before clicking
    try:
        driver.current_url
    except:
        print("❌ Browser session lost before clicking login button")
        raise
    
    # ---- CLICK LOGIN ----
    print("🔘 Clicking login button...")
    login_clicked = False
    
    # Method 1: Try CLASS_NAME (most reliable)
    try:
        login_button = driver.find_element(By.CLASS_NAME, "login100-form-btn")
        # Check if button is visible and enabled
        if login_button.is_displayed() and login_button.is_enabled():
            # Scroll into view
            driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
            time.sleep(0.5)
            # Click using JavaScript (more reliable)
            driver.execute_script("arguments[0].click();", login_button)
            login_clicked = True
            print("✅ Login button clicked (JavaScript click)\n")
        else:
            print("⚠️ Login button found but not visible/enabled")
    except Exception as e:
        print(f"⚠️ CLASS_NAME method failed: {e}")
        # Check if session is still valid
        try:
            driver.current_url
        except:
            print("❌ Browser session lost. Chrome may have crashed.")
            raise
    
    # Method 2: Try XPath
    if not login_clicked:
        try:
            login_button = driver.find_element(By.XPATH, "//button[contains(@class, 'login100-form-btn')]")
            driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", login_button)
            login_clicked = True
            print("✅ Login button clicked (XPath method)\n")
        except:
            pass
    
    # Method 3: Try CSS selector
    if not login_clicked:
        try:
            login_button = driver.find_element(By.CSS_SELECTOR, ".login100-form-btn")
            driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", login_button)
            login_clicked = True
            print("✅ Login button clicked (CSS selector)\n")
        except:
            pass
    
    # Method 4: Try regular click
    if not login_clicked:
        try:
            login_button = driver.find_element(By.CLASS_NAME, "login100-form-btn")
            login_button.click()
            login_clicked = True
            print("✅ Login button clicked (regular click)\n")
        except Exception as e:
            print(f"⚠️ Regular click failed: {e}")
    
    # Method 5: Try form submit
    if not login_clicked:
        try:
            form = driver.find_element(By.TAG_NAME, "form")
            form.submit()
            login_clicked = True
            print("✅ Form submitted\n")
        except:
            pass
    
    if not login_clicked:
        print("❌ Could not click login button with any method\n")
        print("💡 Debug info:")
        try:
            # List all buttons on page
            buttons = driver.find_elements(By.TAG_NAME, "button")
            inputs = driver.find_elements(By.XPATH, "//input[@type='submit' or @type='button']")
            print(f"   Found {len(buttons)} button(s) and {len(inputs)} input(s)")
            for i, btn in enumerate(buttons):
                print(f"   Button {i+1}: class='{btn.get_attribute('class')}', text='{btn.text[:50]}'")
        except:
            pass
    
    # Wait for navigation
    print("⏳ Waiting for login response...")
    time.sleep(5)
    
    # Check if login was successful
    current_url = driver.current_url
    print(f"📍 Current URL: {current_url}\n")
    
    if "/login" not in current_url and "/ints/login" not in current_url:
        print("✅ Login successful! Not on login page anymore.")
        print(f"✅ Redirected to: {current_url}\n")
        
        # Save cookies for session persistence
        print("🍪 Saving cookies for session persistence...")
        try:
            import json
            cookies = driver.get_cookies()
            with open('cookies.json', 'w') as f:
                json.dump(cookies, f, indent=2)
            print(f"✅ Saved {len(cookies)} cookie(s) to cookies.json")
            print("💡 The bot can now use these cookies to stay logged in!\n")
        except Exception as cookie_error:
            print(f"⚠️ Could not save cookies: {cookie_error}\n")
    else:
        print("⚠️ Still on login page - login may have failed")
        print("   Check the page for error messages\n")
    
    # Keep browser open for inspection
    print("💡 Browser will stay open for 30 seconds for inspection...")
    print("   (Close manually or wait for timeout)\n")
    time.sleep(30)
    
except Exception as e:
    print(f"\n❌ Error occurred: {e}")
    import traceback
    traceback.print_exc()
    
finally:
    print("\n🔚 Closing browser...")
    driver.quit()
    print("✅ Done!")

