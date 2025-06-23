const { Flight, Route, City, Users, Stops, Tickets, Cars } = require('../models');
const RouteDAO = require('./RouteDAO');
const UsersDAO = require('./UsersDAO');
const { Op } = require('sequelize');

class FlightDAO {
  static async validation(flightData) {
    if (!flightData) throw new Error("Некорректные данные: объект flightData отсутствует.");

    const routeId = Number(flightData.route_id);
    if (isNaN(routeId) || routeId <= 0) throw new Error("Некорректные данные: route_id должно быть положительным числом.");
    flightData.route_id = routeId;

    const driverId = Number(flightData.driver_id);
    if (isNaN(driverId) || driverId <= 0) throw new Error("Некорректные данные: driver_id должно быть положительным числом.");
    flightData.driver_id = driverId;

    const carId = Number(flightData.car_id);
    if (isNaN(carId) || carId <= 0) throw new Error("Некорректные данные: car_id должно быть положительным числом.");
    flightData.car_id = carId;

    const price = Number(flightData.price);
    if (isNaN(price) || price < 0) throw new Error("Некорректные данные: price должно быть неотрицательным числом.");
    flightData.price = price;

    if (typeof flightData.start_time !== 'string' || isNaN(Date.parse(flightData.start_time))) {
      throw new Error("Некорректные данные: start_time должно быть строкой в формате ISO 8601.");
    }

    const isDriver = await UsersDAO.CheckDriverRole(driverId);
    if (!isDriver) throw new Error("Пользователь с указанным driver_id не является водителем.");

    return flightData;
  }

  static async Create(flightData) {
    try {
      console.log(flightData);
      const validData = await FlightDAO.validation(flightData);
      return await Flight.create(validData);
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
      await FlightDAO.validation(flightData);

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


  static async getFullFlightInfo() {
    const flights = await Flight.findAll({
      include: [
        {
          model: Route,
          include: [
            { model: City, as: 'startCity', attributes: ['city_id', 'name'] },
            { model: City, as: 'finishCity', attributes: ['city_id', 'name'] },
          ],
          attributes: ['route_id', 'start_city_id', 'finish_city_id', 'travel_time'],
        },
        {
          model: Users,
          attributes: ['user_id', 'name', 'last_name', 'user_number'],
          where: { role: 'driver' },
        },
        {
          model: Cars,
          attributes: ['car_id', 'capacity'],
        },
        {
          model: Tickets,
          attributes: ['count'],
        },
      ],
      attributes: ['flight_id', 'route_id', 'driver_id', 'car_id', 'price', 'start_time', 'return_flight'],
    });
  
    return flights.map(flight => {
      const ticketCount = flight.Tickets?.reduce((sum, t) => sum + t.count, 0) || 0;
      const capacity = flight.Car?.capacity || 0;
  
      return {
        flight_id: flight.flight_id,
        route_id: flight.route_id,
        driver_id: flight.driver_id,
        car_id: flight.car_id,
        price: flight.price,
        start_time: flight.start_time,
        driver_name: flight.Users?.name,
        driver_last_name: flight.Users?.last_name,
        driver_phone_number: flight.Users?.phone_number,
        start_city_id: flight.Route?.start_city_id,
        start_city_name: flight.Route?.startCity?.name,
        finish_city_id: flight.Route?.finish_city_id,
        finish_city_name: flight.Route?.finishCity?.name,
        travel_time: RouteDAO.formatTime(flight.Route?.travel_time),
        return_flight: flight.return_flight,
        available_seats: capacity - ticketCount,
      };
    });
  }
  
  

  static async getFullFlightInfoById(flightId) {
    const flight = await Flight.findOne({
      where: { flight_id: flightId },
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
          model: Users,
          attributes: ['user_id', 'name', 'last_name', 'user_number'],
          where: { role: 'driver' },
          required: false,
        },
        {
          model: Cars,
          attributes: ['car_id', 'capacity'],
        },
        {
          model: Tickets,
          attributes: ['count'],
          required: false,
        },
      ],
      attributes: ['flight_id', 'route_id', 'driver_id', 'car_id', 'price', 'start_time', 'return_flight']
    });
  
    if (!flight) return null;
  
    const takenSeats = flight.Tickets.reduce((sum, ticket) => sum + ticket.count, 0);
    const capacity = flight.Car?.capacity || 0;
    const freeSeats = capacity - takenSeats;
  
    return {
      flight_id: flight.flight_id,
      route_id: flight.route_id,
      driver_id: flight.driver_id,
      car_id: flight.car_id,
      price: flight.price,
      capacity: freeSeats,
      start_time: flight.start_time,
      driver_name: flight.Users?.name,
      driver_last_name: flight.Users?.last_name,
      driver_phone_number: flight.Users?.user_number,
      start_city_id: flight.Route?.start_city_id,
      start_city_name: flight.Route?.startCity?.name,
      finish_city_id: flight.Route?.finish_city_id,
      finish_city_name: flight.Route?.finishCity?.name,
      travel_time: flight.Route?.travel_time,
      return_flight: flight.return_flight,
    };
  }

