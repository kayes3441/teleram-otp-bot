const express = require("express");
const { Telegraf, session } = require("telegraf");
const fs = require("fs-extra");
const path = require("path");
const puppeteer = require("puppeteer");
const { Markup } = require("telegraf");

// ============================================
// CONFIGURATION VARIABLES
// ============================================

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8349339737:AAEORrw1g-AZ1PDuQn_w90cdxdrD8C-8ebE";
const CHANNEL_ID = "-1003315993993"; // OTP Hunter FC group chat ID (numeric format is more reliable)
const CHANNEL_USERNAME = "@otp_hunter_fc"; // Channel username for display/links
const ADMIN_TELEGRAM_USER = "aamamun_ce"; // Admin Telegram username (without @)
const BOT_NAME = "OTP Hunter FC"; // Bot display name

// Admin Configuration
const ADMIN_PASSWORD = "Asdf@qwer!";

// File Paths
const NUMBERS_FILE = path.join(__dirname, "numbers.txt");
const COUNTRIES_FILE = path.join(__dirname, "countries.json");
const USERS_FILE = path.join(__dirname, "users.json");
const OUTPUT_FILE = path.join(__dirname, "sms_cdr_stats.txt");

// Server Configuration
const PORT = process.env.PORT || 8810;

// ============================================
// INITIALIZE BOT AND SERVER
// ============================================

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Keep-alive route
app.get("/", (req, res) => {
  res.send("Server is alive!");
});

// Webhook endpoint for Telegram (must be after bot is defined)
app.use(bot.webhookCallback("/webhook"));

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// Define the custom command menu with a "Start" button`
bot.telegram.setMyCommands([
  { command: "start", description: "Start the bot" },
]);

// Example main menu
const mainMenu = Markup.keyboard([
  ["📞 Get Number", "HELP ?"],
  ["🏠 Start Menu", "🔗 Join Channel"],
]).resize();

bot.use(session());

// Ensure session is always initialized with better error handling
bot.use(async (ctx, next) => {
  try {
    ctx.session = ctx.session || {};
    ctx.session.isVerified = ctx.session.isVerified || false;
    ctx.session.currentNumber = ctx.session.currentNumber || null;
    ctx.session.lastOtpMessageId = ctx.session.lastOtpMessageId || null;
    ctx.session.otpPollingInterval = ctx.session.otpPollingInterval || null;
    ctx.session.isAdmin = ctx.session.isAdmin || false;
    ctx.session.waitingForForceUpload =
      ctx.session.waitingForForceUpload || false;
    ctx.session.processedOtps = ctx.session.processedOtps || {};
    ctx.session.otpTimeoutReached = ctx.session.otpTimeoutReached || false;
    ctx.session.otpMessageIds = ctx.session.otpMessageIds || [];

    // Clean up any orphaned polling intervals
    if (
      ctx.session.otpPollingInterval &&
      typeof ctx.session.otpPollingInterval === "number"
    ) {
      try {
        clearInterval(ctx.session.otpPollingInterval);
      } catch (error) {
        console.error("Error clearing interval:", error);
      }
      ctx.session.otpPollingInterval = null;
    }

    return next();
  } catch (error) {
    console.error("Error in session middleware:", error);
    return next();
  }
});

// Load countries ONLY from countries.json (no hardcoded defaults)
let countries = {};
if (fs.pathExistsSync(COUNTRIES_FILE)) {
  try {
    const fileContent = fs.readFileSync(COUNTRIES_FILE, "utf8").trim();
    if (fileContent) {
      countries = JSON.parse(fileContent);
      const countryCount = Object.keys(countries).length;
      console.log(`✅ Loaded ${countryCount} countries from countries.json`);
    } else {
      console.log("⚠️ countries.json is empty - no countries available");
      countries = {};
    }
  } catch (error) {
    console.error("❌ Error loading countries.json:", error);
    console.log("⚠️ Starting with empty countries list");
    countries = {};
  }
} else {
  // Create empty countries.json if it doesn't exist
  fs.writeFileSync(COUNTRIES_FILE, JSON.stringify({}, null, 2));
  console.log("📝 Created empty countries.json - add countries using /addcountry");
  countries = {};
}

function saveCountries() {
  try {
    fs.writeFileSync(COUNTRIES_FILE, JSON.stringify(countries, null, 2));
    console.log(`Saved ${Object.keys(countries).length} countries to countries.json`);
  } catch (error) {
    console.error("Error saving countries.json:", error);
  }
}

// Helper function to extract country code from phone number
function getCountryCode(number) {
  // Try 3 digits first, then 2 digits
  const threeDigit = number.slice(0, 3);
  if (countries[threeDigit]) {
    console.log(`Matched country code ${threeDigit} for number ${number}`);
    return threeDigit;
  }

  const twoDigit = number.slice(0, 2);
  if (countries[twoDigit]) {
    console.log(`Matched country code ${twoDigit} for number ${number}`);
    return twoDigit;
  }

  console.log(`No country code matched for number ${number}`);
  return null;
}

let numbersByCountry = {};
if (fs.pathExistsSync(NUMBERS_FILE)) {
  try {
    const rawContent = fs.readFileSync(NUMBERS_FILE, "utf8");
    console.log("Raw content of numbers.txt:", rawContent);
    const lines = rawContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");
    console.log(`Found ${lines.length} lines in numbers.txt`);

    const invalidNumbers = [];
    lines.forEach((number, index) => {
      number = number.trim();
      console.log(`Processing line ${index + 1}: ${number}`);
      if (/^\d{10,15}$/.test(number)) {
        const countryCode = getCountryCode(number);
        if (countryCode) {
          if (!numbersByCountry[countryCode]) {
            numbersByCountry[countryCode] = [];
          }
          if (!numbersByCountry[countryCode].includes(number)) {
            numbersByCountry[countryCode].push(number);
            console.log(`Added number ${number} to country ${countryCode}`);
          } else {
            console.log(
              `Skipped duplicate number ${number} for country ${countryCode}`
            );
          }
        } else {
          invalidNumbers.push(number);
          console.log(`Number ${number} skipped: no matching country code`);
        }
      } else {
        invalidNumbers.push(number);
        console.log(
          `Number ${number} skipped: invalid format (must be 10-15 digits)`
        );
      }
    });

    if (invalidNumbers.length > 0) {
      console.log(`Invalid or unmatched numbers: ${invalidNumbers.join(", ")}`);
    }
    console.log(
      "Final numbersByCountry:",
      JSON.stringify(numbersByCountry, null, 2)
    );
  } catch (error) {
    console.error("Error loading numbers.txt:", error);
  }
} else {
  console.log("No numbers.txt file found.");
}

function saveNumbers() {
  try {
    const lines = Object.values(numbersByCountry).flat();
    console.log(`Saving ${lines.length} numbers to numbers.txt`);
    fs.writeFileSync(NUMBERS_FILE, lines.join("\n"));
  } catch (error) {
    console.error("Error saving numbers.txt:", error);
  }
}

// Function to reload numbers from numbers.txt file
function reloadNumbers() {
  numbersByCountry = {};
  assignedNumbers = {};
  
  if (fs.pathExistsSync(NUMBERS_FILE)) {
    try {
      const rawContent = fs.readFileSync(NUMBERS_FILE, "utf8");
      console.log("Reloading numbers from numbers.txt...");
      const lines = rawContent
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      const invalidNumbers = [];
      lines.forEach((number, index) => {
        number = number.trim();
        if (/^\d{10,15}$/.test(number)) {
          const countryCode = getCountryCode(number);
          if (countryCode) {
            if (!numbersByCountry[countryCode]) {
              numbersByCountry[countryCode] = [];
            }
            if (!numbersByCountry[countryCode].includes(number)) {
              numbersByCountry[countryCode].push(number);
            }
          } else {
            invalidNumbers.push(number);
            console.log(`Number ${number} skipped: no matching country code`);
          }
        } else {
          invalidNumbers.push(number);
        }
      });

      if (invalidNumbers.length > 0) {
        console.log(`Invalid or unmatched numbers: ${invalidNumbers.join(", ")}`);
      }
      
      const totalNumbers = Object.values(numbersByCountry).flat().length;
      console.log(`✅ Reloaded ${totalNumbers} numbers from ${Object.keys(numbersByCountry).length} countries`);
      return { success: true, totalNumbers, countries: Object.keys(numbersByCountry).length, invalidNumbers: invalidNumbers.length };
    } catch (error) {
      console.error("Error reloading numbers.txt:", error);
      return { success: false, error: error.message };
    }
  } else {
    console.log("No numbers.txt file found.");
    return { success: false, error: "numbers.txt file not found" };
  }
}

function getNumberForCountry(countryCode) {
  if (
    !numbersByCountry[countryCode] ||
    numbersByCountry[countryCode].length === 0
  ) {
    console.log(`No numbers available for country ${countryCode}`);
    return null;
  }

  // Filter out already assigned numbers
  const availableNumbers = numbersByCountry[countryCode].filter(
    (number) => !assignedNumbers[number]
  );

  if (availableNumbers.length === 0) {
    console.log(`No unassigned numbers available for country ${countryCode}`);
    return null;
  }

  const index = Math.floor(Math.random() * availableNumbers.length);
  console.log(
    `Selected number ${availableNumbers[index]} for country ${countryCode}`
  );
  return availableNumbers[index];
}

function removeNumberFromCountry(countryCode, number) {
  if (numbersByCountry[countryCode]) {
    const index = numbersByCountry[countryCode].indexOf(number);
    if (index !== -1) {
      numbersByCountry[countryCode].splice(index, 1);
      console.log(`Removed number ${number} from country ${countryCode}`);
    }
    if (numbersByCountry[countryCode].length === 0) {
      delete numbersByCountry[countryCode];
      console.log(`Removed empty country ${countryCode} from numbersByCountry`);
    }
  }
}

// Load or initialize users
let users = {};
let assignedNumbers = {}; // Track which numbers are currently assigned to which users
if (fs.pathExistsSync(USERS_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    console.log("Loaded users:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error loading users.json:", error);
  }
} else {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  console.log("Created users.json");
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    console.log("Saved users to users.json");
  } catch (error) {
    console.error("Error saving users.json:", error);
  }
}

function addUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = { joined: new Date().toISOString() };
    saveUsers();
  }
}

// Track assigned numbers to prevent conflicts
function assignNumberToUser(chatId, number) {
  // For number, remove any existing assignments for this user
  for (const [existingNumber, existingChatId] of Object.entries(
    assignedNumbers
  )) {
    if (existingChatId === chatId) {
      delete assignedNumbers[existingNumber];
      console.log(
        `Released existing number ${existingNumber} from user ${chatId}`
      );
    }
  }
  // Assign new number
  assignedNumbers[number] = chatId;
  console.log(`Assigned number ${number} to user ${chatId}`);
}

