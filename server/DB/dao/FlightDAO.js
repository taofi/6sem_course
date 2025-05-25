const { Flight, Route, City, Driver, Stops, Tickets, Cars } = require('../models');
const RouteDAO = require('./RouteDAO');

class FlightDAO {
  static validation(flightData)
  {
    if (!flightData) {
      throw new Error("Некорректные данные: объект flightData отсутствует.");
  }

  // Преобразование и проверка route_id
  const routeId = Number(flightData.route_id);
  if (isNaN(routeId) || routeId <= 0) {
      throw new Error("Некорректные данные: route_id должно быть положительным числом.");
  }
  flightData.route_id = routeId;
  // Преобразование и проверка driver_id
  const driverId = Number(flightData.driver_id);
  if (isNaN(driverId) || driverId <= 0) {
      throw new Error("Некорректные данные: driver_id должно быть положительным числом.");
  }
  flightData.driver_id = driverId;

  // Преобразование и проверка car_id
  const carId = Number(flightData.car_id);
  if (isNaN(carId) || carId <= 0) {
      throw new Error("Некорректные данные: car_id должно быть положительным числом.");
  }
  flightData.car_id = carId;

  // Преобразование и проверка price
  const price = Number(flightData.price);
  if (isNaN(price) || price < 0) {
      throw new Error("Некорректные данные: price должно быть неотрицательным числом.");
  }
  flightData.price = price;

  // Проверка формата start_time (дата и время)
  if (typeof flightData.start_time !== 'string' || isNaN(Date.parse(flightData.start_time))) {
      throw new Error("Некорректные данные: start_time должно быть строкой в формате ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).");
  }
    return flightData;
  }

  static async Create(flightData) {
    try {
      console.log(flightData);

      return await Flight.create(FlightDAO.validation(flightData));
    } catch (error) {
      console.error('Error creating flight:', error);
      throw error;
    }
  }
  

  static async GetById(flightId) {
    try {
      return await Flight.findByPk(flightId);
    } catch (error) {
      console.error('Error getting flight by ID:', error);
      throw error;
    }
  }

  static async Update(flightData) {
    try {
      
      const flightId = Number(flightData.flight_id);
      if (isNaN(flightId)) {
        throw new Error("flight_id должно быть числом");
      }
      FlightDAO.validation(flightData);

      const flight = await Flight.findByPk(flightId);
      if (flight) {
        flight.route_id = flightData.route_id;
        flight.driver_id = flightData.driver_id;
        flight.car_id = flightData.car_id;
        flight.price = flightData.price;
        flight.start_time = flightData.start_time;
        return await flight.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating flight:', error);
      throw error;
    }
  }

  static async Delete(flightId) {
    try {
      const flight = await Flight.findByPk(flightId);
      if (flight) {
        await flight.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Flight.findAll();
    } catch (error) {
      console.error('Error getting all flights:', error);
      throw error;
    }
  }

  static async getAvailableFlights({ startCity, finishCity, countTickets, date }) {
    try {
      const startCityRecord = await City.findOne({ where: { name: startCity } });
      const finishCityRecord = await City.findOne({ where: { name: finishCity } });
  
      if (!startCityRecord || !finishCityRecord) {
        throw new Error('Один из городов не найден.');
      }
  
      // Ищем маршруты с нужными городами
      const routes = await Route.findAll({
        where: {
          start_city_id: startCityRecord.city_id,
          finish_city_id: finishCityRecord.city_id,
        },
      });
  
      if (!routes.length) {
        throw new Error('Маршрут не найден.');
      }
  
      const routeIds = routes.map(route => route.route_id);
  
      const flights = await Flight.findAll({
        where: {
          route_id: routeIds,
          start_time: {
            [Op.gte]: date || new Date(),
          },
        },
        include: [
          {
            model: Route,
            include: [
              { model: City, as: 'startCity', attributes: ['name'] },
              { model: City, as: 'finishCity', attributes: ['name'] },
            ],
          },
          {
            model: Cars,
            where: {
              capacity: {
                [Op.gte]: countTickets,
              },
            },
            required: true,
          },
          {
            model: Driver,
            attributes: ['name', 'last_name', 'phone_number'],
          },
        ],
      });
  
      return flights.map(flight => ({
        flight_id: flight.flight_id,
        price: flight.price,
        start_time: flight.start_time,
        travel_time: flight.Route?.travel_time,
        car_capacity: flight.Car?.capacity,
        start_city: flight.Route?.startCity?.name,
        finish_city: flight.Route?.finishCity?.name,
        driver_name: flight.Driver?.name,
        driver_last_name: flight.Driver?.last_name,
        driver_phone: flight.Driver?.phone_number,
      }));
    } catch (error) {
      console.error('Ошибка при получении рейсов:', error);
      throw error;
    }
  }
  
  static async getFullFlightInfo() {
    const flights = await Flight.findAll({
      include: [
        {
          model: Route,
          include: [
            {
              model: City,
              as: 'startCity',
              attributes: ['city_id', 'name'],
            },
            {
              model: City,
              as: 'finishCity',
              attributes: ['city_id', 'name'],
            },
          ],
          attributes: ['route_id', 'start_city_id', 'finish_city_id', 'travel_time'],
        },
        {
          model: Driver,
          attributes: ['driver_id', 'name', 'last_name', 'phone_number'],
        },
        {
          model: Cars,
          attributes: ['car_id'], // если нужно больше полей от машины — добавь
        },
      ],
      attributes: ['flight_id', 'route_id', 'driver_id', 'car_id', 'price', 'start_time'],
    });
  
    return flights.map(flight => ({
      flight_id: flight.flight_id,
      route_id: flight.route_id,
      driver_id: flight.driver_id,
      car_id: flight.car_id,
      price: flight.price,
      start_time: flight.start_time,
      driver_name: flight.Driver?.name,
      driver_last_name: flight.Driver?.last_name,
      driver_phone_number: flight.Driver?.phone_number,
      start_city_id: flight.Route?.start_city_id,
      start_city_name: flight.Route?.startCity?.name,
      finish_city_id: flight.Route?.finish_city_id,
      finish_city_name: flight.Route?.finishCity?.name,
      travel_time: RouteDAO.formatTime(flight.Route?.travel_time),
    }));
  }
  
}

module.exports = FlightDAO;
