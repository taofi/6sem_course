const { Tickets } = require('../models'); // Импортируем Tickets из index.js

class TicketsDAO {
  static validation(ticketData)
  {
    if (!ticketData) {
      throw new Error("Данные отсутствуют.");
  }

  // Преобразуем user_id в число и проверяем его
  ticketData.user_id = Number(ticketData.user_id);
  if (isNaN(ticketData.user_id) || ticketData.user_id <= 0) {
      throw new Error("Некорректные данные: user_id должно быть положительным числом.");
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

  static async Create(ticketData) {
    try {  
        return await Tickets.create(TicketsDAO.validation(ticketData));
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
      if (ticket) {
        ticket.user_id = ticketData.user_id;
        ticket.flight_id = ticketData.flight_id;
        ticket.stop_id = ticketData.stop_id;
        ticket.count = ticketData.count;
        return await ticket.save();
      }
      return null;
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
}

module.exports = TicketsDAO;
