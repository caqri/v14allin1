const { WebhookClient } = require('discord.js');
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../Database/botLog.json');
const failedWebhooks = new Set();
const lastMessages = new Map(); 
let alreadyHooked = false;    

function getWebhookEntries() {
  if (!fs.existsSync(jsonPath)) return [];

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const seen = new Set();
    const unique = [];

    for (const entry of Object.values(data)) {
      const url = entry.webhookURL;
      if (url && !failedWebhooks.has(url) && !seen.has(url)) {
        seen.add(url);
        unique.push(entry);
      }
    }

    return unique;
  } catch {
    return [];
  }
}

function formatTimestamp() {
  const unix = Math.floor(Date.now() / 1000);
  return `<t:${unix}:F>`;
}

function formatTimestamparvis() {
  const unix = Math.floor(Date.now() / 1000);
  return `<t:${unix}:R>`;
}

function sendToDiscordLog(message, type = 'log') {
  if (!message) return;

  const now = Date.now();
  const key = `${type}:${message}`;
  const last = lastMessages.get(key);
  if (last && now - last < 1000) return;
  lastMessages.set(key, now);

  const emoji = {
    log: '<:log_arviis:1373748867912433813>',
    warn: '<@216222397349625857> - <a:glitch_warning_arviis:1373749071168143420>',
    error: '<@216222397349625857> - <:network_error_arviis:1373750062617727086>',
    debug: '<a:cat_rainbow_glitch_arviis:1373750525136207912>',
  }[type] || '<a:gummy_dragon_microphone_arviis:1373751892362002563>';

  const chunks = message.match(/[\s\S]{1,1900}/g);
  const entries = getWebhookEntries();
  const timestamp = formatTimestamp();
  const timestamparvis = formatTimestamparvis();

  for (const entry of entries) {
    const webhook = new WebhookClient({ url: entry.webhookURL });
    const username = entry.username || 'Bot Log';
    const avatarURL = entry.avatarURL || 'https://cdn.discordapp.com/embed/avatars/0.png';

    chunks.forEach((chunk, index) => {
      webhook.send({
        content: `## ${emoji} ${type.toUpperCase()} ${index > 0 ? `( ${index + 1}. Parça )` : ''} \n${timestamp} **(** ${timestamparvis} **)** \n\`\`\`ansi\n${chunk}\n\`\`\``,
        username,
        avatarURL
      }).catch(() => {
        failedWebhooks.add(entry.webhookURL);
        console.warn(`[WEBHOOK - HATA] Geçersiz Webhook: ${entry.webhookURL}`);
      });
    });
  }
}

function hookConsole() {
  if (alreadyHooked) return;
  alreadyHooked = true;

  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  for (const type of Object.keys(original)) {
    console[type] = (...args) => {
      const msg = args.map(a =>
        typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' ');

      original[type](...args);
      sendToDiscordLog(msg, type);
    };
  }

  process.on('unhandledRejection', (reason) => {
    const msg = `🔴 Unhandled Promise Rejection: \n${reason?.stack || reason}`;
    console.error(msg);
  });

  process.on('uncaughtException', (err) => {
    const msg = `🛑 Uncaught Exception: \n${err?.stack || err}`;
    console.error(msg);
  });

  process.on('warning', (warning) => {
    const msg = `<a:glitch_warning_arviis:1373749071168143420> Node Warning:\n${warning?.stack || warning}`;
    console.warn(msg);
  });
}

module.exports = { hookConsole };
