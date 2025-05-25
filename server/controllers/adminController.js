const {RouteDAO, DriverDAO, CarsDAO, FlightDAO, CityDAO, StopsDAO, UsersDAO} = require('../DB/dao');

module.exports = {
  renderIndex : async (req, res) => {
    try {
        res.render('pages/admin/index', {
        title: 'Панель админестратора',
        styles: ['styles',  'tables'],
        scripts: ['script'],
        admin: req.user
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

renderAddFlightForm : async (req, res) => {
  try {
    const routes = await RouteDAO.getAllWithCityNames();
    const cars = await CarsDAO.GetAll();
    const drivers = await DriverDAO.GetAll();
    const flights = await FlightDAO.getFullFlightInfo();

    res.render('pages/admin/add-flight', {
      title: 'Рейсы',
      styles: ['styles',  'tables'],
      scripts: ['script'],
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


renderCityPage : async (req, res) => {
    try {
      const cities = await CityDAO.GetAll();
  
      res.render('pages/admin/city', {
        title: 'Города',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

  renderCarsPage : async (req, res) => {
    try {
      const cars = await CarsDAO.GetAll();
  
      res.render('pages/admin/cars', {
        title: 'Мышины',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        cars
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

  renderDriverPage : async (req, res) => {
    try {
      const drivers = await DriverDAO.GetAll();
  
      res.render('pages/admin/driver', {
        title: 'Водители',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        drivers
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

  renderRoutePage : async (req, res) => {
    try {
      const routes = await RouteDAO.GetAll();
      const cities = await CityDAO.GetAll();
  
      res.render('pages/admin/route', {
        title: 'Маршруты',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        routes,
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },

  renderStopsPage : async (req, res) => {
    try {
      const stops = await StopsDAO.GetFormated();
      const cities = await CityDAO.GetAll();
      
      
      res.render('pages/admin/stops', {
        title: 'Остановки',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        stops,
        cities
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },
  renderUserPage : async (req, res) => {
    try {
      const users = await UsersDAO.GetAll();
  
      res.render('pages/admin/user', {
        title: 'Маршруты',
        styles: ['styles', 'tables'],
        scripts: ['script'],
        users
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка сервера');
    }
  },


}