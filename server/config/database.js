const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: {
      connectString: process.env.DB_CONNECT_STRING,
    },
    logging: console.log,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Соединение с Oracle установлено успешно.');

  } catch (error) {
    console.error('Ошибка подключения к базе данных или синхронизации:', error);
  }
})();


module.exports = sequelize;
