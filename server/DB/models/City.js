const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const City = sequelize.define('City', {
  city_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'CITY_ID',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'NAME',
  },
}, {
  tableName: 'CITY',
  timestamps: false,
});

module.exports = City;