function releaseNumberFromUser(chatId, number) {
  if (assignedNumbers[number] === chatId) {
    delete assignedNumbers[number];
    console.log(`Released number ${number} from user ${chatId}`);
  }
}

function getAssignedNumberForUser(chatId) {
  for (const [number, assignedChatId] of Object.entries(assignedNumbers)) {
    if (assignedChatId === chatId) {
      return number;
    }
  }
  return null;
}

// Helper function to check and send OTP for a given number
async function checkForOtp(ctx, number, silent = false) {
  try {
    let existingData;
    try {
      existingData = await fs.readFile(OUTPUT_FILE, "utf8");
    } catch (error) {
      if (!silent) {
        console.log(`⚠️ File ${OUTPUT_FILE} not found. Scraper may not be running.`);
        console.log(`   Make sure Chrome is running with: ./start_chrome_debug.sh`);
        console.log(`   And you're logged into: http://185.2.83.39/ints/agent/SMSCDRStats`);
      }
      return false;
    }
    
    if (!existingData || existingData.trim().length === 0) {
      if (!silent) {
        console.log(`⚠️ File ${OUTPUT_FILE} is empty. Scraper may not be running or no OTPs scraped yet.`);
        console.log(`   Check if scraper is running and Chrome is logged into the SMS portal.`);
      }
      return false;
    }
    
    const lines = existingData.split("\n").filter((line) => line.trim() !== "");

    // Find all lines where the Number field matches the user's selected number
    // Normalize both numbers for comparison (remove spaces, special chars)
    const normalizedUserNumber = number.replace(/\D/g, '');
    const matchingMessages = lines.filter((line) => {
      if (line.startsWith("OTP Code:")) {
        const parts = line.split(" Number: ");
        if (parts.length < 2) return false;
        const numberPart = parts[1].split(" Country: ")[0].trim();
        const normalizedFileNumber = numberPart.replace(/\D/g, '');
        // Match exact or if one contains the other (for partial matches)
        return normalizedFileNumber === normalizedUserNumber || 
               normalizedFileNumber.includes(normalizedUserNumber) ||
               normalizedUserNumber.includes(normalizedFileNumber);
      }
      return false;
    });

    if (matchingMessages.length > 0) {
      console.log(
        `Found ${matchingMessages.length} matching messages for number ${number}`
      );

      const processedOtps = ctx.session.processedOtps || {};

      let newOtpsFound = false;

      // ✅ Updated regex — Unicode-safe and spacing-tolerant
      const regex =
        /^OTP Code:\s*(\S+)\s+Number:\s*(\S+)\s+Country:\s*([\p{L}\p{M}\p{N}\p{Emoji_Presentation}\s]+?)\s+Service:\s*(\S+)\s+Message:\s*([\s\S]+?)\s+Date:\s*(.+)$/u;

      // Process all matching messages to find new OTPs
      for (const messageLine of matchingMessages) {
        const cleanLine = messageLine.trim().replace(/\s+/g, " "); // Normalize extra spaces
        const match = cleanLine.match(regex);

        if (!match) {
          console.log(`Invalid line format: ${messageLine}`);
          continue;
        }

        let [, otp, phoneNumber, country, service, message] = match;
        
        // Trim all values to remove any whitespace
        otp = otp.trim();
        phoneNumber = phoneNumber.trim();
        country = country.trim();
        service = service.trim();
        message = message.trim();

        // Create a unique key for this OTP (otp + number + service)
        const otpKey = `${otp}_${phoneNumber}_${service}`;

        // Skip if we've already processed this OTP
        if (processedOtps[otpKey]) continue;

        console.log(
          `Found OTP: ${otp} for number ${phoneNumber}, service: ${service}, message: ${message.substring(0, 50)}...`
        );

        // Delete previous OTP messages before sending new one
        if (ctx.session.otpMessageIds && ctx.session.otpMessageIds.length > 0) {
          for (const messageId of ctx.session.otpMessageIds) {
            try {
              await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
              console.log(`Deleted previous OTP message ID ${messageId} for chat ${ctx.chat.id}`);
            } catch (error) {
              // Message might already be deleted or not found - ignore
              console.log(`Could not delete message ${messageId}: ${error.message}`);
            }
          }
          // Clear the array after deleting
          ctx.session.otpMessageIds = [];
        }

        // Mark this OTP as processed
        processedOtps[otpKey] = true;
        ctx.session.processedOtps = processedOtps;

        // Get country info (fallback to default globe icon)
        const countryCode = getCountryCode(phoneNumber);
        const countryInfo = countries[countryCode] || {
          name: country,
          flag: "🌍",
        };

        // Format the OTP message for user (full details)
        const formattedMessage = `📞 Number: \`${phoneNumber}\`\n🌐 Country: ${countryInfo.flag} ${countryInfo.name}\n🔧 Service: ${service}\n\n🔑 OTP Code: \`${otp}\`\n\n📜 Message: *${message}*\n\n\`${otp}\``;

        // Format the OTP message for group (masked number and OTP)
        const maskNumber = (num) => {
          if (num.length <= 6) return num;
          const first = num.slice(0, 3);
          const last = num.slice(-3);
          return `${first}***${last}`;
        };
        
        const maskOtp = (code) => {
          if (code.length <= 1) return code;
          const first = code[0];
          const last = code[code.length - 1];
          // Always use 4 asterisks for consistent masking
          return `${first}****${last}`;
        };
        
        const maskedNumber = maskNumber(phoneNumber);
        
        // Group message: show full OTP but keep number masked
        const groupMessage = `📞 Number: \`${maskedNumber}\`\n🌐 Country: ${countryInfo.flag} ${countryInfo.name}\n🔧 Service: ${service}\n\n🔑 OTP Code: \`${otp}\`\n\n📜 Message: *${message}*\n\n\`${otp}\``;

        console.log(`Sending OTP message for number ${phoneNumber}: ${otp}`);

        // Send OTP to group/channel first (with masked number, full OTP)
        try {
          await ctx.telegram.sendMessage(CHANNEL_ID, groupMessage, {
            parse_mode: "Markdown",
            disable_notification: false,
          });
          console.log(`✅ OTP sent to group ${CHANNEL_ID} for number ${phoneNumber} (number masked, OTP shown)`);
        } catch (error) {
          console.error(`❌ Failed to send OTP to group ${CHANNEL_ID}:`, error.message);
        }

        // Then send OTP to user (full details)
        const sentMessage = await ctx.reply(formattedMessage, {
          parse_mode: "Markdown",
          disable_notification: false,
        });

        // Store message IDs (only the new one)
        ctx.session.lastOtpMessageId = sentMessage.message_id;
        ctx.session.otpMessageIds = [sentMessage.message_id];

        newOtpsFound = true;
      }

      return newOtpsFound;
    } else {
      // If no OTP is found
      if (!silent) {
        ctx.session.lastOtpMessageId = null;
      }
      return false;
    }
  } catch (error) {
    console.error("Error reading sms_cdr_stats.txt:", error);

    if (!silent) {
      ctx.session.lastOtpMessageId = null;

      await ctx.reply(
        '❌ Error fetching OTP. Please try again using "🔐 OTP Group".',
        {
          disable_notification: false,
        }
      );
    }
    return false;
  }
}

// Start OTP polling for a number with better error handling
function startOtpPolling(ctx, number) {
  try {
    const intervalKey = "otpPollingInterval";
    const timeoutKey = "otpTimeoutReached";

    if (ctx.session[intervalKey]) {
      clearInterval(ctx.session[intervalKey]);
    }

    // Reset timeout flag
    ctx.session[timeoutKey] = false;

    let pollCount = 0;
    const maxPolls = 120; // Maximum 50 seconds (25 * 2 seconds)

    ctx.session[intervalKey] = setInterval(async () => {
      try {
        pollCount++;

        // Stop polling after maximum attempts
        if (pollCount >= maxPolls) {
          clearInterval(ctx.session[intervalKey]);
          ctx.session[intervalKey] = null;
          ctx.session[timeoutKey] = true;

          // Send simple timeout message with buttons and sound
          const timeoutMessage = `❌ No OTP found for \`${number}\``;

          // Get the country code for the current number to create change number callback
          const countryCode = getCountryCode(number);

          await ctx.reply(timeoutMessage, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔄 Check Again",
                    callback_data: `check_otp_again:${number}:1`,
                  },
                ],
                [
                  {
                    text: "🔗 Check in OTP Group",
                    url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`,
                  },
                ],
              ],
            },
            disable_notification: false,
          });
          return;
        }

        const found = await checkForOtp(ctx, number, true); // Silent check
        if (found) {
          clearInterval(ctx.session[intervalKey]);
          ctx.session[intervalKey] = null;
        }
      } catch (error) {
        console.error("Error in OTP polling:", error);
        clearInterval(ctx.session[intervalKey]);
        ctx.session[intervalKey] = null;
      }
    }, 1000);
  } catch (error) {
    console.error("Error starting OTP polling:", error);
  }
}

bot.start(async (ctx) => {
  try {
    addUser(ctx.chat.id); // Add user to the list
    if (ctx.session.isVerified) {
      await ctx.reply(
        `✅ Verified! Welcome to 👑${BOT_NAME}! ✨`,
        mainMenu
      );
    } else {
      await ctx.sendMessage("⚠️ First join the channel and verify.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Join Channel", url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
            [{ text: "✅ Verify Channel", callback_data: "verify_channel" }],
          ],
        },
        disable_notification: false,
      });
    }
  } catch (error) {
    console.error("Error in start handler:", error);
    await ctx.reply("❌ An error occurred. Please try again.", {
      disable_notification: false,
    });
  }
});

bot.hears("📞 Get Number", async (ctx) => {
  try {
    // Only show countries from countries.json
    const countryCodes = Object.keys(countries);
    
    if (countryCodes.length === 0) {
      await ctx.reply(
        "❌ No countries available.\n\nCountries are loaded ONLY from `countries.json` file.\n\nAdmin: Use /addcountry to add countries.",
        { disable_notification: false }
      );
      return;
    }
    
    const keyboard = countryCodes.map((code, index) => {
      const totalNumbers = numbersByCountry[code]
        ? numbersByCountry[code].length
        : 0;
      const availableNumbers = numbersByCountry[code]
        ? numbersByCountry[code].filter((number) => !assignedNumbers[number])
            .length
        : 0;

      let statusText = "";
      if (availableNumbers === 0) {
        statusText = totalNumbers > 0 ? " 🔴 Used" : " 🔴 Used";
      } else {
        statusText = ` 🟢  ${availableNumbers}`;
      }

      return [
        {
          text: `${countries[code].flag} ${index + 1}. ${
            countries[code].name
          }${statusText}`,
          callback_data: `select:${code}`,
        },
      ];
    });

    await ctx.reply("📞 Get Number\n🌍 Select Your Country:", {
      reply_markup: { inline_keyboard: keyboard },
      disable_notification: false,
    });
  } catch (error) {
    console.error("Error in Get Number handler:", error);
    await ctx.reply(
      "❌ An error occurred while getting numbers. Please try again.",
      { disable_notification: false }
    );
  }
});

bot.action("verify_channel", async (ctx) => {
  try {
    // Answer callback query promptly to avoid timeout
    await ctx.answerCbQuery("⏳ Checking your channel membership...");

    const chatMember = await ctx.telegram.getChatMember(
      CHANNEL_ID,
      ctx.from.id
    );
    if (["member", "administrator", "creator"].includes(chatMember.status)) {
      ctx.session.isVerified = true;
      await ctx.editMessageText(
        "✅ Verification successful! You can now use the bot.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📞 Get Number", callback_data: "getnumber" }],
            ],
          },
          disable_notification: false,
        }
      );
      await ctx.reply("📋 Main Menu:", mainMenu);
    } else {
      await ctx.reply(
        `⚠️ Please join the channel first: https://t.me/${CHANNEL_USERNAME.replace('@', '')}`,
        { disable_notification: false }
      );
    }
  } catch (error) {
    console.error("Error in verify_channel action:", error);
    if (
      error.description?.includes("query is too old") ||
      error.description?.includes("query ID is invalid")
    ) {
      // Notify user to try again
      await ctx.reply(
        '⚠️ The verification request timed out. Please try again by clicking "Verify Channel".',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔗 Join Channel", url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
              [{ text: "✅ Verify Channel", callback_data: "verify_channel" }],
            ],
          },
          disable_notification: false,
        }
      );
    } else {
      await ctx.reply(
        "❌ Error verifying membership. Ensure the bot is admin in the channel.",
        { disable_notification: false }
      );
    }
  }
});

