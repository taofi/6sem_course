const { Tickets, Stops, Flight, Route, City, Users, Cars } = require('../models'); 

class TicketsDAO {
  static async validation(ticketData) {
    if (!ticketData) {
      throw new Error("Данные отсутствуют.");
    }
  
    // Преобразуем user_id в число и проверяем его
    ticketData.user_id = Number(ticketData.user_id);
    if (isNaN(ticketData.user_id) || ticketData.user_id <= 0) {
      throw new Error("Некорректные данные: user_id должно быть положительным числом.");
    }
  
    // Проверка, что пользователь существует в базе
    const user = await Users.findByPk(ticketData.user_id);
    if (!user) {
      throw new Error("Пользователь с таким ID не найден.");
    }
  
    // Преобразуем flight_id в число и проверяем его
    ticketData.flight_id = Number(ticketData.flight_id);
    if (isNaN(ticketData.flight_id) || ticketData.flight_id <= 0) {
      throw new Error("Некорректные данные: flight_id должно быть положительным числом.");
    }
  
    // Преобразуем stop_id в число и проверяем его
    ticketData.stop_id = Number(ticketData.stop_id);
    if (isNaN(ticketData.stop_id) || ticketData.stop_id <= 0) {
      throw new Error("Некорректные данные: stop_id должно быть положительным числом.");
    }
  
    // Преобразуем count в число и проверяем его
    ticketData.count = Number(ticketData.count);
    if (isNaN(ticketData.count) || ticketData.count <= 0) {
      throw new Error("Некорректные данные: count должно быть положительным числом и больше нуля.");
    }
  
    return ticketData;
  }
  

  static getAdjustedTime(startTime, stopTime = {}) {
    const date = new Date(startTime);
    date.setDate(date.getDate() + (stopTime.days || 0));
    date.setHours(date.getHours() + (stopTime.hours || 0));
    date.setMinutes(date.getMinutes() + (stopTime.minutes || 0));
    date.setSeconds(date.getSeconds() + (stopTime.seconds || 0));
  
    return date.toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  

  static async Create(ticketData) {
    try {
      TicketsDAO.validation(ticketData);
      console.log(ticketData.flight_id);
      // Получаем рейс и связанные билеты
      const flight = await Flight.findByPk(ticketData.flight_id, {
        include: [{ model: Tickets }, { model: Cars }],
      });
  
      if (!flight) {
        throw new Error("Рейс не найден.");
      }
  
      const totalSold = flight.Tickets.reduce((sum, t) => sum + t.count, 0);
      const available = flight.Car.capacity - totalSold;
  
      if (ticketData.count > available) {
        throw new Error(`Недостаточно мест. Доступно: ${available}`);
      }
  
      return await Tickets.create(ticketData);
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }
  

  static async GetById(ticketId) {
    try {
      return await Tickets.findByPk(ticketId);
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      throw error;
    }
  }

  static async Update(ticketData) {
    try {
      const ticketId = Number(ticketData.ticket_id);
      if (isNaN(ticketId)) {
        throw new Error("ticket_id должно быть числом");
      }
  
      TicketsDAO.validation(ticketData);
  
      const ticket = await Tickets.findByPk(ticketId);
      if (!ticket) {
        throw new Error("Билет не найден");
      }
  
      const flight = await Flight.findByPk(ticketData.flight_id, {
        include: [{ model: Tickets }, { model: require('../models').Cars }]
      });
  
      if (!flight) {
        throw new Error("Рейс не найден.");
      }
  
      const totalSold = flight.Tickets
        .filter(t => t.ticket_id !== ticketId)
        .reduce((sum, t) => sum + t.count, 0);
      const available = flight.Car.capacity - totalSold;
  
      if (ticketData.count > available) {
        throw new Error(`Недостаточно мест. Доступно: ${available}`);
      }
  
      ticket.user_id = ticketData.user_id;
      ticket.flight_id = ticketData.flight_id;
      ticket.stop_id = ticketData.stop_id;
      ticket.count = ticketData.count;
  
      return await ticket.save();
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }
  

  static async Delete(ticketId) {
    try {
      const ticket = await Tickets.findByPk(ticketId);
      if (ticket) {
        await ticket.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Tickets.findAll();
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw error;
    }
  }

  static async GetByUserIdWithDetails(userId) {
    try {
      const tickets = await Tickets.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Flight,
            include: [
              {
                model: Route,
                include: [
                  { model: City, as: 'startCity' },
                  { model: City, as: 'finishCity' },
                ]
              }
            ]
          },
          {
            model: Stops,
            include: [
              { model: City }
            ]
          }
        ]
      });

      return tickets.map(ticket => {
        const flight = ticket.Flight;
        const route = flight?.Route;
        const isReturn = flight?.return_flight === true;
        const startCity = route?.startCity?.name || 'Неизвестно';
        const finishCity = route?.finishCity?.name || 'Неизвестно';
        const stopTime = ticket.Stop?.time ||'Неизвестно';

        return {
          ticket_id: ticket.ticket_id,
          count: ticket.count,
          stop_name: ticket.Stop?.City?.name || 'Неизвестно',
          start_city: isReturn ? finishCity : startCity,
          finish_city: isReturn ? startCity : finishCity,
          start_time: flight?.start_time,
          travel_time: route?.travel_time || 'Неизвестно',
          price: flight?.price || 'Неизвестно',
          stopTime,
        };
      });

    } catch (error) {
      console.error('Error getting tickets with details:', error);
      throw error;
    }
  }
  static async GetTicketInfoById(ticketId) {
    try {
      const ticket = await Tickets.findByPk(ticketId, {
        include: [
          {
            model: Flight,
            include: [
              {
                model: Route,
                include: [
                  { model: City, as: 'startCity' },
                  { model: City, as: 'finishCity' }
                ]
              }
            ]
          },
          {
            model: Stops,
            include: [{ model: City }]
          }
        ]
      });
  
      if (!ticket) {
        throw new Error('Билет не найден');
      }
  
      const flight = ticket.Flight;
      const route = flight?.Route;
      const stop = ticket.Stop;
      const startCity = route?.startCity?.name || 'Неизвестно';
      const finishCity = route?.finishCity?.name || 'Неизвестно';
      const startTime = flight?.start_time ? flight.start_time.toLocaleString() : 'Неизвестно';
      const stopTime = stop?.time ? stop.time.toLocaleString() : 'Неизвестно';
      const startCityId = route?.start_city_id || null;
  
      return {
        ticket_id: ticket.ticket_id,
        user_id: ticket.user_id,
        flight_id: ticket.flight_id,
        stop_id: ticket.stop_id,
        count: ticket.count,
        startCity,
        finishCity,
        startTime,
        stopTime,
        price: flight?.price || 'Неизвестно',
        stop_name: stop?.name || 'Неизвестно',
        stop_address: stop?.address || 'Неизвестно',
        start_city_id: startCityId
      };
    } catch (error) {
      console.error('Error getting ticket info:', error);
      throw error;
    }
  }
  
