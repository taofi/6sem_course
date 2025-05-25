const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Cars = sequelize.define('Cars', {
  car_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'CARS_ID',
  },
  car_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'CAR_NUMBER',
  },
  car_brand: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'CAR_BRAND',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'CAPACITY',
  },
}, {
  tableName: 'CARS',
  timestamps: false,
});

module.exports = Cars;
