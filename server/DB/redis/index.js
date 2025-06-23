const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

module.exports = {
  redis,  // экспорт клиента

  // Сохраняет список telegram_id в Redis под ключом 'telegram_ids'
  async saveTelegramIds(ids) {
    if (!Array.isArray(ids)) {
      throw new Error('ids должен быть массивом');
    }
    return await redis.set('telegram_ids', JSON.stringify(ids));
  },

  // Получает список telegram_id из Redis, возвращает массив
  async getTelegramIds() {
    const data = await redis.get('telegram_ids');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  // Устанавливает значение с истечением времени (сек)
  async setWithExpire(key, value, expireSeconds) {
    return await redis.set(key, value, 'EX', expireSeconds);
  },
  async enqueueNotification(telegramId, message) {
    await redis.rpush('notification_queue', `${telegramId}|${message}`);
  },

  async saveTelegramId(userId, telegramId) {
    return await redis.set(`tgid:${telegramId}`, userId);
  },

  // Получает значение по ключу
  async get(key) {
    return await redis.get(key);
  },

  // Удаляет ключ
  async del(key) {
    return await redis.del(key);
  },

  // Получает список ключей по шаблону
  async keys(pattern) {
    return await redis.keys(pattern);
  }
};
