const { FlightDAO, StopsDAO, TicketsDAO } = require('../DB/dao');
const { notifyUserById } = require('../services/notifyUser');


async function orderTicketPage(req, res) {
  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).send('Некорректный ID рейса');
    }

    const flight = await FlightDAO.getFullFlightInfoById(flightId);
    if (!flight) {
      return res.status(404).send('Рейс не найден');
    }

    // Получаем остановки по городу отправления
    const stops = await StopsDAO.GetByCityId(flight.start_city_id);

    res.render('pages/orderTicket', {
      title: 'Оформление билета',
      flight,
      stops,
      styles: ['styles', 'custom-select'],
      scripts: ['orderTicket', 'custom-select']
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы оформления билета:', error);
    res.status(500).send('Ошибка сервера');
  }
}

async function ticketConfirmationPage(req, res) {
  try {
    const ticket_id = Number(req.params.id);
    const info = await TicketsDAO.GetTicketInfoById(ticket_id);

    // Проверка на владельца билета
    if (!req.user || info.user_id !== req.user.id) {
      res.redirect(`/profile`);
      return
    }

    // Преобразуем в строку
    const time = TicketsDAO.getAdjustedTime(info.startTime, info.stopTime);

    res.render('pages/ticketConfirmation', {
      title: 'Оформление билета',
      styles: ['styles', 'custom-select'],
      scripts: ['orderTicket', 'custom-select'],
      info,
      time,
      currency: process.env.CURRENCY_SYMBOL || '₽'
    });
  } catch (err) {
    console.error('Ошибка при получении информации о билете:', err);
    res.status(500).send('Ошибка сервера');
  }
}



async function orderTicketController(req, res) {
  try {
    const flight_id = Number(req.params.id);
    const user_id = req.user?.user_id; // Предполагается, что user_id есть в req.user
    const { count, stop_id } = req.body;
    console.log(stop_id);
    if (!user_id) {
      return res.status(401).send('Пользователь не авторизован');
    }

    const ticketData = {
      user_id: user_id,
      flight_id: flight_id,
      stop_id: stop_id,
      count: count,
    };

    const ticket = await TicketsDAO.Create(ticketData);

    // Получаем полную информацию по билету из DAO
    const info = await TicketsDAO.GetTicketInfoById(ticket.ticket_id);
    const time = TicketsDAO.getAdjustedTime(info.startTime, info.stopTime);

    const message = `Ваш билет оформлен!\nОтправление: ${info.startCity}\nПрибытие: ${info.finishCity}\nВремя отправления: ${time}\n Отправление с остановки ${info.stop_name} ${info.stop_address}`;

    await notifyUserById(user_id, message);

    res.redirect(`/profile`);
  } catch (err) {
    console.error('Ошибка при создании билета:', err);
    res.status(400).send(`Ошибка: ${err.message}`);
  }
}


async function deleteTicket(req, res) {
  try {
    const { ticket_id } = req.body;
    const user = req.user;
    
    if (!ticket_id || !user) {
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    const ticket = await TicketsDAO.GetById(ticket_id);

    if (!ticket) {
      return res.status(404).json({ message: 'Билет не найден' });
    }

    if (ticket.user_id !== user.user_id) {
      return res.status(403).json({ message: 'Нет доступа к этому билету' });
    }
    const info = await TicketsDAO.GetTicketInfoById(ticket.ticket_id);

    const time = TicketsDAO.getAdjustedTime(info.startTime, info.stopTime);

    const message = `Ваш билет отменен!\nОтправление: ${info.startCity}\nПрибытие: ${info.finishCity}\nВремя отправления: ${time}\n Отправление с остановки ${info.stop_name} ${info.stop_address}`;

    await notifyUserById(user.user_id, message);
    await TicketsDAO.Delete(ticket_id);

    res.json({ message: 'Билет удалён' });
  } catch (error) {
    console.error('Ошибка при удалении билета:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}


async function editTicketPage(req, res) {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).send('Некорректный ID билета');
    }
    const ticket = await TicketsDAO.GetTicketInfoById(ticketId);
    if (!ticket) {
      return res.status(404).send('Билет не найден');
    }
    const flight = await FlightDAO.getFullFlightInfoById(ticket.flight_id);
    if (!flight) {
      return res.status(404).send('Рейс не найден');
    }

    // Получаем остановки по городу отправления
    const stops = await StopsDAO.GetByCityId(ticket.start_city_id);

    res.render('pages/editTicket', {
      title: 'Изменение билета',
      stops,
      ticket,
      flight,
      styles: ['styles', 'custom-select'],
      scripts: ['orderTicket', 'custom-select']
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы оформления билета:', error);
    res.status(500).send('Ошибка сервера');
  }
}

async function editTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).send('Некорректный ID билета');
    }
    const { stop_id, count } = req.body;
    const user = req.user;

    if (!stop_id || !count || !user) {
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    const ticket = await TicketsDAO.GetById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Билет не найден' });
    }

    if (ticket.user_id !== user.user_id) {
      return res.status(403).json({ message: 'Нет доступа к этому билету' });
    }

    // Передаём старые user_id и flight_id, чтобы они не затерлись
    await TicketsDAO.Update({
      ticket_id: ticketId,
      stop_id,
      count,
      user_id: ticket.user_id,
      flight_id: ticket.flight_id
    });

    res.json({ message: 'Билет обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении билета:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}



module.exports = { orderTicketPage, editTicketPage, editTicket, deleteTicket, orderTicketController, ticketConfirmationPage };
