const TelegramBot = require('node-telegram-bot-api');
const redis = require('./redis');
const processNotificationQueue = require('./services/notificationQueueProcessor')
const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });


// Тестовая команда
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const existing = await redis.get(`tgid:${chatId}`);
    if (existing) {
      await bot.sendMessage(chatId, 'Вы успешно подключили уведомления!');
    } else {
      await bot.sendMessage(chatId, 'Вы ещё не подключили уведомления. Введите код уведомления — его можно получить в вашем профиле, нажав на кнопку "Получить код.');
    }
  } catch (err) {
    console.error('Ошибка при обработке сообщения:', err);
  }
});




bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) {
      await bot.sendMessage(chatId, 'Я понимаю только текстовые сообщения. Пожалуйста, отправьте текст.');
      return;
    }

    const existing = await redis.get(`tgid:${chatId}`);
    if (existing) {
      await bot.sendMessage(chatId, 'Вы уже подключили уведомления.');
      return;
    }

    if (text.length !== 6) {
      await bot.sendMessage(chatId, 'Код должен быть ровно 6 символов.');
      return;
    }

    // Сохраняем код в Redis, ключ format: code:telegramId
    await redis.saveCode(chatId, text);
    await bot.sendMessage(chatId, 'Код сохранён и ожидает обработки.');

  } catch (err) {
    console.error('Ошибка при обработке сообщения:', err);
  }
});

processNotificationQueue();

module.exports = bot;
