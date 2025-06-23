const { Sequelize } = require('sequelize');
const sequelize = require('../../config/database');
const setupAssociations = require('./associations');

const City = require('./City');
const Route = require('./Route');
const Cars = require('./Cars');
const Flight = require('./Flight');
const Stops = require('./Stops');
const Users = require('./Users');
const Tickets = require('./Tickets');

// Инициализация связей
setupAssociations();

module.exports = {
  sequelize,
  City,
  Route,
  Cars,
  Flight,
  Stops,
  Users,
  Tickets
};