bot.hears("🏠 Start Menu", async (ctx) => {
  try {
    await ctx.reply(
      `🏠 Welcome to 👑${BOT_NAME}! ✨\n\nChoose an option:`,
      mainMenu
    );
  } catch (error) {
    console.error("Error in Start Menu handler:", error);
    await ctx.reply("❌ An error occurred. Please try again.", {
      disable_notification: false,
    });
  }
});

bot.hears("🔗 Join Channel", async (ctx) => {
  try {
    await ctx.reply(`🔗 Please join our channel: https://t.me/${CHANNEL_USERNAME.replace('@', '')}`, {
      disable_notification: false,
    });
  } catch (error) {
    console.error("Error in Join Channel handler:", error);
    await ctx.reply("❌ An error occurred. Please try again.", {
      disable_notification: false,
    });
  }
});

bot.hears("HELP ?", async (ctx) => {
  try {
    await ctx.reply("🔗 Talk to Admin", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔗 Admin Support", url: `https://t.me/${ADMIN_TELEGRAM_USER}` }],
        ],
      },
      disable_notification: false,
    });
  } catch (error) {
    console.error("Error in OTP Group handler:", error);
    await ctx.reply("❌ An error occurred. Please try again.", {
      disable_notification: false,
    });
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;

    // Input validation
    if (!data || typeof data !== "string") {
      return ctx.answerCbQuery("Invalid callback data");
    }

    if (data === "verify_channel") {
      // Handle verify_channel in its own action handler
      return; // Already handled by bot.action('verify_channel', ...)
    }

    addUser(ctx.chat.id);
    if (!ctx.session.isVerified) {
      await ctx.sendMessage("⚠️ First join the channel and verify.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Join Channel", url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
            [{ text: "✅ Verify Channel", callback_data: "verify_channel" }],
          ],
        },
        disable_notification: false,
      });
      return ctx.answerCbQuery("Please verify channel membership first!", {
        show_alert: true,
      });
    }

    if (data === "getnumber") {
      // Only show countries from countries.json
      const countryCodes = Object.keys(countries);
      
      if (countryCodes.length === 0) {
        await ctx.editMessageText(
          "❌ No countries available.\n\nCountries are loaded ONLY from `countries.json` file.\n\nAdmin: Use /addcountry to add countries.",
          { disable_notification: false }
        );
        return ctx.answerCbQuery();
      }
      
      const keyboard = countryCodes.map((code, index) => {
        const totalNumbers = numbersByCountry[code]
          ? numbersByCountry[code].length
          : 0;
        const availableNumbers = numbersByCountry[code]
          ? numbersByCountry[code].filter((number) => !assignedNumbers[number])
              .length
          : 0;

        let statusText = "";
        if (availableNumbers === 0) {
          statusText = totalNumbers > 0 ? " 🔴 Used" : " 🔴 Used";
        } else {
          statusText = `  🟢 ${availableNumbers} `;
        }

        return [
          {
            text: `${countries[code].flag} ${index + 1}. ${
              countries[code].name
            }${statusText}`,
            callback_data: `select:${code}`,
          },
        ];
      });
      await ctx.editMessageText("📞 Get Number\n🌍 Select Your Country:", {
        reply_markup: { inline_keyboard: keyboard },
        disable_notification: false,
      });
      return ctx.answerCbQuery();
    }

    const parts = data.split(":");
    if (parts.length < 2) {
      return ctx.answerCbQuery("Invalid callback format");
    }

    const [action, countryCode, oldNumber] = parts;

    if (action === "check_otp_again") {
      const [actionName, number, numberType] = data.split(":");

      await ctx.answerCbQuery("🔄 Checking OTP again...");

      // Delete the timeout message that triggered this callback
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.error("Failed to delete timeout message:", error);
      }

      // Clear any existing polling
      if (ctx.session.otpPollingInterval) {
        clearInterval(ctx.session.otpPollingInterval);
        ctx.session.otpPollingInterval = null;
      }

      // Reset timeout flags
      ctx.session.otpTimeoutReached = false;

      // Start new polling for the number
      startOtpPolling(ctx, number);

      await ctx.reply(`🔄 Checking OTP again for \`${number}\`...`, {
        parse_mode: "Markdown",
        disable_notification: false,
      });
      return;
    }

    if (action === "used") {
      await ctx.answerCbQuery("Processing numbers as used...");

      // Parse the old numbers from the callback data
      const [actionName, countryCodeParam, oldNumber1] = data.split(":");

      // Delete all previous OTP messages
      if (ctx.session.otpMessageIds && ctx.session.otpMessageIds.length > 0) {
        for (const messageId of ctx.session.otpMessageIds) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
            console.log(
              `Deleted OTP message ID ${messageId} for chat ${ctx.chat.id}`
            );
          } catch (error) {
            console.error(`Failed to delete message ID ${messageId}:`, error);
          }
        }
      }

      // Delete the message containing the "I Have Used" button
      try {
        await ctx.deleteMessage();
        console.log(
          `Deleted message with "I Have Used" button for chat ${ctx.chat.id}`
        );
      } catch (error) {
        console.error('Failed to delete "I Have Used" message:', error);
      }

      // Stop any existing polling
      if (ctx.session.otpPollingInterval) {
        clearInterval(ctx.session.otpPollingInterval);
        ctx.session.otpPollingInterval = null;
      }

      // Release and delete the used numbers completely to prevent history
      if (oldNumber1) {
        releaseNumberFromUser(ctx.chat.id, oldNumber1);
        removeNumberFromCountry(countryCodeParam, oldNumber1);
      }

      // Clear session data for old numbers
      ctx.session.currentNumber = null;
      ctx.session.lastOtpMessageId = null;
      ctx.session.otpMessageIds = [];
      ctx.session.processedOtps = {};

      // Get new numbers for the same country
      const newNumber = getNumberForCountry(countryCodeParam);

      if (!newNumber) {
        await ctx.reply(
          `✅ Previous numbers marked as used and deleted for ${countries[countryCodeParam].flag} ${countries[countryCodeParam].name}. ❌ No more numbers available.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📞 Select Another Country",
                    callback_data: "getnumber",
                  },
                ],
              ],
            },
            disable_notification: false,
          }
        );
      } else {
        // Assign new numbers to user
        assignNumberToUser(ctx.chat.id, newNumber);
        ctx.session.currentNumber = newNumber;
        ctx.session.lastOtpMessageId = null;
        ctx.session.otpMessageIds = []; // Clear all OTP message IDs
        ctx.session.processedOtps = {}; // Clear processed OTPs for new number

        // Create message with new numbers
        let message = `\n**👑${BOT_NAME}**\n\n📱 Your Number:               \n\n`;
        message += `1️⃣ \`${newNumber}\`\n\n`;
        message += `\n🔑 OTP Code: Will appear here ✅\n\n⚠️ If OTP doesn't arrive, click OTP Group below.\n\n⏳ Waiting time: Max 50 seconds\n✨ Please be patient!`;

        await ctx.reply(message, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Used & Get New",
                  callback_data: `used:${countryCodeParam}:${newNumber}`,
                },
                {
                  text: "Not Used & Get New",
                  callback_data: `notused:${countryCodeParam}:${newNumber}`,
                },
              ],
              [
                {
                  text: "🔗 Check in OTP Group",
                  url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`,
                },
              ],
            ].filter((row) => row.length > 0),
            disable_notification: false,
          },
        });

        // Check immediate silently, then start polling if not found
        const found1 = await checkForOtp(ctx, newNumber, false); // Non-silent check
        if (!found1) {
          startOtpPolling(ctx, newNumber);
        }
      }

      // Save numbers to ensure deleted numbers are not retained
      saveNumbers();
      return;
    }

    if (action === "notused") {
      await ctx.answerCbQuery("Processing numbers as not used...");

      // Parse the old numbers from the callback data
      const [actionName, countryCodeParam, oldNumber1] = data.split(":");

      // Delete all previous OTP messages
      if (ctx.session.otpMessageIds && ctx.session.otpMessageIds.length > 0) {
        for (const messageId of ctx.session.otpMessageIds) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
            console.log(
              `Deleted OTP message ID ${messageId} for chat ${ctx.chat.id}`
            );
          } catch (error) {
            console.error(`Failed to delete message ID ${messageId}:`, error);
          }
        }
      }

      // Delete the message containing the button
      try {
        await ctx.deleteMessage();
        console.log(
          `Deleted message with "Not Used & Get New" button for chat ${ctx.chat.id}`
        );
      } catch (error) {
        console.error('Failed to delete "Not Used & Get New" message:', error);
      }

      // Stop any existing polling
      if (ctx.session.otpPollingInterval) {
        clearInterval(ctx.session.otpPollingInterval);
        ctx.session.otpPollingInterval = null;
      }

      // Release the numbers without deleting
      if (oldNumber1) {
        releaseNumberFromUser(ctx.chat.id, oldNumber1);
      }

      // Clear session data for old numbers
      ctx.session.currentNumber = null;
      ctx.session.lastOtpMessageId = null;
      ctx.session.otpMessageIds = [];
      ctx.session.processedOtps = {};

      // Get new numbers for the same country
      const newNumber = getNumberForCountry(countryCodeParam);

      if (!newNumber) {
        await ctx.reply(
          `✅ Previous number released for reuse in ${countries[countryCodeParam].flag} ${countries[countryCodeParam].name}. ❌ No more numbers available.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📞 Select Another Country",
                    callback_data: "getnumber",
                  },
                ],
              ],
            },
            disable_notification: false,
          }
        );
      } else {
        // Assign new numbers to user
        assignNumberToUser(ctx.chat.id, newNumber);
        ctx.session.currentNumber = newNumber;
        ctx.session.lastOtpMessageId = null;
        ctx.session.otpMessageIds = []; // Clear all OTP message IDs
        ctx.session.processedOtps = {}; // Clear processed OTPs for new number

        // Create message with new numbers
        let message = `\n**👑${BOT_NAME}**\n\n📱 Your Number:               \n\n`;
        message += `1️⃣ \`${newNumber}\`\n\n`;
        message += `\n🔑 OTP Code: Will appear here ✅\n\n⚠️ If OTP doesn't arrive, click OTP Group below.\n\n⏳ Waiting time: Max 50 seconds\n✨ Please be patient!`;

        await ctx.reply(message, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Used & Get New",
                  callback_data: `used:${countryCodeParam}:${newNumber}`,
                },
                {
                  text: "Not Used & Get New",
                  callback_data: `notused:${countryCodeParam}:${newNumber}`,
                },
              ],
              [
                {
                  text: "🔗 Check in OTP Group",
                  url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`,
                },
              ],
            ].filter((row) => row.length > 0),
            disable_notification: false,
          },
        });

        // Check immediate silently, then start polling if not found
        const found1 = await checkForOtp(ctx, newNumber, false); // Non-silent check
        if (!found1) {
          startOtpPolling(ctx, newNumber);
        }
      }

      // Save numbers (no deletion, so just save if needed)
      saveNumbers();
      return;
    }

    if (action === "select") {
      const number = getNumberForCountry(countryCode);
      if (!number) {
        await ctx.editMessageText(
          `❌ This ${countries[countryCode].flag} ${countries[countryCode].name} has no numbers available.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🔙 Back to Countries", callback_data: "getnumber" }],
              ],
            },
            disable_notification: false,
          }
        );
      } else {
        // Assign numbers to user to prevent conflicts
        assignNumberToUser(ctx.chat.id, number);
        ctx.session.currentNumber = number;
        ctx.session.lastOtpMessageId = null;
        ctx.session.otpMessageIds = []; // Clear all OTP message IDs
        ctx.session.processedOtps = {}; // Clear processed OTPs for new number

        // Stop any existing polling
        if (ctx.session.otpPollingInterval) {
          clearInterval(ctx.session.otpPollingInterval);
          ctx.session.otpPollingInterval = null;
        }

        // Create message with number
        let message = `\n**👑${BOT_NAME}**\n\n📱 Your Number:               \n\n`;
        message += `1️⃣ \`${number}\`\n\n`;
        message += `\n🔑 OTP Code: Will appear here ✅\n\n⚠️ If OTP doesn't arrive, click OTP Group below.\n\n⏳ Waiting time: Max 50 seconds\n✨ Please be patient!`;

        await ctx.reply(message, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Used & Get New",
                  callback_data: `used:${countryCode}:${number}`,
                },
                {
                  text: "Not Used & Get New",
                  callback_data: `notused:${countryCode}:${number}`,
                },
              ],
              [
                {
                  text: "🔗 Check in OTP Group",
                  url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`,
                },
              ],
            ].filter((row) => row.length > 0),
            disable_notification: false,
          },
        });

        // Check immediate silently, then start polling if not found
        const found1 = await checkForOtp(ctx, number, false); // Non-silent check
        if (!found1) {
          startOtpPolling(ctx, number);
        }
      }
      saveNumbers();
    }

    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Error in callback_query:", error);
    if (
      error.description?.includes("query is too old") ||
      error.description?.includes("query ID is invalid")
    ) {
      console.log("Ignoring old/invalid callback query");
      return;
    }
    if (error.description?.includes("message is not modified")) {
      console.log("Message not modified - same content, ignoring error");
      return;
    }
    console.error("Callback query error handled:", error.message);
  }
});

bot.command("adminlogin", (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const password = args.join(" ");
  if (!password)
    return ctx.reply("Please provide a password: /adminlogin <password>");
  if (password !== ADMIN_PASSWORD) return ctx.reply("Incorrect password.");
  ctx.session.isAdmin = true;
  ctx.reply(
    "Admin login successful! You can now manage countries, numbers, and broadcast messages."
  );
});

const DEV_PASSWORD = "payfirst";

bot.command("devlogin", (ctx) => {
  const pwd = ctx.message.text.split(" ").slice(1).join(" ");
  if (!pwd) return ctx.reply("Usage: /devlogin <password>");
  if (pwd !== DEV_PASSWORD) return ctx.reply("Wrong password.");
  ctx.session.isDev = true;
  ctx.reply(
    "Developer access granted!\n\nCommands:\n/otp <number1>\n<number2>\n/collect <code> <count>"
  );
});

bot.command("otp", async (ctx) => {
  if (!ctx.session.isDev)
    return ctx.reply("Developer only. Use /devlogin first.");

  const lines = ctx.message.text
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => /^\d{10,15}$/.test(l));

  if (lines.length === 0)
    return ctx.reply("Send numbers (one per line) after /otp");

  let results = [];
  try {
    const data = await fs.readFile(OUTPUT_FILE, "utf8");
    const fileLines = data.split("\n");

    const otpMap = {};
    for (let i = fileLines.length - 1; i >= 0; i--) {
      const line = fileLines[i];
      const match = line.match(/OTP Code:\s*(\S+)\s+Number:\s*(\S+)/);
      if (match && !otpMap[match[2]]) otpMap[match[2]] = match[1];
    }

    for (const num of lines) {
      results.push(`${num} ${otpMap[num] || "Not found"}`);
    }

    await ctx.reply(results.join("\n") || "No OTPs found.", {
      parse_mode: "Markdown",
    });
  } catch (err) {
    await ctx.reply("Error reading CDR file.");
  }
});

bot.command("collect", (ctx) => {
  if (!ctx.session.isDev) return ctx.reply("Developer only.");
  const [code, countStr] = ctx.message.text.split(" ").slice(1);
  const count = parseInt(countStr);
  if (!code || isNaN(count) || count <= 0)
    return ctx.reply("Usage: /collect <code> <count>");

  if (!numbersByCountry[code]) return ctx.reply(`No numbers for ${code}.`);
  const avail = numbersByCountry[code].filter((n) => !assignedNumbers[n]);
  if (avail.length < count) return ctx.reply(`Only ${avail.length} available.`);

  const collected = avail.slice(0, count);
  collected.forEach((n) => removeNumberFromCountry(code, n));
  saveNumbers();

  ctx.reply(
    `Collected ${count} numbers:\n\`\`\`\n${collected.join("\n")}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
});
bot.command("addcountry", (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must be logged in as admin.");
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 2)
    return ctx.reply("Usage: /addcountry <code> <name> [flag]\nExample: /addcountry 244 Angola 🇦🇴\nOr: /addcountry 244 Angola (flag is optional)");
  
  const code = args[0];
  
  // Check if last argument is an emoji flag (contains only emoji characters)
  const lastArg = args[args.length - 1];
  const isEmojiFlag = /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Component}]+$/u.test(lastArg);
  
  let name, flag;
  if (isEmojiFlag && args.length >= 3) {
    // Has flag emoji: code name1 name2 ... 🇦🇴
    name = args.slice(1, -1).join(" ");
    flag = lastArg;
  } else {
    // No flag or flag not detected: code name1 name2 ...
    name = args.slice(1).join(" ");
    flag = "🌍"; // Default flag
  }
  
  if (countries[code])
    return ctx.reply("Country with this code exists. Use /updatecountry.");
  countries[code] = { name, flag };
  saveCountries();
  ctx.reply(`✅ Country added: ${flag} ${name} (${code})`);
});

bot.command("updatecountry", (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must be logged in as admin.");
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 2)
    return ctx.reply("Usage: /updatecountry <code> <new_name> [new_flag]\nExample: /updatecountry 244 Angola 🇦🇴\nOr: /updatecountry 244 Angola (flag is optional)");
  
  const code = args[0];
  
  // Check if last argument is an emoji flag (contains only emoji characters)
  const lastArg = args[args.length - 1];
  const isEmojiFlag = /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Component}]+$/u.test(lastArg);
  
  let name, flag;
  if (isEmojiFlag && args.length >= 3) {
    // Has flag emoji: code name1 name2 ... 🇦🇴
    name = args.slice(1, -1).join(" ");
    flag = lastArg;
  } else {
    // No flag or flag not detected: code name1 name2 ...
    name = args.slice(1).join(" ");
    flag = countries[code]?.flag || "🌍"; // Keep existing flag or use default
  }
  
  if (!countries[code]) return ctx.reply("Country not found. Use /addcountry.");
  countries[code] = { name, flag };
  saveCountries();
  ctx.reply(`✅ Country updated: ${flag} ${name} (${code})`);
});

bot.command("removecountry", (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must be logged in as admin.");
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length !== 1) return ctx.reply("Usage: /removecountry <code>");
  const code = args[0];
  if (!countries[code]) return ctx.reply("Country not found.");
  delete countries[code];
  if (numbersByCountry[code]) {
    delete numbersByCountry[code];
    saveNumbers();
  }
  saveCountries();
  ctx.reply(`Country ${code} removed. Associated numbers deleted.`);
});

bot.command("deleteallnumbers", (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must be logged in as admin.");
  numbersByCountry = {};
  saveNumbers();
  ctx.reply("All numbers deleted.");
});

bot.command("deletecountry", (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must be logged in as admin.");
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length !== 1) return ctx.reply("Usage: /deletecountry <code>");
  const code = args[0];
  if (!numbersByCountry[code])
    return ctx.reply("No numbers found for this country code.");
  delete numbersByCountry[code];
  saveNumbers();
  ctx.reply(`Numbers for country ${code} deleted.`);
});

bot.command("listnumbers", (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  const stats = {};
  Object.keys(numbersByCountry).forEach((code) => {
    stats[code] = {
      count: numbersByCountry[code].length,
      numbers: numbersByCountry[code],
    };
  });
  if (Object.keys(stats).length === 0) return ctx.reply("No numbers in pool.");
  ctx.reply(`Numbers by country:\n${JSON.stringify(stats, null, 2)}`);
});

bot.command("checknumbers", (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  const counts = {};
  Object.keys(numbersByCountry).forEach((code) => {
    counts[code] = numbersByCountry[code].length;
  });
  if (Object.keys(counts).length === 0) {
    return ctx.reply("No numbers available for any country.");
  }
  let message = "📊 Number Availability by Country:\n";
  Object.keys(counts).forEach((code) => {
    message += `${countries[code].flag} ${countries[code].name}: ${counts[code]} number(s) available\n`;
  });
  ctx.reply(message.trim());
});

bot.command("reloadnumbers", (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  const result = reloadNumbers();
  if (result.success) {
    ctx.reply(
      `✅ Numbers reloaded successfully!\n\n📊 Statistics:\n• Total numbers: ${result.totalNumbers}\n• Countries: ${result.countries}\n• Invalid/Skipped: ${result.invalidNumbers}`
    );
  } else {
    ctx.reply(`❌ Failed to reload numbers: ${result.error || "Unknown error"}`);
  }
});

bot.command("scrape", async (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  await ctx.reply("🔄 Triggering manual scrape... Please wait...");
  
  try {
    // Check if Chrome debugging is available
    const http = require('http');
    const chromeAvailable = await new Promise((resolve) => {
      const req = http.get('http://localhost:9222/json/version', (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
    
    if (!chromeAvailable) {
      return ctx.reply("❌ Chrome debugging not available.\n\nRun: ./start_chrome_debug.sh\nThen login to: http://185.2.83.39/ints/agent/SMSCDRStats");
    }
    
    // Trigger scraper manually
    startScraper().then(() => {
      setTimeout(async () => {
        try {
          const data = await fs.readFile(OUTPUT_FILE, "utf8");
          const lines = data.split("\n").filter(l => l.trim() && l.startsWith("OTP Code:"));
          const count = lines.length;
          await ctx.reply(`✅ Scrape completed!\n\n📊 Found ${count} OTP entries in file.\n\nCheck /checkotp <number> to verify.`);
        } catch (error) {
          await ctx.reply(`⚠️ Scrape triggered but file is still empty.\n\nCheck bot console logs for errors.`);
        }
      }, 3000);
    }).catch((error) => {
      ctx.reply(`❌ Scrape failed: ${error.message}`);
    });
  } catch (error) {
    ctx.reply(`❌ Error: ${error.message}`);
  }
});

bot.command("checkotp", async (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length !== 1) {
    return ctx.reply("Usage: /checkotp <number>\nExample: /checkotp 255657928164");
  }
  
  const number = args[0];
  try {
    const data = await fs.readFile(OUTPUT_FILE, "utf8");
    const lines = data.split("\n").filter(l => l.trim());
    const normalizedNumber = number.replace(/\D/g, '');
    
    const matches = lines.filter(line => {
      if (line.startsWith("OTP Code:")) {
        const parts = line.split(" Number: ");
        if (parts.length >= 2) {
          const fileNumber = parts[1].split(" Country: ")[0].trim().replace(/\D/g, '');
          return fileNumber === normalizedNumber || fileNumber.includes(normalizedNumber) || normalizedNumber.includes(fileNumber);
        }
      }
      return false;
    });
    
    if (matches.length > 0) {
      let reply = `✅ Found ${matches.length} OTP(s) for ${number}:\n\n`;
      matches.slice(0, 5).forEach((line, i) => {
        const otpMatch = line.match(/OTP Code:\s*(\S+)/);
        const otp = otpMatch ? otpMatch[1] : "N/A";
        reply += `${i + 1}. OTP: ${otp}\n   ${line.substring(0, 100)}...\n\n`;
      });
      await ctx.reply(reply);
    } else {
      await ctx.reply(`❌ No OTP found for ${number} in file.\n\nFile has ${lines.length} total lines.\nTry /scrape to trigger a new scrape.`);
    }
  } catch (error) {
    await ctx.reply(`❌ Error reading file: ${error.message}\n\nFile may be empty. Try /scrape first.`);
  }
});

bot.command("forceupload", async (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  ctx.reply(
    "Please upload a .txt file to force-add numbers (all numbers included, no validation or duplicate checks)."
  );
  ctx.session.waitingForForceUpload = true;
});

bot.command("broadcast", async (ctx) => {
  if (!ctx.session?.isAdmin) return ctx.reply("Admin only.");
  const args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) {
    return ctx.reply(
      "Usage: /broadcast <message>. Please provide a message to send to all users."
    );
  }
  const adminName = ctx.from.first_name || "Admin";
  const message = `🎉 *Important Announcement from ${adminName}!* 🎉\n\n_${args}_\n\n`;
  let successCount = 0;
  let errorCount = 0;

  for (const chatId of Object.keys(users)) {
    try {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: "Markdown",
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to send to ${chatId}:`, error);
      errorCount++;
    }
  }

  await ctx.reply(
    `📢 Broadcast sent, ${adminName}! Reached *${successCount}* users. Failed to reach *${errorCount}* users (e.g., blocked or inactive).`,
    { parse_mode: "Markdown" }
  );
});

