const redis = require('../redis'); // методы очереди
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: false });

async function processNotificationQueue() {
  while (true) {
    try {
      const item = await redis.dequeueNotification();
      if (!item) {
        await new Promise(res => setTimeout(res, 2000));
        continue;
      }

      const [telegramId, message] = item.split('|');
      if (telegramId && message) {
        await bot.sendMessage(telegramId, message);
        console.log(`Уведомление отправлено ${telegramId}: ${message}`);
      }
    } catch (err) {
      console.error('Ошибка обработки очереди уведомлений:', err);
    }
  }
}

module.exports = processNotificationQueue;

