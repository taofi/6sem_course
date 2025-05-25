const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const City = require('./City');

const Route = sequelize.define('Route', {
  route_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ROUTE_ID',
  },
  start_city_id: {
    type: DataTypes.INTEGER,
    references: {
      model: City,
      key: 'city_id',
    },
    field: 'START_CITY_ID',
  },
  finish_city_id: {
    type: DataTypes.INTEGER,
    references: {
      model: City,
      key: 'city_id',
    },
    field: 'FINISH_CITY_ID',
  },
  travel_time: {
    type: DataTypes.STRING, // В Sequelize нет INTERVAL, храним как строку
    allowNull: false,
    field: 'TRAVEL_TIME',
  },
}, {
  tableName: 'ROUTE',
  timestamps: false,
});

module.exports = Route;
