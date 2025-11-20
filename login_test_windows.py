#!/usr/bin/env python3
"""
Windows-Friendly Python Login Script
Usage: python login_test_windows.py
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
import os
import json

URL = "http://185.2.83.39/ints/login"
USERNAME = os.getenv("SMS_USERNAME", "mhmehedi007")
PASSWORD = os.getenv("SMS_PASSWORD", "##2023@@$$")
COOKIES_FILE = "cookies.json"

print("🚀 Starting login...")
print(f"Username: {USERNAME}\n")

# Chrome options for Windows
print("📱 Setting up Chrome...")
options = Options()

# Windows-specific options
options.add_argument('--disable-blink-features=AutomationControlled')
options.add_argument('--disable-web-security')
options.add_argument('--window-size=1920,1080')
options.add_argument('--start-maximized')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# Try to connect to existing Chrome debug service first (if running)
driver = None
try:
    import urllib.request
    import json as json_lib
    urllib.request.urlopen('http://localhost:9222/json/version', timeout=2)
    print("   Using existing Chrome debug service...")
    
    # Get list of all tabs
    try:
        tabs_response = urllib.request.urlopen('http://localhost:9222/json', timeout=2)
        tabs_data = json_lib.loads(tabs_response.read().decode())
        print(f"   Found {len(tabs_data)} open tab(s)")
        
        # Find a tab with the login page or use the first one
        target_tab = None
        for tab in tabs_data:
            if URL in tab.get('url', '') or 'login' in tab.get('url', '').lower():
                target_tab = tab
                print(f"   Found login page tab: {tab.get('url', '')}")
                break
        
        if not target_tab and tabs_data:
            target_tab = tabs_data[0]
            print(f"   Using first tab: {target_tab.get('url', '')}")
        
        # Connect to Chrome
        options.add_experimental_option("debuggerAddress", "localhost:9222")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Switch to the correct tab if we found one
        if target_tab:
            try:
                # Get all window handles
                handles = driver.window_handles
                if handles:
                    # Switch to the first handle (usually the active one)
                    driver.switch_to.window(handles[0])
                    print(f"   Switched to tab: {driver.current_url}")
            except:
                pass
        
        print("✅ Connected to existing Chrome\n")
    except Exception as tab_error:
        # Fallback: just connect without tab switching
        options.add_experimental_option("debuggerAddress", "localhost:9222")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        print("✅ Connected to existing Chrome (tab check skipped)\n")
except Exception as e:
    # Launch new Chrome (visible window for Windows)
    print("   Launching new Chrome window...")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(30)
    driver.implicitly_wait(10)
    print("✅ Chrome launched\n")

if not driver:
    print("❌ Failed to get Chrome driver")
    exit(1)

try:
    # Wait for page to load
    wait = WebDriverWait(driver, 20)
    
    # Switch to default content (in case we're in an iframe)
    try:
        driver.switch_to.default_content()
    except:
        pass
    
    # Navigate
    print(f"🌐 Navigating to: {URL}")
    current_url = driver.current_url
    print(f"   Current URL before navigation: {current_url}")
    
    # If we're already on the login page, refresh it
    if URL in current_url or ("login" in current_url.lower() and "185.2.83.39" in current_url):
        print("   Already on login page, refreshing...")
        driver.refresh()
    else:
        print("   Navigating to login page...")
        driver.get(URL)
    
    # Switch back to default content after navigation
    try:
        driver.switch_to.default_content()
    except:
        pass
    
    # Wait for page to be ready
    print("   Waiting for page to load...")
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    time.sleep(3)  # Extra wait for dynamic content
    
    print(f"✅ Page loaded: {driver.current_url}\n")
    
    # Wait for form elements to appear (they might load via JavaScript)
    print("⏳ Waiting for form elements to appear...")
    try:
        # Wait for any input field to appear
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "input")))
        print("✅ Input fields detected\n")
        time.sleep(2)  # Extra wait
    except:
        print("⚠️ No input fields found yet\n")
    
    # Debug: Check page source
    try:
        page_source = driver.page_source
        has_username = "name=\"username\"" in page_source or "name='username'" in page_source or 'name="username"' in page_source
        has_password = "name=\"password\"" in page_source or "name='password'" in page_source or 'name="password"' in page_source
        print(f"🔍 Page source check - Has username field: {has_username}, Has password field: {has_password}")
        
        # Show snippet of page source
        if "input" in page_source.lower():
            input_snippet = page_source[page_source.lower().find("input"):page_source.lower().find("input")+200]
            print(f"   Page source snippet: {input_snippet[:150]}...")
    except Exception as e:
        print(f"   Page source check error: {e}")
    
    # Wait for page to load
    wait = WebDriverWait(driver, 20)  # Increased timeout
    
    # Debug: Check what's on the page
    print("🔍 Checking page structure...")
    try:
        # Check for iframes
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        print(f"   Found {len(iframes)} iframe(s)")
        for i, iframe in enumerate(iframes):
            iframe_id = iframe.get_attribute("id")
            iframe_name = iframe.get_attribute("name")
            iframe_src = iframe.get_attribute("src")
            print(f"   Iframe {i+1}: id='{iframe_id}', name='{iframe_name}', src='{iframe_src}'")
        
        # Check for form elements in main page
        username_by_id = driver.find_elements(By.ID, "username")
        username_by_name = driver.find_elements(By.NAME, "username")
        password_by_id = driver.find_elements(By.ID, "password")
        password_by_name = driver.find_elements(By.NAME, "password")
        print(f"   Main page - Username: ID={len(username_by_id)}, NAME={len(username_by_name)}")
        print(f"   Main page - Password: ID={len(password_by_id)}, NAME={len(password_by_name)}")
    except Exception as e:
        print(f"   Debug error: {e}")
    
    # Switch to iframe first (very important!)
    print("\n🖼️ Switching to iframe...")
    iframe_switched = False
    try:
        wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, "myframemenu")))
        print("✅ Switched to iframe 'myframemenu'\n")
        iframe_switched = True
        time.sleep(2)
    except:
        print("⚠️ Iframe 'myframemenu' not found, trying first iframe...")
        try:
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            if iframes:
                driver.switch_to.frame(iframes[0])
                print(f"✅ Switched to first iframe (id='{iframes[0].get_attribute('id')}', name='{iframes[0].get_attribute('name')}')\n")
                iframe_switched = True
                time.sleep(2)
            else:
                print("⚠️ No iframes found, staying on main page\n")
        except Exception as e:
            print(f"⚠️ Could not switch to iframe: {e}\n")
    
    # Debug: Check elements after iframe switch
    if iframe_switched:
        print("🔍 Checking elements inside iframe...")
        try:
            username_by_id = driver.find_elements(By.ID, "username")
            username_by_name = driver.find_elements(By.NAME, "username")
            password_by_id = driver.find_elements(By.ID, "password")
            password_by_name = driver.find_elements(By.NAME, "password")
            print(f"   Inside iframe - Username: ID={len(username_by_id)}, NAME={len(username_by_name)}")
            print(f"   Inside iframe - Password: ID={len(password_by_id)}, NAME={len(password_by_name)}")
        except Exception as e:
            print(f"   Debug error: {e}")
    
    # Fill username - try NAME first (since HTML shows name="username")
    print("📝 Filling username...")
    username_input = None
    try:
        # Try NAME first (as shown in HTML)
        username_input = wait.until(EC.presence_of_element_located((By.NAME, "username")))
    except:
        try:
            # Try ID
            username_input = wait.until(EC.presence_of_element_located((By.ID, "username")))
        except:
            try:
                # Try CSS selector
                username_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']")))
            except:
                try:
                    # Try class
                    username_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input.input100[type='text']")))
                except:
                    print("❌ Username field not found (tried NAME, ID, CSS)")
                    raise
    
    username_input.clear()
    username_input.send_keys(USERNAME)
    print("✅ Username filled\n")
    time.sleep(0.5)
    
    # Fill password - try NAME first
    print("📝 Filling password...")
    password_input = None
    try:
        # Try NAME first
        password_input = wait.until(EC.presence_of_element_located((By.NAME, "password")))
    except:
        try:
            # Try ID
            password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
        except:
            try:
                # Try CSS selector
                password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='password']")))
            except:
                try:
                    # Try type=password
                    password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
                except:
                    print("❌ Password field not found (tried NAME, ID, CSS)")
                    raise
    
    password_input.clear()
    password_input.send_keys(PASSWORD)
    print("✅ Password filled\n")
    time.sleep(0.5)
    
    # Solve CAPTCHA
    print("🔢 Solving CAPTCHA...")
    captcha_result = None
    try:
        body_text = driver.find_element(By.TAG_NAME, "body").text
        math_match = re.search(r'What is (\d+)\s*([+\-*])\s*(\d+)\s*=\s*\?', body_text)
        if math_match:
            num1 = int(math_match.group(1))
            num2 = int(math_match.group(3))
            op = math_match.group(2)
            if op == '+':
                captcha_result = num1 + num2
            elif op == '-':
                captcha_result = num1 - num2
            else:
                captcha_result = num1 * num2
            print(f"   Found: {num1} {op} {num2} = {captcha_result}")
            
            captcha_input = wait.until(EC.presence_of_element_located((By.NAME, "capt")))
            captcha_input.clear()
            captcha_input.send_keys(str(captcha_result))
            print(f"✅ CAPTCHA filled: {captcha_result}\n")
            time.sleep(0.5)
    except Exception as e:
        print(f"⚠️ CAPTCHA not found: {e}\n")
    
    # Click login
    print("🔘 Clicking login button...")
    try:
        login_button = driver.find_element(By.CLASS_NAME, "login100-form-btn")
        driver.execute_script("arguments[0].click();", login_button)
        print("✅ Login clicked\n")
    except Exception as e:
        print(f"⚠️ Click failed: {e}, trying Enter...")
        password_input.send_keys("\n")
    
    # Wait
    print("⏳ Waiting...")
    time.sleep(5)
    
    # Check result
    current_url = driver.current_url
    print(f"📍 URL: {current_url}\n")
    
    if "/login" not in current_url and "/ints/login" not in current_url:
        print("✅ Login successful!\n")
        
        # Save cookies
        print("🍪 Saving cookies...")
        cookies = driver.get_cookies()
        with open(COOKIES_FILE, 'w') as f:
            json.dump(cookies, f, indent=2)
        print(f"✅ Saved {len(cookies)} cookies\n")
    else:
        print("⚠️ Still on login page\n")
    
    print("✅ Done!")
    print("\n💡 Keep this window open to maintain login session.")
    print("   Press Ctrl+C to exit (this will close Chrome if it was launched by this script).")
    
    # Keep the browser open
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("\n\n👋 Exiting...")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    # Don't quit if connected to existing Chrome
    if 'debuggerAddress' not in str(options.experimental_options):
        try:
            driver.quit()
        except:
            pass

