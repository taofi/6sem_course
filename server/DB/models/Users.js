const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Users = sequelize.define('Users', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'USER_ID',
  },
  login: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'LOGIN',
  },
  pass: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'PASS',
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'ROLE',
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
  user_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'USER_NUMBER',
  },
  telegram_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: 'TELEGRAM_ID',
  }
}, {
  tableName: 'USERS',
  timestamps: false,
});

module.exports = Users;
