const { RouteDAO, CarsDAO, FlightDAO, CityDAO, StopsDAO, UsersDAO, TicketsDAO } = require('../DB/dao');
const { notifyUserById } = require('../services/notifyUser');

module.exports = {
  renderIndex: async (req, res) => {
    try {
      res.render('pages/admin/index', {
        title: 'Панель админестратора',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        admin: req.user
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  async ticketsByFlightPage(req, res) {
    try {
      const flightId = Number(req.params.flightId);
      if (isNaN(flightId)) {
        return res.status(400).send('Некорректный ID рейса');
      }

      const tickets = await TicketsDAO.GetTicketsByFlightId(flightId);
      const flights = await FlightDAO.getFullFlightInfoById(flightId);
      flights.travel_time = RouteDAO.formatTime(flights.travel_time);
      res.render('pages/admin/ticketsByFlight', {
        title: `Билеты рейса №${flightId}`,
        styles: ['styles', 'tables'],
        tickets,
        flights
      });
    } catch (err) {
      console.error('Ошибка загрузки билетов:', err);
      res.status(500).send('Ошибка сервера');
    }
  },


  orderTicketPage: async (req, res) => {
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

      res.render('pages/operator/orderTicket', {
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
  },
  async renderUserTicketsPage(req, res) {
    try {
      const userId = req.params.userId;
      const tickets = await TicketsDAO.GetByUserIdWithDetails(userId);
  
      res.render('pages/operator/userTickets', {
        title: 'Билеты пользователя',
        tickets,
        styles: ['styles', 'tables'],
        scripts: [],
      });
    } catch (error) {
      console.error('Ошибка при получении билетов:', error);
      res.status(500).send('Ошибка сервера');
    }
  },

  orderTicketController: async (req, res) => {
    try {
      const flight_id = Number(req.params.id);
      const { count, stop_id, user_id } = req.body;

      const ticketData = {
        user_id: Number(user_id),
        flight_id,
        stop_id,
        count
      };

      const ticket = await TicketsDAO.Create(ticketData);

      const info = await TicketsDAO.GetTicketInfoById(ticket.ticket_id);
      const time = TicketsDAO.getAdjustedTime(info.startTime, info.stopTime);

      const message = `Ваш билет оформлен!\nОтправление: ${info.startCity}\nПрибытие: ${info.finishCity}\nВремя отправления: ${time}\n Отправление с остановки ${info.stop_name} ${info.stop_address}`;

      await notifyUserById(user_id, message);

      res.redirect(`/profile`);
    } catch (err) {
      console.error('Ошибка при создании билета:', err);
      res.status(400).send(`Ошибка: ${err.message}`);
    }
  },

  renderAddFlightForm: async (req, res) => {
    try {
      const routes = await RouteDAO.getAllWithCityNames();
      const cars = await CarsDAO.GetAll();
      const drivers = await UsersDAO.GetDriver();
      const flights = await FlightDAO.getFullFlightInfo();
      console.log(flights);
      res.render('pages/admin/add-flight', {
        title: 'Рейсы',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        routes,
        cars,
        drivers,
        flights,
        currencySymbol: process.env.CURRENCY_SYMBOL || '₽',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  renderOperatorPage: async (req, res) => {
    try {
      const routes = await RouteDAO.getAllWithCityNames();
      const cars = await CarsDAO.GetAll();
      const drivers = await UsersDAO.GetDriver();
      const flights = await FlightDAO.getFullFlightInfo();
      console.log(flights);
      res.render('pages/operator/operator-page', {
        title: 'Рейсы',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        routes,
        cars,
        drivers,
        flights,
        currencySymbol: process.env.CURRENCY_SYMBOL || '₽',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

  renderCityPage: async (req, res) => {
    try {
      const cities = await CityDAO.GetAll();

      res.render('pages/admin/city', {
        title: 'Города',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  async editTicket(req, res) {
    try {
      const ticketId = Number(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).send('Некорректный ID билета');
      }
      const { user_id, stop_id, count } = req.body;
      const user = req.user;
  
      if (!stop_id || !count || !user) {
        return res.status(400).json({ message: 'Некорректные данные' });
      }
  
      const ticket = await TicketsDAO.GetById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({ message: 'Билет не найден' });
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
  },
  
  
  renderCarsPage: async (req, res) => {
    try {
      const cars = await CarsDAO.GetAll();

      res.render('pages/admin/cars', {
        title: 'Мышины',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        cars
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },



  renderRoutePage: async (req, res) => {
    try {
      let routes = await RouteDAO.GetFormatted();
      const cities = await CityDAO.GetAll();

      res.render('pages/admin/route', {
        title: 'Маршруты',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        routes,
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },


  renderStopsPage: async (req, res) => {
    try {
      const stops = await StopsDAO.GetFormated();
      const cities = await CityDAO.GetAll();


      res.render('pages/admin/stops', {
        title: 'Остановки',
        styles: ['styles', 'tables', 'stop-form'],
        scripts: ['script', 'sort', 'search'],
        stops,
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  renderUserPage: async (req, res) => {
    try {
      const users = await UsersDAO.GetAll();

      res.render('pages/admin/user', {
        title: 'Маршруты',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        users
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  renderOperatorUserPage: async (req, res) => {
    try {
      const users = await UsersDAO.GetAll();

      res.render('pages/operator/user', {
        title: 'Пользователи',
        styles: ['styles', 'tables'],
        scripts: ['script', 'sort', 'search'],
        users
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  async editTicketPage(req, res) {
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
  
      res.render('pages/operator/editTicket', {
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
  },
}