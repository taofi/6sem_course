const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Route = require('./Route');
const Driver = require('./Driver');
const Cars = require('./Cars');

const Flight = sequelize.define('Flight', {
  flight_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'FLIGHT_ID',
  },
  route_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Route,
      key: 'route_id',
    },
    field: 'ROUTE_ID',
  },
  driver_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Driver,
      key: 'driver_id',
    },
    field: 'DRIVER_ID',
  },
  car_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Cars,
      key: 'car_id',
    },
    field: 'CAR_ID',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'PRICE',
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'START_TIME',
  },
  return_flight: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'RETURN_FLIGHT',
  },
}, {
  tableName: 'FLIGHT',
  timestamps: false,
});


module.exports = Flight;
