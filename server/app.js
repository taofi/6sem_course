require('dotenv').config();
const express = require('express');
const { initializeExpress } = require('./config/express');
const routes = require('./routes');
const monitorCodes = require('./queue/codeWatcher')

const app = express();

// Инициализация Express
initializeExpress(app);

// Подключение маршрутов
app.use('/', routes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', {
    title: 'Ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

monitorCodes();