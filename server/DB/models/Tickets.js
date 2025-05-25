const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Users = require('./Users');
const Flight = require('./Flight');
const Stops = require('./Stops');

const Tickets = sequelize.define('Tickets', {
  ticket_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'TICKET_ID',
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Users,
      key: 'user_id',
    },
    field: 'USER_ID',
  },
  flight_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Flight,
      key: 'flight_id',
    },
    field: 'FLIGHT_ID',
  },
  stop_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Stops,
      key: 'stop_id',
    },
    field: 'STOP_ID',
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
    field: 'COUNT',
  },
}, {
  tableName: 'TICKETS',
  timestamps: false,
});


module.exports = Tickets;
