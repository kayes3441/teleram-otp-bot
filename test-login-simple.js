const puppeteer = require('puppeteer');

async function testLoginSimple() {
  console.log('🔍 Simple Login Test - Using External Chrome Only\n');
  console.log('This test requires Chrome to be running with remote debugging.\n');
  
  // Check if Chrome debugging is available
  console.log('📡 Checking Chrome debugging connection...');
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
    console.error('❌ Chrome debugging not available!\n');
    console.log('💡 Please start Chrome with remote debugging first:\n');
    console.log('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"\n');
    console.log('   Then login manually to: http://185.2.83.39/ints/login\n');
    return;
  }
  
  // Connect to Chrome
  console.log('🔗 Connecting to Chrome...');
  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: "http://localhost:9222",
      defaultViewport: null,
    });
    console.log('✅ Connected to Chrome\n');
  } catch (error) {
    console.error('❌ Failed to connect to Chrome:', error.message);
    return;
  }
  
  // Check existing pages
  const pages = await browser.pages();
  console.log(`📄 Found ${pages.length} open tab(s)\n`);
  
  // Check if already logged in
  console.log('🔍 Checking if already logged in...');
  for (const page of pages) {
    const url = page.url();
    console.log(`   - Tab: ${url}`);
    if (url.includes('SMSCDRStats') && !url.includes('login')) {
      console.log('\n✅ Already logged in! Found SMS stats page.');
      console.log('✅ Login test passed!\n');
      return;
    }
  }
  
  // Check if on login page
  console.log('\n🔍 Checking current pages...');
  let loginPage = null;
  for (const page of pages) {
    const url = page.url();
    if (url.includes('/login') || url.includes('/ints/login')) {
      loginPage = page;
      console.log(`   ✅ Found login page: ${url}`);
      break;
    }
  }
  
  if (!loginPage) {
    console.log('   ⚠️ No login page found in open tabs');
    console.log('\n💡 Please:');
    console.log('   1. Open Chrome');
    console.log('   2. Navigate to: http://185.2.83.39/ints/login');
    console.log('   3. Login manually');
    console.log('   4. Navigate to: http://185.2.83.39/ints/agent/SMSCDRStats');
    console.log('   5. Keep Chrome open');
    console.log('   6. Run this test again\n');
    return;
  }
  
  // Test form fields
  console.log('\n📝 Testing login form...');
  const formInfo = await loginPage.evaluate(() => {
    return {
      hasUsername: !!document.querySelector('input[name="username"]'),
      hasPassword: !!document.querySelector('input[name="password"]'),
      hasCapt: !!document.querySelector('input[name="capt"]'),
      hasLoginBtn: !!document.querySelector('.login100-form-btn'),
      url: window.location.href,
      title: document.title
    };
  });
  
  console.log(`   URL: ${formInfo.url}`);
  console.log(`   Title: ${formInfo.title}`);
  console.log(`   Username field: ${formInfo.hasUsername ? '✅' : '❌'}`);
  console.log(`   Password field: ${formInfo.hasPassword ? '✅' : '❌'}`);
  console.log(`   CAPTCHA field: ${formInfo.hasCapt ? '✅' : '❌'}`);
  console.log(`   Login button: ${formInfo.hasLoginBtn ? '✅' : '❌'}`);
  
  if (formInfo.hasUsername && formInfo.hasPassword && formInfo.hasLoginBtn) {
    console.log('\n✅ Login form is accessible and complete!');
    console.log('✅ All form fields found!');
    console.log('\n💡 Since you\'re using External Chrome:');
    console.log('   - You can login manually in Chrome');
    console.log('   - The bot will use your existing session');
    console.log('   - No need for automated login\n');
  } else {
    console.log('\n⚠️ Some form fields are missing');
    console.log('   Check the page manually in Chrome\n');
  }
  
  console.log('✅ Test complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Login manually in Chrome if not already logged in');
  console.log('   2. Navigate to: http://185.2.83.39/ints/agent/SMSCDRStats');
  console.log('   3. Keep Chrome open');
  console.log('   4. Run your bot: node telegramNumberBot.js\n');
}

// Run the test
testLoginSimple().catch(console.error);

