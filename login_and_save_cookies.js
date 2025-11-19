#!/usr/bin/env node
/**
 * Login Script for Railway/Cloud Deployment
 * Logs into SMS portal and saves cookies for session persistence
 * 
 * Usage:
 *   node login_and_save_cookies.js
 * 
 * Then run: npm start
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const COOKIES_FILE = path.join(__dirname, 'cookies.json');
const URL = "http://185.2.83.39/ints/login";
const USERNAME = process.env.SMS_USERNAME || "mhmehedi007";
const PASSWORD = process.env.SMS_PASSWORD || "##2023@@$$";

async function loginAndSaveCookies() {
  let browser;
  
  try {
    console.log("🚀 Starting login script...");
    console.log(`📋 Username: ${USERNAME}`);
    console.log(`📋 Password: ${'*'.repeat(PASSWORD.length)}\n`);
    
    // Launch browser
    console.log("📱 Launching Puppeteer Chromium...");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-infobars',
        '--disable-notifications',
        '--disable-popup-blocking',
        '--disable-default-apps',
        '--no-first-run',
        '--no-default-browser-check',
      ],
      defaultViewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });
    
    console.log("✅ Browser launched\n");
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    // Enable request interception
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const headers = {
        ...request.headers(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };
      request.continue({ headers });
    });
    
    // Navigate to login page
    console.log(`🌐 Navigating to: ${URL}`);
    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`✅ Page loaded: ${page.url()}\n`);
    
    // Solve math CAPTCHA
    console.log("🔢 Solving math CAPTCHA...");
    const mathAnswer = await page.evaluate(() => {
      // Method 1: Find in wrap-input100 div
      const wrapDivs = Array.from(document.querySelectorAll('.wrap-input100'));
      for (const div of wrapDivs) {
        const text = div.textContent || div.innerText || '';
        const mathMatch = text.match(/What is (\d+)\s*([+\-*])\s*(\d+)\s*=\s*\?/i);
        if (mathMatch) {
          const num1 = parseInt(mathMatch[1]);
          const num2 = parseInt(mathMatch[3]);
          const operator = mathMatch[2];
          let answer;
          if (operator === '+') answer = num1 + num2;
          else if (operator === '-') answer = num1 - num2;
          else if (operator === '*') answer = num1 * num2;
          else answer = num1 + num2;
          return { found: true, num1, num2, operator, answer };
        }
      }
      
      // Method 2: Search in body text
      const text = document.body.innerText || document.body.textContent || '';
      const mathMatch = text.match(/What is (\d+)\s*([+\-*])\s*(\d+)\s*=\s*\?/i);
      if (mathMatch) {
        const num1 = parseInt(mathMatch[1]);
        const num2 = parseInt(mathMatch[3]);
        const operator = mathMatch[2];
        let answer;
        if (operator === '+') answer = num1 + num2;
        else if (operator === '-') answer = num1 - num2;
        else if (operator === '*') answer = num1 * num2;
        else answer = num1 + num2;
        return { found: true, num1, num2, operator, answer };
      }
      
      return { found: false };
    });
    
    if (mathAnswer && mathAnswer.found) {
      console.log(`   Found CAPTCHA: ${mathAnswer.num1} ${mathAnswer.operator} ${mathAnswer.num2} = ${mathAnswer.answer}`);
      
      // Fill CAPTCHA
      try {
        const captInput = await page.$('input[name="capt"]');
        if (captInput) {
          await captInput.click();
          await page.keyboard.down('Control');
          await page.keyboard.press('KeyA');
          await page.keyboard.up('Control');
          await captInput.type(mathAnswer.answer.toString(), { delay: 100 });
          console.log(`✅ CAPTCHA answer filled: ${mathAnswer.answer}\n`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (captError) {
        console.log(`⚠️ Error filling CAPTCHA: ${captError.message}`);
      }
    } else {
      console.log("⚠️ No CAPTCHA found (might not be required)\n");
    }
    
    // Fill username
    console.log("📝 Filling username...");
    try {
      await page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await page.click('input[name="username"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[name="username"]', USERNAME, { delay: 100 });
      console.log(`✅ Username filled: ${USERNAME}\n`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (userError) {
      console.log(`⚠️ Error filling username: ${userError.message}`);
      // Try alternative method
      await page.evaluate((username) => {
        const input = document.querySelector('input[name="username"]');
        if (input) {
          input.value = username;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, USERNAME);
      console.log(`✅ Username filled (alternative method): ${USERNAME}\n`);
    }
    
    // Fill password
    console.log("📝 Filling password...");
    try {
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.click('input[name="password"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[name="password"]', PASSWORD, { delay: 100 });
      console.log("✅ Password filled\n");
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (passError) {
      console.log(`⚠️ Error filling password: ${passError.message}`);
      // Try alternative method
      await page.evaluate((password) => {
        const input = document.querySelector('input[name="password"]');
        if (input) {
          input.value = password;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, PASSWORD);
      console.log("✅ Password filled (alternative method)\n");
    }
    
    // Click login button
    console.log("🔘 Clicking login button...");
    const loginClicked = await page.evaluate(() => {
      const btn = document.querySelector('.login100-form-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && btn.offsetParent !== null;
        const isEnabled = !btn.disabled;
        
        if (isVisible && isEnabled) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          btn.click();
          return { success: true, method: 'JavaScript click' };
        }
      }
      return { success: false };
    });
    
    if (loginClicked.success) {
      console.log(`✅ Login button clicked\n`);
    } else {
      console.log("⚠️ Could not click login button, trying Enter key...");
      await page.focus('input[name="password"]');
      await page.keyboard.press('Enter');
      console.log("✅ Pressed Enter key\n");
    }
    
    // Wait for navigation
    console.log("⏳ Waiting for login response...");
    await Promise.race([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}\n`);
    
    if (!currentUrl.includes("/login") && !currentUrl.includes("/ints/login")) {
      console.log("✅ Login successful! Not on login page anymore.");
      console.log(`✅ Redirected to: ${currentUrl}\n`);
      
      // Save cookies
      console.log("🍪 Saving cookies for session persistence...");
      try {
        const cookies = await page.cookies();
        fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
        console.log(`✅ Saved ${cookies.length} cookie(s) to cookies.json`);
        console.log("💡 The bot can now use these cookies to stay logged in!\n");
      } catch (cookieError) {
        console.log(`⚠️ Could not save cookies: ${cookieError.message}\n`);
      }
    } else {
      console.log("⚠️ Still on login page - login may have failed");
      console.log("   Check the page for error messages\n");
      process.exit(1);
    }
    
    console.log("✅ Login script completed successfully!");
    console.log("💡 Now you can run: npm start\n");
    
  } catch (error) {
    console.error("\n❌ Error occurred:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔚 Browser closed");
    }
  }
}

// Run the script
loginAndSaveCookies().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

