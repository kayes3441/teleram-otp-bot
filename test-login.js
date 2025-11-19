const puppeteer = require('puppeteer');

async function testLogin() {
  console.log('🔍 Testing Login Functionality...\n');
  
  const USE_EXTERNAL_CHROME = process.env.USE_EXTERNAL_CHROME === "true";
  const SMS_USERNAME = process.env.SMS_USERNAME || "mhmehedi007";
  const SMS_PASSWORD = process.env.SMS_PASSWORD || "##2023@@$$";
  
  console.log(`Mode: ${USE_EXTERNAL_CHROME ? 'External Chrome (VPS Mode)' : 'Puppeteer Chromium (Auto-login Mode)'}`);
  console.log(`Username: ${SMS_USERNAME}`);
  console.log(`Password: ${SMS_PASSWORD ? '***' + SMS_PASSWORD.slice(-3) : 'NOT SET'}\n`);
  
  let browser;
  
  try {
    if (USE_EXTERNAL_CHROME) {
      // Test with external Chrome
      console.log('📡 Connecting to Chrome at http://localhost:9222...');
      
      try {
        const http = require('http');
        await new Promise((resolve, reject) => {
          const req = http.get('http://localhost:9222/json/version', (res) => {
            if (res.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          });
          req.on('error', reject);
          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Connection timeout'));
          });
        });
        console.log('✅ Chrome debugging is accessible\n');
      } catch (checkError) {
        console.error('❌ Chrome debugging not available!');
        console.log('\n💡 Start Chrome with remote debugging:');
        console.log('\n   Mac (Recommended):');
        console.log('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"');
        console.log('\n   Windows:');
        console.log('   & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\\chrome-debug-profile"');
        console.log('\n   Linux:');
        console.log('   google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"');
        console.log('\n   Make sure to close all Chrome windows first!');
        return;
      }
      
      browser = await puppeteer.connect({
        browserURL: "http://localhost:9222",
        defaultViewport: null,
      });
      
      console.log('✅ Connected to Chrome\n');
      
      // Check existing pages
      const pages = await browser.pages();
      console.log(`📄 Found ${pages.length} open tab(s)`);
      
      // Check if already logged in
      for (const page of pages) {
        const url = page.url();
        console.log(`   - Tab: ${url}`);
        if (url.includes('SMSCDRStats') && !url.includes('login')) {
          console.log('\n✅ Already logged in! Found SMS stats page.');
          return;
        }
      }
      
    } else {
      // Test with Puppeteer Chromium
      console.log('🚀 Launching Puppeteer Chromium...');
      
      browser = await puppeteer.launch({
        headless: false, // Show browser for testing
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
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
      
      console.log('✅ Chromium launched\n');
    }
    
    // Get or create page
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    
    // IMPORTANT: Set up request interception BEFORE any navigation
    // This prevents ERR_BLOCKED_BY_CLIENT errors
    await page.setRequestInterception(true);
    
    // Allow ALL requests - don't block anything
    page.on('request', (request) => {
      const headers = {
        ...request.headers(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      // Continue with ALL requests - never block
      request.continue({ headers });
    });
    
    // Handle request failures
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      console.log(`   ⚠️ Request failed: ${request.url()}`);
      if (failure) {
        console.log(`      Error: ${failure.errorText}`);
      }
    });
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    
    // Bypass CSP
    await page.setBypassCSP(true);
    
    // Test 1: Navigate to login page
    console.log('📝 Test 1: Navigating to login page...');
    const loginUrl = "http://185.2.83.39/ints/login";
    
    console.log('   Request interception is enabled - all requests will be allowed\n');
    
    try {
      // Try with domcontentloaded first
      await page.goto(loginUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      
      // Wait a bit for page to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentUrl = page.url();
      console.log('✅ Successfully navigated to login page');
      console.log(`   URL: ${currentUrl}\n`);
      
      // Check if we actually got to the page
      if (currentUrl.includes('185.2.83.39')) {
        console.log('   ✅ Successfully reached the server\n');
      } else {
        console.log('   ⚠️ URL changed - might have been redirected\n');
      }
      
    } catch (navError) {
      console.error('❌ Failed to navigate to login page');
      console.error(`   Error: ${navError.message}\n`);
      
      // Check current URL - might have loaded despite error
      try {
        const currentUrl = page.url();
        if (currentUrl.includes('185.2.83.39')) {
          console.log('   ⚠️ Navigation reported error but we reached the server');
          console.log(`   Current URL: ${currentUrl}\n`);
          console.log('   ✅ Continuing with test...\n');
        } else {
          console.log('💡 Trying alternative navigation method...\n');
          
          // Try alternative method
          try {
            await page.goto(loginUrl, {
              waitUntil: "load",
              timeout: 30000,
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            const currentUrl = page.url();
            console.log('✅ Successfully navigated (alternative method)');
            console.log(`   URL: ${currentUrl}\n`);
          } catch (navError2) {
            console.error('❌ Alternative method also failed');
            console.error(`   Error: ${navError2.message}\n`);
            
            // Check URL one more time
            const finalUrl = page.url();
            if (finalUrl.includes('185.2.83.39')) {
              console.log('   ⚠️ But we did reach the server!');
              console.log(`   Current URL: ${finalUrl}\n`);
              console.log('   ✅ Continuing with test...\n');
            } else {
              console.log('💡 The site might be blocking automated browsers.');
              console.log('   Try using Method 2 (External Chrome) instead.\n');
              console.log('💡 Browser window is open. You can check what happened.');
              console.log('   Browser will stay open for 30 seconds for inspection...\n');
              
              // Keep browser open for 30 seconds so user can see what happened
              await new Promise(resolve => setTimeout(resolve, 30000));
              await browser.close();
              return;
            }
          }
        }
      } catch (urlError) {
        console.error('   Could not check URL:', urlError.message);
        console.log('💡 Browser window is open. Check it manually.\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
        await browser.close();
        return;
      }
    }
    
    // Test 2: Check page content and load main.js if needed
    console.log('📝 Test 2: Checking page content...');
    
    // Wait for main.js to load if it exists
    try {
      await page.waitForFunction(() => {
        return document.readyState === 'complete';
      }, { timeout: 5000 });
      console.log('   ✅ Page fully loaded');
    } catch (e) {
      console.log('   ⚠️ Page load timeout (continuing anyway)');
    }
    
    // Check if main.js is loaded
    const jsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const mainJs = scripts.find(s => s.src.includes('main.js'));
      return {
        hasMainJs: !!mainJs,
        mainJsUrl: mainJs ? mainJs.src : null,
        allScripts: scripts.map(s => s.src).filter(s => s.includes('185.2.83.39'))
      };
    });
    
    if (jsLoaded.hasMainJs) {
      console.log(`   ✅ Found main.js: ${jsLoaded.mainJsUrl}`);
      console.log(`   ✅ All scripts loaded: ${jsLoaded.allScripts.length} script(s)`);
    } else {
      console.log('   ⚠️ main.js not found in page scripts');
    }
    console.log();
    
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasUsernameField: !!document.querySelector('input[name="username"]'),
        hasPasswordField: !!document.querySelector('input[name="password"]'),
        hasCaptField: !!document.querySelector('input[name="capt"]'),
        hasLoginButton: !!document.querySelector('.login100-form-btn') || !!document.querySelector('button[type="submit"]'),
        bodyText: document.body.innerText.substring(0, 200),
      };
    });
    
    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   Username field: ${pageInfo.hasUsernameField ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Password field: ${pageInfo.hasPasswordField ? '✅ Found' : '❌ Not found'}`);
    console.log(`   CAPTCHA field: ${pageInfo.hasCaptField ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Login button: ${pageInfo.hasLoginButton ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Page preview: ${pageInfo.bodyText.substring(0, 100)}...\n`);
    
    if (!pageInfo.hasUsernameField || !pageInfo.hasPasswordField) {
      console.error('❌ Login form fields not found!');
      console.log('   The page structure might have changed.\n');
      if (!USE_EXTERNAL_CHROME) {
        console.log('💡 Browser window is open. Check it manually.');
        console.log('   Browser will stay open for 60 seconds for inspection...');
        console.log('   (Or press Ctrl+C to close immediately)\n');
        
        // Keep browser open for 60 seconds
        await new Promise(resolve => setTimeout(resolve, 60000));
        console.log('\n⏰ Timeout reached. Closing browser...');
      }
      if (!USE_EXTERNAL_CHROME) {
        await browser.close();
      }
      return;
    }
    
    // Test 3: Check for math CAPTCHA
    console.log('📝 Test 3: Checking for math CAPTCHA...');
    const mathAnswer = await page.evaluate(() => {
      const text = document.body.innerText || document.body.textContent || '';
      const mathMatch = text.match(/What is (\d+)\s*\+\s*(\d+)\s*=\s*\?/i);
      if (mathMatch) {
        const num1 = parseInt(mathMatch[1]);
        const num2 = parseInt(mathMatch[2]);
        return { found: true, num1, num2, answer: num1 + num2 };
      }
      return { found: false };
    });
    
    if (mathAnswer.found) {
      console.log(`   ✅ Math CAPTCHA found: ${mathAnswer.num1} + ${mathAnswer.num2} = ${mathAnswer.answer}`);
    } else {
      console.log('   ⚠️ No math CAPTCHA found (might not be required)');
    }
    console.log();
    
    // Test 4: Try to fill form and click login button
    if (!USE_EXTERNAL_CHROME) {
      console.log('📝 Test 4: Testing form filling and login button click...\n');
      
      try {
        // Clear any existing values first
        await page.evaluate(() => {
          const usernameInput = document.querySelector('input[name="username"]');
          const passwordInput = document.querySelector('input[name="password"]');
          const captInput = document.querySelector('input[name="capt"]');
          if (usernameInput) usernameInput.value = '';
          if (passwordInput) passwordInput.value = '';
          if (captInput) captInput.value = '';
        });
        
        // Fill CAPTCHA if present
        if (mathAnswer.found && pageInfo.hasCaptField) {
          console.log(`   Filling CAPTCHA: ${mathAnswer.answer}...`);
          await page.click('input[name="capt"]');
          await page.type('input[name="capt"]', mathAnswer.answer.toString(), { delay: 100 });
          console.log(`   ✅ CAPTCHA filled: ${mathAnswer.answer}`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Fill username
        console.log(`   Filling username: ${SMS_USERNAME}...`);
        await page.click('input[name="username"]');
        await page.type('input[name="username"]', SMS_USERNAME, { delay: 100 });
        console.log(`   ✅ Username filled: ${SMS_USERNAME}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fill password
        console.log('   Filling password...');
        await page.click('input[name="password"]');
        await page.type('input[name="password"]', SMS_PASSWORD, { delay: 100 });
        console.log('   ✅ Password filled');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if main.js is loaded and try to use it
        console.log('\n   Checking for main.js and form handlers...');
        const jsInfo = await page.evaluate(() => {
          // Check if main.js functions are available
          const form = document.querySelector('form');
          const loginBtn = document.querySelector('.login100-form-btn');
          
          return {
            hasForm: !!form,
            formAction: form ? form.action : null,
            formMethod: form ? form.method : null,
            hasLoginBtn: !!loginBtn,
            loginBtnType: loginBtn ? loginBtn.type : null,
            loginBtnOnclick: loginBtn && loginBtn.onclick ? 'has onclick' : 'no onclick',
            // Check if there are any global functions from main.js
            hasSubmitHandler: form && form.onsubmit ? 'has onsubmit' : 'no onsubmit',
            // Try to find click handlers
            loginBtnListeners: loginBtn ? (loginBtn.getAttribute('onclick') || 'no onclick attr') : null
          };
        });
        
        console.log('   JavaScript info:');
        console.log(`   - Form exists: ${jsInfo.hasForm}`);
        if (jsInfo.hasForm) {
          console.log(`   - Form action: ${jsInfo.formAction}`);
          console.log(`   - Form method: ${jsInfo.formMethod}`);
          console.log(`   - Form has onsubmit: ${jsInfo.hasSubmitHandler}`);
        }
        console.log(`   - Login button exists: ${jsInfo.hasLoginBtn}`);
        if (jsInfo.hasLoginBtn) {
          console.log(`   - Login button type: ${jsInfo.loginBtnType}`);
          console.log(`   - Login button onclick: ${jsInfo.loginBtnOnclick}`);
          console.log(`   - Login button listeners: ${jsInfo.loginBtnListeners}`);
        }
        console.log();
        
        // First, inspect what buttons are on the page
        console.log('   Inspecting page for login buttons...');
        const buttonInfo = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], .login100-form-btn, [class*="login"]'));
          return buttons.map(btn => ({
            tag: btn.tagName,
            type: btn.type || 'N/A',
            class: btn.className || 'N/A',
            id: btn.id || 'N/A',
            text: (btn.textContent || btn.value || '').trim().substring(0, 50),
            visible: btn.offsetParent !== null,
            disabled: btn.disabled,
            onclick: btn.onclick ? 'has onclick' : (btn.getAttribute('onclick') || 'no onclick'),
            selector: btn.className ? `.${btn.className.split(' ')[0]}` : btn.tagName.toLowerCase()
          }));
        });
        
        console.log(`   Found ${buttonInfo.length} button(s) on page:`);
        buttonInfo.forEach((btn, i) => {
          console.log(`   ${i + 1}. ${btn.tag} - Class: "${btn.class}" - Text: "${btn.text}" - Visible: ${btn.visible} - Disabled: ${btn.disabled} - ${btn.onclick}`);
        });
        console.log();
        
        // Now try to click login button - using Puppeteer methods first
        console.log('   Attempting to click login button...');
        let loginClicked = { success: false, method: 'none' };
        
        // Method 1: Try clicking with Puppeteer (more reliable) - try .login100-form-btn first
        try {
          const loginButton = await page.$('.login100-form-btn');
          if (loginButton) {
            console.log('   ✅ Found button with .login100-form-btn class');
            // Scroll into view first
            await loginButton.evaluate(btn => btn.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await new Promise(resolve => setTimeout(resolve, 500));
            // Try clicking
            await loginButton.click({ delay: 100 });
            loginClicked = { success: true, method: '.login100-form-btn (Puppeteer click)' };
            console.log('   ✅ Clicked using Puppeteer');
          }
        } catch (e) {
          console.log(`   ⚠️ Puppeteer click failed: ${e.message}`);
        }
        
        // Method 2: Try other selectors with Puppeteer
        if (!loginClicked.success) {
          const selectors = [
            'button.login100-form-btn',
            'input.login100-form-btn',
            'button[type="submit"]',
            'input[type="submit"]',
            'button.btn-primary',
            'button.btn',
            'input.btn',
          ];
          
          for (const sel of selectors) {
            try {
              const btn = await page.$(sel);
              if (btn) {
                const isVisible = await btn.evaluate(el => el.offsetParent !== null);
                const isDisabled = await btn.evaluate(el => el.disabled);
                if (isVisible && !isDisabled) {
                  console.log(`   ✅ Found button with selector: ${sel}`);
                  await btn.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                  await new Promise(resolve => setTimeout(resolve, 500));
                  await btn.click({ delay: 100 });
                  loginClicked = { success: true, method: `${sel} (Puppeteer click)` };
                  console.log('   ✅ Clicked using Puppeteer');
                  break;
                }
              }
            } catch (e) {
              console.log(`   ⚠️ Failed to click ${sel}: ${e.message}`);
            }
          }
        }
        
        // Method 3: Try with page.evaluate (JavaScript click)
        if (!loginClicked.success) {
          loginClicked = await page.evaluate(() => {
            // Try different button selectors
            const selectors = [
              '.login100-form-btn',
              'button.login100-form-btn',
              'input.login100-form-btn',
              'button[type="submit"]',
              'input[type="submit"]',
              'button.btn-primary',
              'button.btn',
              'input.btn',
            ];
            
            for (const sel of selectors) {
              try {
                const btn = document.querySelector(sel);
                if (btn) {
                  // Check if visible and not disabled
                  const rect = btn.getBoundingClientRect();
                  const isVisible = rect.width > 0 && rect.height > 0 && btn.offsetParent !== null;
                  const isDisabled = btn.disabled;
                  
                  if (isVisible && !isDisabled) {
                    // Try multiple click methods
                    btn.focus();
                    btn.click();
                    
                    // Also try mouse events
                    const clickEvent = new MouseEvent('click', {
                      bubbles: true,
                      cancelable: true,
                      view: window
                    });
                    btn.dispatchEvent(clickEvent);
                    
                    return { success: true, method: `${sel} (JS click)` };
                  }
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            
            // Try to find button with text "Login"
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
            const loginBtn = buttons.find(btn => {
              const text = (btn.textContent || btn.value || '').toLowerCase();
              const rect = btn.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0 && btn.offsetParent !== null;
              return text.includes('login') && !btn.disabled && isVisible;
            });
            if (loginBtn) {
              loginBtn.focus();
              loginBtn.click();
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              loginBtn.dispatchEvent(clickEvent);
              return { success: true, method: 'text-match (JS click)' };
            }
            
            return { success: false, method: 'none' };
          });
        }
        
        // Method 4: Try submitting the form directly (trigger main.js handler if exists)
        if (!loginClicked.success) {
          try {
            const form = await page.$('form');
            if (form) {
              console.log('   Trying form.submit()...');
              
              // First try to trigger any submit handlers from main.js
              const submitResult = await page.evaluate(() => {
                const form = document.querySelector('form');
                if (!form) return { success: false, error: 'No form found' };
                
                // Try to trigger submit event (this will call main.js handlers if they exist)
                const submitEvent = new Event('submit', {
                  bubbles: true,
                  cancelable: true
                });
                
                // Dispatch submit event first (triggers handlers)
                const notCancelled = form.dispatchEvent(submitEvent);
                
                if (notCancelled) {
                  // If event wasn't cancelled, actually submit
                  form.submit();
                  return { success: true, method: 'form.submit() with event' };
                } else {
                  // Event was cancelled, but handlers were called
                  return { success: true, method: 'form submit event (handled by main.js)' };
                }
              });
              
              if (submitResult.success) {
                loginClicked = { success: true, method: submitResult.method };
              } else {
                // Fallback to direct submit
                await form.evaluate(form => form.submit());
                loginClicked = { success: true, method: 'form-submit (direct)' };
              }
            }
          } catch (e) {
            console.log(`   ⚠️ Form submit failed: ${e.message}`);
          }
        }
        
        // Method 5: Try calling main.js functions directly if they exist
        if (!loginClicked.success) {
          try {
            console.log('   Trying to use main.js functions...');
            const mainJsResult = await page.evaluate(() => {
              // Try to find and call login function from main.js
              // Common function names for login
              const possibleFunctions = ['login', 'submitLogin', 'doLogin', 'handleLogin', 'onLogin'];
              
              for (const funcName of possibleFunctions) {
                if (typeof window[funcName] === 'function') {
                  try {
                    window[funcName]();
                    return { success: true, method: `main.js function: ${funcName}()` };
                  } catch (e) {
                    // Continue to next function
                  }
                }
              }
              
              // Try to find button click handler
              const loginBtn = document.querySelector('.login100-form-btn');
              if (loginBtn) {
                // Try to get the actual click handler
                const clickHandler = loginBtn.onclick;
                if (clickHandler) {
                  try {
                    clickHandler();
                    return { success: true, method: 'button onclick handler' };
                  } catch (e) {
                    // Handler failed
                  }
                }
              }
              
              return { success: false };
            });
            
            if (mainJsResult.success) {
              loginClicked = { success: true, method: mainJsResult.method };
            }
          } catch (e) {
            console.log(`   ⚠️ main.js method failed: ${e.message}`);
          }
        }
        
        if (loginClicked.success) {
          console.log(`\n   ✅ Login button clicked using method: ${loginClicked.method}`);
          console.log('   Waiting for page navigation...\n');
          
          // Wait for navigation
          try {
            await Promise.race([
              page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]);
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit more
            
            const newUrl = page.url();
            console.log(`   Current URL: ${newUrl}`);
            
            if (newUrl.includes('/login') || newUrl.includes('/ints/login')) {
              console.log('   ⚠️ Still on login page - login may have failed');
              console.log('   💡 Check browser window - there might be an error message');
            } else {
              console.log('   ✅ Successfully navigated away from login page!');
              console.log('   ✅ Login appears to be successful!');
            }
          } catch (navError) {
            console.log('   ⚠️ Navigation timeout - checking current URL...');
            const currentUrl = page.url();
            console.log(`   Current URL: ${currentUrl}`);
            if (!currentUrl.includes('/login')) {
              console.log('   ✅ Not on login page - login might have worked!');
            }
          }
        } else {
          console.log('\n   ⚠️ Could not find or click login button with any method');
          console.log('   💡 Trying Enter key as fallback...');
          try {
            await page.focus('input[name="password"]');
            await new Promise(resolve => setTimeout(resolve, 500));
            await page.keyboard.press('Enter');
            console.log('   ✅ Pressed Enter key');
            
            // Wait for navigation
            await Promise.race([
              page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newUrl = page.url();
            console.log(`   Current URL after Enter: ${newUrl}`);
            
            if (!newUrl.includes('/login')) {
              console.log('   ✅ Enter key worked! Login successful!');
            } else {
              console.log('   ⚠️ Still on login page');
            }
          } catch (enterError) {
            console.log(`   ⚠️ Enter key also failed: ${enterError.message}`);
            console.log('   💡 You may need to click the button manually in the browser window');
          }
        }
        
        console.log('\n✅ Form filling and login attempt completed!');
        console.log('\n💡 Browser window is open. You can check the result manually.');
        console.log('   Browser will stay open for 60 seconds...');
        console.log('   (Or press Ctrl+C to close immediately)\n');
        
        // Keep browser open for 60 seconds
        await new Promise(resolve => setTimeout(resolve, 60000));
        console.log('\n⏰ Timeout reached. Closing browser...');
        
      } catch (fillError) {
        console.error('❌ Form filling or login failed');
        console.error(`   Error: ${fillError.message}\n`);
        console.log('💡 Browser window is open. You can check what happened.');
        console.log('   Browser will stay open for 60 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      
      await browser.close();
      
    } else {
      console.log('📝 Test 4: Manual login mode');
      console.log('   ✅ Login page is accessible');
      console.log('   ✅ Form fields are present');
      console.log('   💡 Login manually in the Chrome window that\'s already open.\n');
      console.log('   (Chrome will stay open - you can close it manually when done)\n');
    }
    
    // Summary
    console.log('📊 Test Summary:');
    console.log('   ✅ Login page accessible');
    console.log('   ✅ Form fields found');
    if (mathAnswer.found) {
      console.log('   ✅ Math CAPTCHA detected');
    }
    console.log('   ✅ Ready for login\n');
    
    if (USE_EXTERNAL_CHROME) {
      console.log('💡 Next steps:');
      console.log('   1. Login manually in Chrome');
      console.log('   2. Navigate to: http://185.2.83.39/ints/agent/SMSCDRStats');
      console.log('   3. Keep Chrome open');
      console.log('   4. Run: node telegramNumberBot.js\n');
      console.log('   (Chrome will stay open - you can close it manually when done)\n');
    } else {
      console.log('💡 Browser window is open. You can:');
      console.log('   - Check the login page');
      console.log('   - Test login manually');
      console.log('   - Inspect the page');
      console.log('\n   Browser will stay open for 60 seconds...');
      console.log('   (Or press Ctrl+C to close immediately)\n');
      
      // Keep browser open for 60 seconds
      await new Promise(resolve => setTimeout(resolve, 60000));
      console.log('\n⏰ Timeout reached. Closing browser...');
      await browser.close();
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    
    if (browser && !USE_EXTERNAL_CHROME) {
      await browser.close();
    }
  }
}

// Run the test
testLogin().catch(console.error);

