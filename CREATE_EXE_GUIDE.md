# Create Standalone .exe File Guide

## Quick Method (Recommended)

### Option 1: Use the Enhanced Batch File (Easiest)

Just **double-click `auto_start.bat`** - it does everything automatically!

This batch file will:
- ✅ Check Python installation
- ✅ Install all required packages
- ✅ Run the login script
- ✅ Optionally start the bot

**No .exe needed!** The batch file is already an executable.

---

## Option 2: Create a True .exe File

If you want a single `.exe` file that includes everything:

### Step 1: Install PyInstaller

```cmd
pip install pyinstaller
```

### Step 2: Create the .exe

**Method A: Using the helper script**
```cmd
python create_exe.py
```

**Method B: Manual command**
```cmd
pyinstaller --onefile --console --name=TelegramOTPBot auto_start_wrapper.py
```

### Step 3: Find your .exe

The `.exe` file will be in the `dist` folder:
- `dist/TelegramOTPBot.exe`

### Step 4: Run it!

Just double-click `TelegramOTPBot.exe` - it will:
- ✅ Check and install dependencies automatically
- ✅ Run the login script
- ✅ Handle everything for you

---

## Option 3: Use Auto-py-to-exe (GUI Tool)

1. **Install auto-py-to-exe**:
   ```cmd
   pip install auto-py-to-exe
   ```

2. **Run the GUI**:
   ```cmd
   auto-py-to-exe
   ```

3. **Configure**:
   - Script Location: `auto_start_wrapper.py`
   - Onefile: ✅ One File
   - Console Window: ✅ Console Based
   - Icon: (optional) Add an icon file

4. **Convert**: Click "CONVERT .PY TO .EXE"

5. **Find your .exe**: Check the output folder

---

## What's Included

The `.exe` file includes:
- ✅ Python runtime
- ✅ Selenium
- ✅ WebDriver Manager
- ✅ All dependencies
- ✅ Login script

**Size**: ~50-100 MB (includes Python and all libraries)

---

## Distribution

You can share the `.exe` file with others. They just need to:
1. Double-click the `.exe`
2. Wait for it to install dependencies (first run only)
3. Login happens automatically

**Note**: The `.exe` will download ChromeDriver automatically on first run.

---

## Troubleshooting

### "Windows protected your PC"
- Click "More info" → "Run anyway"
- This is normal for unsigned executables

### "Failed to install packages"
- Check internet connection
- Run as Administrator
- Disable antivirus temporarily

### "Chrome not found"
- Make sure Google Chrome is installed
- The script will try to download ChromeDriver automatically

### Large file size
- This is normal - Python and all libraries are bundled
- First run may be slower (extracting files)

---

## Recommendation

**For most users**: Just use `auto_start.bat` - it's simpler and works great!

**For distribution**: Create the `.exe` if you want a single file to share.

---

## Files Created

- `auto_start.bat` - Enhanced batch file (recommended)
- `auto_start_wrapper.py` - Python wrapper for .exe creation
- `create_exe.py` - Helper script to build .exe
- `dist/TelegramOTPBot.exe` - The final executable (after building)

