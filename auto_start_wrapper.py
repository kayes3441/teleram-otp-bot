#!/usr/bin/env python3
"""
Wrapper script that will be compiled to .exe
This handles everything automatically
"""

import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path

def check_python():
    """Check if Python is available"""
    try:
        import sys
        return True, sys.version
    except:
        return False, None

def install_package(package):
    """Install a Python package"""
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "--quiet", "--disable-pip-version-check", package
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except:
        return False

def main():
    print("=" * 50)
    print("Telegram OTP Bot - Auto Start")
    print("=" * 50)
    print()
    
    # Step 1: Check Python packages
    print("[1/4] Checking dependencies...")
    try:
        import selenium
        import webdriver_manager
        print("[OK] All packages installed")
    except ImportError:
        print("[INFO] Installing required packages...")
        if not install_package("selenium"):
            print("[ERROR] Failed to install selenium")
            input("Press Enter to exit...")
            return
        if not install_package("webdriver-manager"):
            print("[ERROR] Failed to install webdriver-manager")
            input("Press Enter to exit...")
            return
        print("[OK] Packages installed")
    print()
    
    # Step 2: Set environment variables
    print("[2/4] Setting up environment...")
    if not os.getenv("SMS_USERNAME"):
        os.environ["SMS_USERNAME"] = "mhmehedi007"
    if not os.getenv("SMS_PASSWORD"):
        os.environ["SMS_PASSWORD"] = "##2023@@$$"
    print("[OK] Environment configured")
    print()
    
    # Step 3: Find and run login script
    print("[3/4] Starting login...")
    
    # Try to find login_test_windows.py
    script_dir = Path(__file__).parent if hasattr(sys, '_MEIPASS') else Path.cwd()
    login_script = script_dir / "login_test_windows.py"
    
    # If running from .exe, check temp directory
    if hasattr(sys, '_MEIPASS'):
        # Extract login script from bundled resources
        try:
            import pkgutil
            login_data = pkgutil.get_data(__name__, "login_test_windows.py")
            if login_data:
                temp_script = Path(tempfile.gettempdir()) / "login_test_windows.py"
                temp_script.write_bytes(login_data)
                login_script = temp_script
        except:
            pass
    
    if not login_script.exists():
        print(f"[ERROR] Login script not found: {login_script}")
        print("Please make sure login_test_windows.py is in the same directory")
        input("Press Enter to exit...")
        return
    
    print(f"[OK] Found login script: {login_script}")
    print()
    
    # Step 4: Run login script
    print("[4/4] Running login script...")
    print()
    print("=" * 50)
    print("Chrome will open automatically")
    print("Login will happen automatically")
    print("Keep Chrome open to maintain session")
    print("=" * 50)
    print()
    
    try:
        subprocess.run([sys.executable, str(login_script)], check=True)
        print()
        print("=" * 50)
        print("Login successful!")
        print("=" * 50)
        print()
        print("Keep Chrome open to maintain the session.")
        print("You can now start the bot with: npm start")
        print()
    except subprocess.CalledProcessError:
        print()
        print("=" * 50)
        print("Login failed!")
        print("=" * 50)
        print()
        print("Please check:")
        print("1. Internet connection")
        print("2. Login credentials")
        print("3. Login URL is accessible")
        print()
    except KeyboardInterrupt:
        print()
        print("Stopped by user")
        print()
    
    input("Press Enter to exit...")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        input("Press Enter to exit...")

