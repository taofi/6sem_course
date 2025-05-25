const {RouteDAO, CarsDAO, CityDAO} = require('../DB/dao');

module.exports = {
    home: async (req, res) => {
        try {
          const routes = await RouteDAO.getAllWithCityNames();
          const cities = await CityDAO.GetAll();
          res.render('pages/home', {
            title: 'Главная',
            styles: ['styles', 'search-form'],
            scripts: ['search-menu'],
            query: req.query || {},
            routes,
            cities
          });
        } catch (error) {
          console.error('Ошибка загрузки маршрутов:', error);
          res.status(500).send('Ошибка сервера');
        }
    },
  
    about: (req, res) => {
      res.render('pages/about', {
        title: 'О нас',
        styles: ['about'],
        user: req.user
      });
    },
  
    contact: (req, res) => {
      res.render('pages/contact', {
        title: 'Контакты',
        styles: ['contact'],
        user: req.user
      });
    }
  };