  static async findAvailable({ date, fromCity, toCity, seatsRequired }) {
    try {
      const whereClause = {};
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        console.log('Поиск рейсов с start_time между:', start, 'и', end);

        whereClause.start_time = {
          [Op.between]: [start, end],
        };
      } else {
        console.log('Дата не указана, поиск без фильтра по дате');
      }

      console.log('Ищем рейсы с городов ID:', fromCity, '->', toCity, 'Требуемые места:', seatsRequired);

      const flights = await Flight.findAll({
        where: whereClause,
        include: [
          { model: Cars, required: true },
          {
            model: Route,
            required: true,
            include: [
              { model: City, as: 'startCity', attributes: ['city_id', 'name'] },
              { model: City, as: 'finishCity', attributes: ['city_id', 'name'] },
            ],
          },
          { model: Tickets, attributes: ['count'], required: false },
          { model: Users, required: false },
        ],
      });

      console.log('Найдено рейсов:', flights.length);

      const availableFlights = [];

      for (const flight of flights) {
        const isReturn = flight.return_flight;

        const from = isReturn ? flight.Route.finishCity?.city_id : flight.Route.startCity?.city_id;
        const to = isReturn ? flight.Route.startCity?.city_id : flight.Route.finishCity?.city_id;

        console.log(`Проверка рейса ID ${flight.id}: из города ${from} в город ${to}`);

        if (from !== fromCity || to !== toCity) {
          console.log('ID города не совпадает, пропуск...');
          continue;
        }

        const takenSeats = flight.Tickets.reduce((sum, ticket) => sum + ticket.count, 0);
        const capacity = flight.Car?.capacity || 0;
        const freeSeats = capacity - takenSeats;

        console.log(`Свободных мест: ${freeSeats}, требуется: ${seatsRequired}`);

        if (freeSeats >= seatsRequired) {
          availableFlights.push(flight);
          console.log('Рейс добавлен в результат');
        } else {
          console.log('Мест не хватает, пропуск...');
        }
      }

      console.log('Итоговое количество доступных рейсов:', availableFlights.length);

      return availableFlights;
    } catch (err) {
      console.error('Ошибка при поиске доступных рейсов:', err);
      throw err;
    }
  }
  // В TicketsDAO или FlightDAO (где хранится работа с рейсами)
  static async getFlightsByDriverId(driverId) {
    const flights = await Flight.findAll({
      where: { driver_id: driverId },
      include: [
        {
          model: Route,
          attributes: ['start_city_id', 'finish_city_id', 'travel_time'],
          include: [
            { model: City, as: 'startCity', attributes: ['name'] },
            { model: City, as: 'finishCity', attributes: ['name'] }
          ]
        },
        {
          model: Cars,
          attributes: ['car_brand', 'car_number', 'capacity']
        }
      ],
      attributes: ['flight_id', 'start_time', 'return_flight']
    });
  
    return flights.map(flight => ({
      flight_id: flight.flight_id,
      start_time: flight.start_time,
      travel_time: flight.Route?.travel_time || 0, 
      return_flight: flight.return_flight,
      route_startCity: flight.Route?.startCity?.name || 'Неизвестно',
      route_finishCity: flight.Route?.finishCity?.name || 'Неизвестно',
      car_brand: flight.Car?.car_brand || '',
      car_number: flight.Car?.car_number || '',
      car_capacity: flight.Car?.capacity || 0,
    }));
  }
  

}

module.exports = FlightDAO;
