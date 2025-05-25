const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Driver = sequelize.define('Driver', {
  driver_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'DRIVER_ID',
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'NAME',
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'LAST_NAME',
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'PHONE_NUMBER',
  },
}, {
  tableName: 'DRIVER',
  timestamps: false,
});

module.exports = Driver;
