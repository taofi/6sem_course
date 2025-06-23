const redis = require('../DB/redis');
const { UsersDAO } = require('../DB/dao');

async function notifyUserById(userId, message) {
  try {
    const telegramId = await UsersDAO.GetTelegramIdByUserId(userId);
    if (!telegramId) {
      console.warn(`Telegram ID не найден для user_id: ${userId}`);
      return;
    }

    await redis.enqueueNotification(telegramId, message);
    console.log(`Уведомление добавлено в очередь для telegram_id=${telegramId}`);
  } catch (err) {
    console.error(`Ошибка при отправке уведомления для user_id=${userId}:`, err);
  }
}

module.exports = {
  notifyUserById,
};
