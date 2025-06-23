const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

module.exports = {
  redis,

  async saveTelegramIds(ids) {
    if (!Array.isArray(ids)) {
      throw new Error('ids должен быть массивом');
    }
    return await redis.set('telegram_ids', JSON.stringify(ids));
  },

 
  async setWithExpire(key, value, expireSeconds) {
    return await redis.set(key, value, 'EX', expireSeconds);
  },

  async get(key) {
    return await redis.get(key);
  },

  async del(key) {
    return await redis.del(key);
  },

  async getTelegramIds() {
    const map = await redis.hgetall('telegram_id_map');
    return Object.values(map);
  },
  
  async getAllTelegramIds() {
    return await redis.hgetall('telegram_id_map');
  },
  
  async enqueueNotification(telegramId, message) {
    await redis.rpush('notification_queue', `${telegramId}|${message}`);
  },

  async dequeueNotification() {
    return await redis.lpop('notification_queue');
  },

  async saveCode(chatId, code) {
    await redis.set(`code:${chatId}`, code);
  }
};