  static async GetTicketsByFlightId(flightId) {
    try {
      const tickets = await Tickets.findAll({
        where: { flight_id: flightId },
        include: [
          {
            model: Flight,
            include: [
              {
                model: Route,
                include: [
                  { model: City, as: 'startCity' },
                  { model: City, as: 'finishCity' }
                ]
              }
            ]
          },
          {
            model: Stops,
            include: [{ model: City }]
          },
          {
            model: Users,
            attributes: ['name', 'last_name']
          }
        ]
      });
  
      return tickets.map(ticket => {
        const flight = ticket.Flight;
        const route = flight?.Route;
        const stop = ticket.Stop;
        const user = ticket.User;
  
        const startCity = route?.startCity?.name || 'Неизвестно';
        const finishCity = route?.finishCity?.name || 'Неизвестно';
        const startTime = flight?.start_time ? flight.start_time.toLocaleString() : 'Неизвестно';
        const stopTime = stop?.time ? stop.time.toLocaleString() : 'Неизвестно';
        const startCityId = route?.start_city_id || null;
  
        return {
          ticket_id: ticket.ticket_id,
          user_id: ticket.user_id,
          user_name: user ? `${user.name} ${user.last_name}` : 'Неизвестно',
          flight_id: ticket.flight_id,
          stop_id: ticket.stop_id,
          count: ticket.count,
          startCity,
          finishCity,
          startTime,
          stopTime,
          price: flight?.price || 'Неизвестно',
          stop_name: stop?.name || 'Неизвестно',
          stop_address: stop?.address || 'Неизвестно',
          start_city_id: startCityId
        };
      });
    } catch (error) {
      console.error('Error getting tickets info by flight ID:', error);
      throw error;
    }
  }
  
  
  
}

module.exports = TicketsDAO;
