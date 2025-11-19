#!/usr/bin/env node

// Quick diagnostic script to check bot status

const https = require('https');

const BOT_TOKEN = "8599330024:AAG9Bo9L2cQW-tDO2a8T78X359S027Ufa9M";

console.log("🔍 Checking bot status...\n");

// Check 1: Bot info
function checkBotInfo() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log("✅ Bot Token: Valid");
            console.log(`   Bot Name: ${result.result.first_name}`);
            console.log(`   Username: @${result.result.username}`);
            resolve(true);
          } else {
            console.log("❌ Bot Token: Invalid");
            console.log(`   Error: ${result.description}`);
            resolve(false);
          }
        } catch (e) {
          console.log("❌ Error parsing response:", e.message);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log("❌ Network error:", e.message);
      resolve(false);
    });
  });
}

// Check 2: Webhook status
function checkWebhook() {
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            const webhook = result.result;
            console.log("\n📡 Webhook Status:");
            if (webhook.url) {
              console.log(`   URL: ${webhook.url}`);
              console.log(`   Pending updates: ${webhook.pending_update_count}`);
              if (webhook.last_error_date) {
                console.log(`   ⚠️ Last error: ${webhook.last_error_message}`);
              } else {
                console.log("   ✅ No errors");
              }
            } else {
              console.log("   📡 Using polling (no webhook set)");
            }
            resolve(true);
          } else {
            console.log("❌ Could not check webhook");
            resolve(false);
          }
        } catch (e) {
          console.log("❌ Error checking webhook:", e.message);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log("❌ Network error:", e.message);
      resolve(false);
    });
  });
}

// Check 3: Port status
function checkPort() {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec('lsof -i :8810', (error, stdout) => {
      console.log("\n🔌 Port 8810 Status:");
      if (stdout) {
        console.log("   ✅ Port 8810 is in use (bot is running)");
        const lines = stdout.split('\n').filter(l => l.includes('node'));
        if (lines.length > 0) {
          console.log(`   Process: ${lines[0].split(/\s+/)[0]}`);
        }
      } else {
        console.log("   ⚠️ Port 8810 is free (bot may not be running)");
      }
      resolve(true);
    });
  });
}

// Run all checks
async function runChecks() {
  await checkBotInfo();
  await checkWebhook();
  await checkPort();
  
  console.log("\n💡 Recommendations:");
  console.log("1. If bot token is invalid, check telegramNumberBot.js line 18");
  console.log("2. If webhook has errors, use polling: USE_WEBHOOK=false npm start");
  console.log("3. If port is free, start bot: npm start");
  console.log("4. Test bot by sending /start on Telegram");
}

runChecks().catch(console.error);