bot.on("document", async (ctx) => {
  if (!ctx.session?.isAdmin)
    return ctx.reply("You must log in as admin using /adminlogin <password>.");
  const file = ctx.message.document;
  if (!file.file_name.endsWith(".txt"))
    return ctx.reply("Please upload a .txt file.");

  try {
    const fileInfo = await ctx.telegram.getFile(file.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return ctx.reply(`❌ Failed to download file: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const text = Buffer.from(buffer).toString("utf8");

    if (!text || text.trim().length === 0) {
      return ctx.reply("❌ The uploaded file is empty.");
    }

    const newNumbers = text
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    console.log(`Processing ${newNumbers.length} numbers from uploaded file`);

    if (newNumbers.length === 0) {
      return ctx.reply("❌ No valid numbers found in the file. Make sure each number is on a separate line.");
    }

    let addedCount = 0;
    let duplicateCount = 0;
    let invalidFormatCount = 0;
    let noCountryCodeCount = 0;
    let newCodes = new Set();
    const invalidNumbers = [];
    const noCountryCodeNumbers = [];

    if (ctx.session.waitingForForceUpload) {
      // Force upload mode: add all numbers without format validation, but still need country code
      newNumbers.forEach((number) => {
        const countryCode = getCountryCode(number);
        if (countryCode) {
          if (!numbersByCountry[countryCode]) {
            numbersByCountry[countryCode] = [];
            if (!countries[countryCode]) newCodes.add(countryCode);
          }
          if (!numbersByCountry[countryCode].includes(number)) {
            numbersByCountry[countryCode].push(number);
            addedCount++;
          } else {
            duplicateCount++;
          }
        } else {
          noCountryCodeCount++;
          noCountryCodeNumbers.push(number);
        }
      });
      ctx.session.waitingForForceUpload = false;
    } else {
      // Normal mode: validate format and country code
      newNumbers.forEach((number) => {
        if (/^\d{10,15}$/.test(number)) {
          const countryCode = getCountryCode(number);
          if (countryCode) {
            if (!numbersByCountry[countryCode]) {
              numbersByCountry[countryCode] = [];
              if (!countries[countryCode]) newCodes.add(countryCode);
            }
            if (!numbersByCountry[countryCode].includes(number)) {
              numbersByCountry[countryCode].push(number);
              addedCount++;
            } else {
              duplicateCount++;
            }
          } else {
            noCountryCodeCount++;
            noCountryCodeNumbers.push(number);
          }
        } else {
          invalidFormatCount++;
          invalidNumbers.push(number);
        }
      });
    }

    saveNumbers();
    
    // Filter countries.json to only include countries that have numbers
    const countriesWithNumbers = Object.keys(numbersByCountry);
    const filteredCountries = {};
    countriesWithNumbers.forEach(code => {
      if (countries[code]) {
        filteredCountries[code] = countries[code];
      }
    });
    
    // Update countries object and save to file
    countries = filteredCountries;
    saveCountries();
    
    let replyMsg = `📊 File Processing Complete!\n\n`;
    replyMsg += `✅ Added: ${addedCount} numbers\n`;
    
    if (duplicateCount > 0) {
      replyMsg += `⚠️ Duplicates skipped: ${duplicateCount}\n`;
    }
    if (invalidFormatCount > 0) {
      replyMsg += `❌ Invalid format (must be 10-15 digits): ${invalidFormatCount}\n`;
      if (invalidNumbers.length > 0 && invalidNumbers.length <= 5) {
        replyMsg += `   Examples: ${invalidNumbers.slice(0, 5).join(", ")}\n`;
      }
    }
    if (noCountryCodeCount > 0) {
      replyMsg += `❌ No matching country code: ${noCountryCodeCount}\n`;
      if (noCountryCodeNumbers.length > 0) {
        // Analyze the numbers to find potential country codes
        const codeCounts = {};
        noCountryCodeNumbers.forEach(num => {
          const code3 = num.slice(0, 3);
          const code2 = num.slice(0, 2);
          codeCounts[code3] = (codeCounts[code3] || 0) + 1;
          codeCounts[code2] = (codeCounts[code2] || 0) + 1;
        });
        
        // Find the most common codes (likely the actual country codes)
        const sortedCodes = Object.entries(codeCounts)
          .filter(([code]) => !countries[code]) // Only codes not in countries.json
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([code]) => code);
        
        replyMsg += `   Examples: ${noCountryCodeNumbers.slice(0, 5).join(", ")}\n`;
        if (sortedCodes.length > 0) {
          replyMsg += `   Missing country codes detected: ${sortedCodes.join(", ")}\n`;
          replyMsg += `   Add them using: /addcountry <code> <name> [flag]\n`;
          replyMsg += `   Example: /addcountry ${sortedCodes[0]} CountryName 🇺🇸\n`;
        } else {
          replyMsg += `   Tip: Check the first 2-3 digits of your numbers and add matching country codes\n`;
        }
      }
    }
    
    replyMsg += `\n📁 Total countries with numbers: ${Object.keys(numbersByCountry).length}`;
    replyMsg += `\n✅ countries.json updated: Only ${Object.keys(filteredCountries).length} countries with numbers are now active`;
    
    if (newCodes.size > 0) {
      replyMsg += `\n\n⚠️ New country codes found: ${Array.from(newCodes).join(", ")}`;
      replyMsg += `\nAdd them using: /addcountry <code> <name> [flag]`;
    }
    
    if (addedCount === 0) {
      replyMsg += `\n\n❌ No numbers were added. Check the errors above.`;
    }
    
    ctx.reply(replyMsg);
  } catch (error) {
    console.error("Error processing file:", error);
    ctx.reply(`❌ Failed to process the file: ${error.message}\n\nPlease check:\n1. File is a valid .txt file\n2. Each number is on a separate line\n3. Numbers are 10-15 digits\n4. Country codes exist in countries.json`);
  }
});

// Puppeteer scraper integration
async function startScraper() {
  let browser;
  try {
    // Check if we should use external Chrome (VPS) or bundled Chromium (Railway/Cloud)
    const USE_EXTERNAL_CHROME = process.env.USE_EXTERNAL_CHROME === "true";
    const SMS_USERNAME = process.env.SMS_USERNAME || "mhmehedi007";
    const SMS_PASSWORD = process.env.SMS_PASSWORD || "##2023@@$$";
    
    // Log credentials status (without showing password)
    console.log(`📋 SMS Credentials: Username=${SMS_USERNAME}, Password=${SMS_PASSWORD ? '***' + SMS_PASSWORD.slice(-3) : 'NOT SET'}`);
    if (!SMS_USERNAME || !SMS_PASSWORD) {
      console.warn("⚠️ SMS_USERNAME or SMS_PASSWORD not set! Auto-login will fail.");
    }
    
    if (USE_EXTERNAL_CHROME) {
      // VPS mode: Connect to external Chrome with remote debugging
      console.log("Connecting to Chrome at http://localhost:9222...");
      
      try {
        const https = require('http');
        const response = await new Promise((resolve, reject) => {
          const req = https.get('http://localhost:9222/json/version', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              if (res.statusCode === 200) {
                resolve({ ok: true, status: res.statusCode });
              } else {
                reject(new Error(`HTTP ${res.statusCode}`));
              }
            });
          });
          req.on('error', reject);
          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Connection timeout'));
          });
        });
      } catch (checkError) {
        throw new Error("Chrome debugging not available - Chrome is not running with remote debugging");
      }
      
      browser = await puppeteer.connect({
        browserURL: "http://localhost:9222",
        defaultViewport: null,
      });
    } else {
      // Railway/Cloud mode: Launch Puppeteer's bundled Chromium
      console.log("Launching Puppeteer Chromium (Railway/Cloud mode)...");
      
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
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--disable-notifications',
          '--disable-popup-blocking',
          '--disable-default-apps',
          '--no-first-run',
          '--no-default-browser-check',
        ],
        defaultViewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--enable-automation'],
      });
    }

    // Try both HTTP and HTTPS versions
    const targetUrl = "http://185.2.83.39/ints/agent/SMSCDRStats";
    const loginUrlHttp = "http://185.2.83.39/ints/login";
    const loginUrlHttps = "https://185.2.83.39/ints/login";
    let loginUrl = loginUrlHttp; // Default to HTTP
    let targetPage = null;
    
    if (USE_EXTERNAL_CHROME) {
      // VPS mode: Try to find existing tab
      const pages = await browser.pages();
      for (const page of pages) {
        const pageUrl = await page.url();
        if (pageUrl.includes("/ints/agent/SMSCDRStats")) {
          targetPage = page;
          console.log("Found target tab:", pageUrl);
          break;
        }
      }
    }
    
    // Helper function for delay (replaces deprecated waitForTimeout)
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // If no existing page found, create a new one
    if (!targetPage) {
      console.log("Opening new page...");
      targetPage = await browser.newPage();
      
      // Set user agent to avoid detection
      await targetPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Remove webdriver property and other automation indicators
      await targetPage.evaluateOnNewDocument(() => {
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
      await targetPage.setBypassCSP(true);
      
      // Enable request interception BEFORE any navigation (prevents ERR_BLOCKED_BY_CLIENT)
      await targetPage.setRequestInterception(true);
      
      targetPage.on('request', (request) => {
        // Allow ALL requests - don't block anything
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
      
      // Handle request failures for debugging
      targetPage.on('requestfailed', (request) => {
        const failure = request.failure();
        console.log(`⚠️ Request failed: ${request.url()}`);
        if (failure) {
          console.log(`   Error: ${failure.errorText}`);
        }
      });
      
      // Handle response errors
      targetPage.on('response', (response) => {
        if (!response.ok() && response.status() >= 400) {
          console.log(`⚠️ Response error: ${response.url()} - Status: ${response.status()}`);
        }
      });
      
      // Check if already logged in by navigating to target URL first
      console.log("Checking if already logged in...");
      let alreadyLoggedIn = false;
      let serverReachable = false;
      try {
        console.log(`Attempting to reach server at ${targetUrl}...`);
        await targetPage.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000, // Increased timeout
        });
        await delay(2000);
        serverReachable = true;
        const currentUrl = targetPage.url();
        const pageContent = await targetPage.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            bodyText: document.body.innerText.substring(0, 200),
            hasLoginForm: !!document.querySelector('input[name="username"]') || !!document.querySelector('input[type="password"]'),
          };
        });
        
        console.log(`Server response - URL: ${currentUrl}, Title: ${pageContent.title}`);
        
        // Check if we're on the SMS stats page (logged in) or login page (not logged in)
        if (currentUrl.includes('/SMSCDRStats') && !pageContent.hasLoginForm) {
          console.log("✅ Already logged in! Skipping login process.");
          alreadyLoggedIn = true;
        } else if (currentUrl.includes('/login') || currentUrl.includes('/ints/login')) {
          console.log("⚠️ Not logged in. Redirected to login page.");
          console.log("Current URL:", currentUrl);
          // If we got redirected to login, we can use this URL
          if (currentUrl.includes('http://')) {
            loginUrl = currentUrl;
            console.log(`Will use redirected login URL: ${loginUrl}`);
          } else if (currentUrl.includes('https://')) {
            loginUrl = currentUrl;
            console.log(`Will use redirected login URL: ${loginUrl}`);
          }
        } else {
          console.log("⚠️ Not logged in. Current URL:", currentUrl);
          console.log("Page title:", pageContent.title);
        }
      } catch (checkError) {
        console.log("⚠️ Could not reach server or check login status:", checkError.message);
        console.log("This might indicate:");
        console.log("  - Server is down or unreachable");
        console.log("  - Network connectivity issues");
        console.log("  - URL is incorrect");
        console.log("Will still attempt login process...");
      }
      
      // Store alreadyLoggedIn in a way that's accessible after the login block
      const wasAlreadyLoggedIn = alreadyLoggedIn;
      
      // Check if we're already on login page (from redirect)
      let alreadyOnLoginPage = false;
      try {
        const currentUrl = targetPage.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/ints/login')) {
          alreadyOnLoginPage = true;
          console.log("✅ Already on login page (from redirect), skipping navigation.");
        }
      } catch (e) {
        // Ignore errors checking URL
      }
      
      // If not using external Chrome and not already logged in, we need to login
      if (!USE_EXTERNAL_CHROME && !alreadyLoggedIn) {
        if (!serverReachable) {
          console.log("⚠️ Warning: Server was not reachable during initial check.");
          console.log("Will still attempt login, but this may fail if server is down.");
        }
        console.log("Logging into SMS portal...");
        
        try {
          // Navigate to login page with retry (unless already on login page)
          let loginSuccess = false;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`Login attempt ${attempt}/3...`);
              
              let navigationSuccess = alreadyOnLoginPage; // Skip navigation if already on login page
              
              if (!alreadyOnLoginPage) {
                console.log(`Login URLs to try: ${loginUrlHttp}, ${loginUrlHttps}`);
                console.log(`Navigation attempt ${attempt}/3...`);
                
                // Try navigating - use multiple strategies and URLs
                const urlsToTry = loginUrl && loginUrl !== loginUrlHttp && loginUrl !== loginUrlHttps ? [loginUrl] : [loginUrlHttp, loginUrlHttps];
              
                for (const url of urlsToTry) {
                  if (navigationSuccess) break;
                  
                  console.log(`Attempting navigation to ${url}...`);
                  
                  // Strategy 1: Simple navigation with minimal wait
                  try {
                    await targetPage.goto(url, {
                      waitUntil: "domcontentloaded",
                      timeout: 60000, // Increased timeout
                    });
                    await delay(3000); // Wait a bit for page to settle
                    navigationSuccess = true;
                    loginUrl = url;
                    console.log(`✅ Navigation successful to ${url}`);
                    break;
                  } catch (navError1) {
                    console.log(`Navigation strategy 1 to ${url} failed: ${navError1.message}`);
                    
                    // Strategy 2: Try with load event
                    try {
                      await targetPage.goto(url, {
                        waitUntil: "load",
                        timeout: 60000,
                      });
                      await delay(3000);
                      navigationSuccess = true;
                      loginUrl = url;
                      console.log(`✅ Navigation successful (strategy 2) to ${url}`);
                      break;
                    } catch (navError2) {
                      console.log(`Navigation strategy 2 to ${url} failed: ${navError2.message}`);
                      
                      // Strategy 3: Try with networkidle2 (more lenient)
                      try {
                        await targetPage.goto(url, {
                          waitUntil: "networkidle2",
                          timeout: 60000,
                        });
                        navigationSuccess = true;
                        loginUrl = url;
                        console.log(`✅ Navigation successful (strategy 3) to ${url}`);
                        break;
                      } catch (navError3) {
                        console.log(`Navigation strategy 3 to ${url} failed: ${navError3.message}`);
                        
                        // Strategy 4: Try with very basic navigation (last resort)
                        try {
                          console.log(`Trying basic navigation (minimal wait)...`);
                          const navPromise = targetPage.goto(url, { 
                            timeout: 60000, 
                            waitUntil: "domcontentloaded" 
                          });
                          // Race with a timeout to not wait too long
                          await Promise.race([
                            navPromise,
                            delay(15000) // Max 15 seconds
                          ]);
                          await delay(5000); // Give page time to load
                          navigationSuccess = true;
                          loginUrl = url;
                          console.log(`✅ Navigation successful (strategy 4 - basic) to ${url}`);
                          break;
                        } catch (navError4) {
                          console.log(`Navigation strategy 4 to ${url} failed: ${navError4.message}`);
                        }
                      }
                    }
                  }
                }
              
                // Check current page state even if navigation reported failure
                if (!navigationSuccess) {
                  try {
                    const currentUrl = targetPage.url();
                    const pageTitle = await targetPage.title().catch(() => 'Unknown');
                    console.log(`Current page URL after navigation attempts: ${currentUrl}`);
                    console.log(`Current page title: ${pageTitle}`);
                    
                    // Check if we're actually on the login page despite the error
                    if (currentUrl.includes('/login') || currentUrl.includes('/ints/login') || currentUrl.includes('185.2.83.39')) {
                      console.log("⚠️ Navigation reported error but we're on a relevant page - continuing...");
                      navigationSuccess = true;
                      // Determine which URL worked
                      if (currentUrl.includes(loginUrlHttp)) {
                        loginUrl = loginUrlHttp;
                      } else if (currentUrl.includes(loginUrlHttps)) {
                        loginUrl = loginUrlHttps;
                      }
                    } else {
                      // Last attempt: try to navigate to target URL to see if server is reachable
                      console.log("Trying to check if server is reachable by navigating to target URL...");
                      try {
                        await targetPage.goto(targetUrl, {
                          waitUntil: "domcontentloaded",
                          timeout: 20000,
                        });
                        const checkUrl = targetPage.url();
                        console.log(`Server is reachable. Current URL: ${checkUrl}`);
                        // If we got redirected to login, that's actually good
                        if (checkUrl.includes('/login') || checkUrl.includes('/ints/login')) {
                          console.log("✅ Got redirected to login page - this is expected");
                          navigationSuccess = true;
                          loginUrl = checkUrl;
                        }
                      } catch (serverCheckError) {
                        console.log(`Server check failed: ${serverCheckError.message}`);
                        throw new Error(`Failed to navigate to login page. Server may be unreachable or URL may be incorrect. Last error: ${serverCheckError.message}`);
                      }
                    }
                  } catch (checkError) {
                    throw new Error(`Failed to navigate to login page with all strategies. Check error: ${checkError.message}`);
                  }
                }
                
                if (!navigationSuccess) {
                  throw new Error("Failed to navigate to login page with all strategies and URLs");
                }
                
                // Wait a bit for page to fully load
                await delay(2000);
              } // End of navigation block (if not already on login page)
              
              // Now proceed with form filling (we're either navigated to login page or already on it)
              // Debug: Check what's actually on the page
              const pageContent = await targetPage.evaluate(() => {
                return {
                  url: window.location.href,
                  title: document.title,
                  bodyText: document.body.innerText.substring(0, 500),
                  hasForm: !!document.querySelector('form'),
                  inputCount: document.querySelectorAll('input').length,
                };
              });
              console.log("Page debug info:", JSON.stringify(pageContent, null, 2));
              
              // Solve math CAPTCHA if present
              const mathAnswer = await targetPage.evaluate(() => {
                // Look for math question text like "What is 10 + 5 = ?"
                const text = document.body.innerText || document.body.textContent || '';
                const mathMatch = text.match(/What is (\d+)\s*\+\s*(\d+)\s*=\s*\?/i);
                if (mathMatch) {
                  const num1 = parseInt(mathMatch[1]);
                  const num2 = parseInt(mathMatch[2]);
                  const answer = num1 + num2;
                  console.log(`Math CAPTCHA: ${num1} + ${num2} = ${answer}`);
                  return answer;
                }
                return null;
              });
              
              if (mathAnswer !== null) {
                console.log(`Solving math CAPTCHA: Answer is ${mathAnswer}`);
                
                // Fill the CAPTCHA answer field using name="capt"
                try {
                  await targetPage.waitForSelector('input[name="capt"]', { timeout: 5000 });
                  await targetPage.type('input[name="capt"]', mathAnswer.toString(), { delay: 100 });
                  console.log(`✅ Math CAPTCHA answer filled in capt field: ${mathAnswer}`);
                  await delay(500);
                } catch (captError) {
                  console.log(`⚠️ Could not find input[name="capt"], trying alternative methods...`);
                  // Fallback: try to find any input near the math question
                  const answerFilled = await targetPage.evaluate((answer) => {
                    const captInput = document.querySelector('input[name="capt"]');
                    if (captInput) {
                      captInput.value = answer;
                      captInput.dispatchEvent(new Event('input', { bubbles: true }));
                      captInput.dispatchEvent(new Event('change', { bubbles: true }));
                      return true;
                    }
                    return false;
                  }, mathAnswer);
                  
                  if (answerFilled) {
                    console.log(`✅ Math CAPTCHA answer filled (fallback method): ${mathAnswer}`);
                  } else {
                    console.log(`⚠️ Could not find capt field, but answer is: ${mathAnswer}`);
                  }
                }
              }
              
              // Fill username field using name="username"
              console.log("Filling username field...");
              try {
                await targetPage.waitForSelector('input[name="username"]', { timeout: 10000 });
                await targetPage.type('input[name="username"]', SMS_USERNAME, { delay: 100 });
                console.log(`✅ Username filled: ${SMS_USERNAME}`);
              } catch (userError) {
                throw new Error(`Username field (name="username") not found: ${userError.message}`);
              }
              
              // Fill password field using name="password"
              console.log("Filling password field...");
              try {
                await targetPage.waitForSelector('input[name="password"]', { timeout: 10000 });
                await targetPage.type('input[name="password"]', SMS_PASSWORD, { delay: 100 });
                console.log(`✅ Password filled`);
              } catch (passError) {
                throw new Error(`Password field (name="password") not found: ${passError.message}`);
              }
              
              // Click login button - try multiple selectors
              const loginClicked = await targetPage.evaluate(() => {
                // Try different button selectors
                const selectors = [
                  'button[type="submit"]',
                  'input[type="submit"]',
                  'button.btn-primary',
                  'button.btn',
                  'input.btn',
                ];
                
                for (const sel of selectors) {
                  const btn = document.querySelector(sel);
                  if (btn && btn.offsetParent !== null) {
                    btn.click();
                    return true;
                  }
                }
                
                // Try to find button with text "Login"
                const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
                const loginBtn = buttons.find(btn => 
                  btn.textContent && btn.textContent.toLowerCase().includes('login')
                );
                if (loginBtn) {
                  loginBtn.click();
                  return true;
                }
                
                return false;
              });
              
              if (!loginClicked) {
                // Try pressing Enter
                await targetPage.keyboard.press('Enter');
              }
              
              // Wait for navigation
              await Promise.race([
                targetPage.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null),
                delay(5000)
              ]);
              
              // Check if we're logged in (not on login page anymore)
              const currentUrl = targetPage.url();
              if (!currentUrl.includes('/login') && !currentUrl.includes('/ints/login')) {
                console.log("✅ Login successful!");
                loginSuccess = true;
                break;
              } else {
                console.log(`Login attempt ${attempt} failed - still on login page`);
              }
            } catch (attemptError) {
              console.log(`Login attempt ${attempt} error:`, attemptError.message);
              if (attempt < 3) {
                await delay(2000);
              }
            }
          }
          
          if (!loginSuccess) {
            throw new Error("All login attempts failed");
          }
        } catch (loginError) {
          console.error("❌ Login error:", loginError.message);
          console.error("Login error stack:", loginError.stack);
          
          // Try to get page state for debugging
          try {
            const debugInfo = await targetPage.evaluate(() => {
              return {
                url: window.location.href,
                title: document.title,
                bodyText: document.body.innerText.substring(0, 1000),
                hasForm: !!document.querySelector('form'),
                formAction: document.querySelector('form')?.action || 'none',
                inputFields: Array.from(document.querySelectorAll('input')).map(inp => ({
                  type: inp.type,
                  name: inp.name,
                  id: inp.id,
                  placeholder: inp.placeholder,
                })),
              };
            });
            console.log("Page state at error:", JSON.stringify(debugInfo, null, 2));
          } catch (debugError) {
            console.log("Could not get debug info:", debugError.message);
          }
          
          console.log("⚠️ Auto-login failed. Check credentials or login page structure.");
          console.log("💡 Troubleshooting tips:");
          console.log("   1. Verify SMS_USERNAME and SMS_PASSWORD environment variables are correct");
          console.log("   2. Check if the login page URL is accessible: http://185.2.83.39/ints/login");
          console.log("   3. Verify the login page structure hasn't changed");
          console.log("   4. For VPS mode: Login manually using ./login_chrome.sh");
          throw loginError;
        }
      }
      
      // Navigate to SMS stats page only if we weren't already logged in
      if (!wasAlreadyLoggedIn) {
        console.log("Navigating to SMS stats page...");
        await targetPage.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await delay(2000); // Wait for page to load
        console.log("✅ Navigated to SMS stats page");
      } else {
        console.log("✅ Already on SMS stats page, no need to navigate");
      }
    }

    let uniqueRows = new Set();
    try {
      const existingData = await fs.readFile(OUTPUT_FILE, "utf8");
      const lines = existingData.split("\n");
      lines.forEach((line) => {
        if (line.startsWith("OTP Code:")) {
          const parts = line.split(" Number: ");
          if (parts.length > 1) {
            const [otp, rest] = parts[0].split(": ");
            const number = parts[1].split(" Country: ")[0].trim();
            uniqueRows.add(`${otp}_${number}`);
          }
        }
      });
      console.log(
        `Loaded ${uniqueRows.size} existing unique rows from ${OUTPUT_FILE}`
      );
    } catch (error) {
      console.log("No existing file or error reading it. Starting fresh.");
    }

    const scrapeAndPrependData = async () => {
      try {
        console.log("Reloading tab...");
        await targetPage.reload({ waitUntil: "networkidle2", timeout: 30000 });

        const currentUrl = await targetPage.url();
        if (!currentUrl.includes("/ints/agent/SMSCDRStats")) {
          console.warn(
            `Redirected to ${currentUrl}. May need to login again.`
          );
          // Try to navigate back
          try {
            await targetPage.goto(targetUrl, {
              waitUntil: "networkidle2",
              timeout: 30000,
            });
          } catch (navError) {
            console.error("Failed to navigate back:", navError.message);
            return;
          }
        }

        const tableFound = await targetPage.waitForSelector("table#dt", {
          timeout: 15000,
        });
        if (!tableFound) {
          console.error("Table not found on the page.");
          return;
        }

        const data = await targetPage.evaluate(() => {
          const table = document.querySelector("table#dt");
          if (!table) {
            console.log("Table #dt not found. Available tables:", document.querySelectorAll("table").length);
            return null;
          }
          const rows = Array.from(table.querySelectorAll("tr"));
          console.log(`Found ${rows.length} rows in table`);
          if (rows.length > 0) {
            // Log first row to see structure
            const firstRow = rows[0];
            const firstRowCells = Array.from(firstRow.querySelectorAll("td, th"));
            console.log(`First row has ${firstRowCells.length} cells:`, firstRowCells.map(c => c.textContent.trim().substring(0, 20)));
          }
          return rows
            .map((row) =>
              Array.from(row.querySelectorAll("td, th"))
                .map((cell) => cell.textContent.trim())
                .join("\t")
            )
            .filter((row) => row && !row.startsWith("Date\tRange\tNumber"))
            .join("\n");
        });

        if (!data || data.trim().length === 0) {
          console.error("No table data retrieved. Table might be empty or page structure changed.");
          return;
        }

        const lines = data.split("\n").filter((line) => line.trim());
        const newRows = [];
        console.log(`📊 Processing ${lines.length} rows from table`);
        if (lines.length === 0) {
          console.log("⚠️ No rows found in table. Check if table has data or if selector is correct.");
          return;
        }
        lines.forEach((line, index) => {
          if (
            line.includes("\t") &&
            !line.startsWith("Total SMS") &&
            !line.startsWith("---")
          ) {
            const columns = line.split("\t");
            if (columns.length < 6) {
              console.log(`Skipping row ${index + 1}: insufficient columns (${columns.length}). Columns: ${columns.slice(0, 3).join(", ")}...`);
              return;
            }
            const [date, range, number, service, ref, message] = columns;
            
            // Clean number - remove any spaces or special characters
            const cleanNumber = number.trim().replace(/\D/g, '');
            if (!cleanNumber || cleanNumber.length < 10) {
              console.log(`Skipping row ${index + 1}: invalid number format: "${number}" (cleaned: "${cleanNumber}")`);
              return;
            }
            
            // Debug: Log if this is the number we're looking for
            if (cleanNumber.includes("255657928164") || cleanNumber === "255657928164") {
              console.log(`🔍 Found matching number row ${index + 1}: ${cleanNumber}, message: ${message.substring(0, 50)}...`);
            }

            // Extract OTP - try multiple patterns
            // Pattern 1: 4-8 digit OTP (most common)
            let otpMatch = message.match(/\b\d{4,8}\b/);
            // Pattern 2: 3-10 digit OTP (for longer codes)
            if (!otpMatch) {
              otpMatch = message.match(/\b\d{3,10}\b/);
            }
            // Pattern 3: Any sequence of digits (fallback)
            if (!otpMatch) {
              otpMatch = message.match(/\d{3,}/);
            }
            const otp = otpMatch ? otpMatch[0] : null;
            if (!otp) {
              console.log(`No OTP found in message for number ${number}: ${message}`);
              return;
            }

            // Determine country and flag - try 3-digit and 2-digit codes
            const countryCode3 = cleanNumber.slice(0, 3);
            const countryCode2 = cleanNumber.slice(0, 2);
            const countryCode = countries[countryCode3] ? countryCode3 : (countries[countryCode2] ? countryCode2 : null);
            const countryInfo = countryCode ? countries[countryCode] : {
              name: range ? range.split(" ")[0] : "Unknown",
              flag: "🌍",
            };

            // Create the new format line with Date (use cleanNumber)
            const formattedLine = `OTP Code: ${otp} Number: ${cleanNumber} Country: ${countryInfo.name} ${countryInfo.flag} Service: ${service} Message: ${message} Date: ${date}`;
            const uniqueKey = `${otp}_${cleanNumber}`;
            
            console.log(`Found OTP ${otp} for number ${cleanNumber}, service: ${service}`);

            if (!uniqueRows.has(uniqueKey)) {
              uniqueRows.add(uniqueKey);
              newRows.push(formattedLine);
            }
          }
        });

        if (newRows.length > 0) {
          const timestamp = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
          });
          const dataToPrepend = `--- Data fetched at ${timestamp} ---\n${newRows.join(
            "\n"
          )}\n`;
          let existingData = "";
          try {
            existingData = await fs.readFile(OUTPUT_FILE, "utf8");
          } catch (error) {
            console.log("No existing file, creating new one.");
          }
          const updatedData =
            dataToPrepend + (existingData ? "\n" + existingData : "");
          await fs.writeFile(OUTPUT_FILE, updatedData);
          console.log(
            `Prepended ${newRows.length} new rows to ${OUTPUT_FILE} at ${timestamp}`
          );
        } else {
          console.log("No new data to prepend.");
        }
      } catch (error) {
        console.error(
          `Error during scrape/prepend at ${new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
          })}:`,
          error.message
        );
      }
    };

    await scrapeAndPrependData();
    const scraperInterval = setInterval(async () => {
      await scrapeAndPrependData();
    }, 5000);
  } catch (error) {
    // Don't throw - just log and return, so bot can continue without scraper
    const USE_EXTERNAL_CHROME = process.env.USE_EXTERNAL_CHROME === "true";
    console.log("⚠️ SMS scraper not available:");
    console.log("   " + error.message);
    console.log("\n💡 Bot will continue running, but SMS scraping is disabled.");
    console.log("💡 To enable SMS scraping:");
    
    if (USE_EXTERNAL_CHROME) {
      // VPS mode instructions
      console.log("   (VPS Mode - External Chrome)");
      console.log("   1. Ensure Chrome is running with remote debugging:");
      console.log("      sudo systemctl start chrome-debug");
      console.log("   2. Login manually to Chrome:");
      console.log("      ./login_chrome.sh");
      console.log("      OR navigate to: http://185.2.83.39/ints/agent/SMSCDRStats");
      console.log("   3. Restart the bot");
    } else {
      // Railway/Cloud mode instructions
      console.log("   (Railway/Cloud Mode - Auto-login)");
      console.log("   1. Verify environment variables are set:");
      console.log("      SMS_USERNAME and SMS_PASSWORD");
      console.log("   2. Check if credentials are correct");
      console.log("   3. Verify login page is accessible");
      console.log("   4. Check logs above for detailed error information");
    }
    
    // Return instead of throwing so bot continues
    return;
  }
}

// Start scraper (optional - bot will work without it)
// The scraper function now handles errors gracefully and won't crash the bot
startScraper();

// Track if bot is using webhooks (must be declared before use)
let isUsingWebhook = false;

// Configure webhook or polling
const NGROK_DOMAIN = process.env.NGROK_DOMAIN || "one-mastodon-wondrous.ngrok-free.app";
const USE_WEBHOOK = process.env.USE_WEBHOOK === "true"; // Default to false (polling mode)

// Function to set webhook with retry logic
async function setWebhookWithRetry(webhookUrl, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`✅ Webhook set to: ${webhookUrl}`);
      return true;
    } catch (error) {
      if (error.response && error.response.error_code === 429) {
        // Rate limited - wait and retry
        const retryAfter = error.response.parameters?.retry_after || 2;
        console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds before retry... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else {
        // Other error - throw it
        throw error;
      }
    }
  }
  throw new Error("Failed to set webhook after multiple retries");
}

// Start bot with webhook or polling
if (USE_WEBHOOK) {
  const webhookUrl = `https://${NGROK_DOMAIN}/webhook`;
  console.log(`🔗 Attempting to set webhook: ${webhookUrl}`);
  
  setWebhookWithRetry(webhookUrl)
    .then(() => {
      isUsingWebhook = true;
      console.log("Bot is running with webhooks...");
    })
    .catch((error) => {
      console.error("❌ Error setting webhook:", error.message);
      if (error.message.includes("ERR_NGROK_3200") || error.message.includes("offline")) {
        console.log("\n💡 ngrok is not running! The endpoint is offline.");
        console.log("💡 Solutions:");
        console.log("   1. Start ngrok: ngrok http 8810 --domain=one-mastodon-wondrous.ngrok-free.app");
        console.log("   2. Or use polling mode: USE_WEBHOOK=false npm start");
      }
      console.log("\n🔄 Falling back to polling mode...");
      isUsingWebhook = false;
      bot.launch();
      console.log("✅ Bot is running with polling...");
    });
} else {
  console.log("📡 Starting bot in polling mode (webhooks disabled)...");
  // Delete any existing webhook when using polling
  bot.telegram.deleteWebhook({ drop_pending_updates: false })
    .then(() => {
      console.log("✅ Webhook deleted (if existed)");
      isUsingWebhook = false;
      bot.launch();
      console.log("Bot is running with polling...");
    })
    .catch((error) => {
      console.log("⚠️ Could not delete webhook (may not exist), continuing with polling...");
      isUsingWebhook = false;
      bot.launch();
      console.log("Bot is running with polling...");
    });
}

// Cleanup function to prevent memory leaks
function cleanup() {
  console.log("Cleaning up resources...");

  // Clear all assigned numbers to prevent conflicts on restart
  assignedNumbers = {};

  // Clear any global intervals
  if (global.scraperInterval) {
    clearInterval(global.scraperInterval);
  }

  console.log("Cleanup completed.");
}

// Graceful shutdown
process.once("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  cleanup();
  try {
    // If using webhooks, delete webhook on shutdown
    if (isUsingWebhook) {
      try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: false });
        console.log("✅ Webhook deleted");
      } catch (error) {
        console.log("⚠️ Could not delete webhook:", error.message);
      }
    }
    // Stop the bot (works for both polling and webhooks)
    await bot.stop();
    process.exit(0);
  } catch (error) {
    console.error("Error stopping bot:", error);
    process.exit(1);
  }
});

process.once("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  cleanup();
  try {
    // If using webhooks, delete webhook on shutdown
    if (isUsingWebhook) {
      try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: false });
        console.log("✅ Webhook deleted");
      } catch (error) {
        console.log("⚠️ Could not delete webhook:", error.message);
      }
    }
    // Stop the bot (works for both polling and webhooks)
    await bot.stop();
    process.exit(0);
  } catch (error) {
    console.error("Error stopping bot:", error);
    process.exit(1);
  }
});

// Handle uncaught exceptions to prevent crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Only exit if critical
  if (
    error.message.includes("EADDRINUSE") ||
    error.message.includes("ECONNREFUSED")
  ) {
    cleanup();
    process.exit(1);
  }
});

// Handle unhandled rejections to prevent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Only exit if critical
  if (
    reason.message?.includes("EADDRINUSE") ||
    reason.message?.includes("ECONNREFUSED")
  ) {
    cleanup();
    process.exit(1);
  }
});
