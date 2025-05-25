const DAO = require('../DB/dao');



module.exports = {
  getCities : async (req, res) => {
    try {
      const cities = await DAO.CityDAO.GetAll();  // Получаем все города
      res.json({ cities });
    } catch (err) {
      console.error('Ошибка при получении городов:', err);
      res.status(500).send('Ошибка сервера');
    }
  },
  
  // Получение возможных городов для "Куда" на основе города "Откуда"
  getRoutesFromCity : async (req, res) => {
    try {
      console.log('start');

      const fromCity = req.query.fromCity;
      const routes = await DAO.CityDAO.getRoutesFromCity(fromCity);  // Получаем маршруты для города "Откуда"
      
      const toCities = routes.map(route => route.to);  // Список городов для "Куда"
      console.log(toCities);
      res.json({ toCities });
    } catch (err) {
      console.error('Ошибка при получении маршрутов:', err);
      res.status(500).send('Ошибка сервера');
    }
  }  
};