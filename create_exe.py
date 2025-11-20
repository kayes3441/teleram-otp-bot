#!/usr/bin/env python3
"""
Script to create a standalone .exe file using PyInstaller
This will bundle everything into a single executable
"""

import os
import sys
import subprocess

print("=" * 50)
print("Creating Standalone .exe File")
print("=" * 50)
print()

# Check if PyInstaller is installed
try:
    import PyInstaller
    print("[OK] PyInstaller is installed")
except ImportError:
    print("[INFO] Installing PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    print("[OK] PyInstaller installed")

print()
print("Building .exe file...")
print("This may take a few minutes...")
print()

# PyInstaller command
cmd = [
    "pyinstaller",
    "--onefile",  # Single executable
    "--windowed",  # No console window (use --console if you want to see output)
    "--name=TelegramOTPBot",  # Name of the exe
    "--icon=NONE",  # No icon (you can add one later)
    "--add-data=login_test_windows.py;.",  # Include the login script
    "--hidden-import=selenium",
    "--hidden-import=webdriver_manager",
    "--hidden-import=webdriver_manager.chrome",
    "--hidden-import=selenium.webdriver",
    "--hidden-import=selenium.webdriver.chrome",
    "--hidden-import=selenium.webdriver.chrome.service",
    "--hidden-import=selenium.webdriver.chrome.options",
    "--hidden-import=selenium.webdriver.common.by",
    "--hidden-import=selenium.webdriver.support.ui",
    "--hidden-import=selenium.webdriver.support.expected_conditions",
    "auto_start_wrapper.py"  # We'll create this wrapper
]

try:
    subprocess.check_call(cmd)
    print()
    print("=" * 50)
    print("SUCCESS! .exe file created!")
    print("=" * 50)
    print()
    print("Location: dist/TelegramOTPBot.exe")
    print()
    print("You can now distribute this .exe file.")
    print("It includes everything needed to run the bot.")
    print()
except subprocess.CalledProcessError as e:
    print()
    print("=" * 50)
    print("ERROR: Failed to create .exe")
    print("=" * 50)
    print()
    print(f"Error: {e}")
    print()
    sys.exit(1)

