const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const City = require('./City');

const Stops = sequelize.define('Stops', {
  stop_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'STOP_ID',
  },
  city_id: {
    type: DataTypes.INTEGER,
    references: {
      model: City,
      key: 'city_id',
    },
    field: 'CITY_ID',
  },
  time: {
    type: DataTypes.STRING(8),  // Хранение в формате 'HH:MI:SS'
    allowNull: false,
    field: 'TIME',
    validate: {
      is: /^\d{2}:\d{2}:\d{2}$/,  // Проверка формата времени
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'NAME',
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'ADDRESS',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    field: 'LATITUDE',
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    field: 'LONGITUDE',
  },
}, {
  tableName: 'STOPS',
  timestamps: false,
});

// Экспортируем модель
module.exports = Stops;
