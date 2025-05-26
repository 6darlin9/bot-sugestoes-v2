// ===== logger.js =====
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'bot.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

const logger = {
  info: (msg) => {
    console.log(`ℹ️ [INFO]: ${msg}`);
    logToFile(`INFO: ${msg}`);
  },
  error: (msg) => {
    console.error(`❌ [ERROR]: ${msg}`);
    logToFile(`ERROR: ${msg}`);
  },
  warn: (msg) => {
    console.warn(`⚠️ [WARN]: ${msg}`);
    logToFile(`WARN: ${msg}`);
  }
};

module.exports = logger;