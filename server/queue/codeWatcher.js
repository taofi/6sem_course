const redis = require('../DB/redis');
const codeStore = require('../DB/codeStore');
const { UsersDAO } = require('../DB/dao');

async function monitorCodes() {
  console.log('Начал прослушивание...');

  let active = true;

  while (active) {
    try {
      const keys = await redis.keys('code:*');

      for (const key of keys) {

        const telegramId = key.split(':')[1];
        const code = await redis.get(key);

        if (code) {
          const userId = codeStore.findUserIdByCode(code);

          if (userId) {
            console.log(`Найден пользователь с telegram_id=${telegramId}, код: ${code}`);
            try {
              await UsersDAO.SetTelegramId(userId, telegramId);

              // Сохраняем telegram_id по userId
              await redis.saveTelegramId(userId, telegramId);

              // Уведомляем пользователя
              await redis.enqueueNotification(telegramId, 'Вы успешно подключили Telegram к вашему профилю!');
            } catch (err) {
              console.error('Ошибка подключения телеграм id:', err);
              await redis.enqueueNotification(telegramId, `Ошибка подключения телеграм id: ${err.message}`);
            }
          } else {
            console.log(`Пользователь с telegram_id=${telegramId} не найден`);
          }

          await redis.del(key); // удаляем ключ из Redis
        }
      }

      await new Promise(res => setTimeout(res, 2000));
    } catch (err) {
      console.error('Ошибка в обработке кодов Redis:', err);
      active = false;
    }
  }

  console.log('Мониторинг остановлен из-за ошибки');
}

module.exports = monitorCodes;
