# Использовать официальный Node.js образ
FROM node:18-alpine

# Установить рабочую директорию в контейнере
WORKDIR /app

# Копировать package.json и package-lock.json
COPY package*.json ./

# Установить зависимости
RUN npm install

# Копировать весь проект в контейнер
COPY . .

# Запустить приложение (например, app.js или tgbot.js)
CMD ["node", "tgbot.js"]
