const City = require('./City');
const Route = require('./Route');
const Driver = require('./Driver');
const Cars = require('./Cars');
const Flight = require('./Flight');
const Stops = require('./Stops');
const Users = require('./Users');
const Tickets = require('./Tickets');

function setupAssociations() {
  // City
  City.hasMany(Route, { foreignKey: 'start_city_id', as: 'startRoutes' });
  City.hasMany(Route, { foreignKey: 'finish_city_id', as: 'finishRoutes' });
  City.hasMany(Stops, { foreignKey: 'city_id'});

  // Route
  Route.belongsTo(City, { foreignKey: 'start_city_id', as: 'startCity' });
  Route.belongsTo(City, { foreignKey: 'finish_city_id', as: 'finishCity' });
  Route.hasMany(Flight, { foreignKey: 'route_id', onDelete: 'CASCADE' });

  // Driver
  Driver.hasMany(Flight, { foreignKey: 'driver_id' });
  Flight.belongsTo(Driver, { foreignKey: 'driver_id' });

  // Cars
  Cars.hasMany(Flight, { foreignKey: 'car_id' });
  Flight.belongsTo(Cars, { foreignKey: 'car_id' });

  // Flight
  Flight.belongsTo(Route, { foreignKey: 'route_id' });
  Flight.hasMany(Tickets, { foreignKey: 'flight_id' });

  // Stops
  Stops.hasMany(Tickets, { foreignKey: 'stop_id' });
  Stops.belongsTo(City, { foreignKey: 'city_id' });

  // Users
  Users.hasMany(Tickets, { foreignKey: 'user_id', onDelete: 'CASCADE'  });
  Tickets.belongsTo(Users, { foreignKey: 'user_id' });

  // Tickets
  Tickets.belongsTo(Flight, { foreignKey: 'flight_id' });
  Tickets.belongsTo(Stops, { foreignKey: 'stop_id' });
}

module.exports = setupAssociations;
